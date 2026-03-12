import { Server, Socket } from "socket.io";
import { TranscriptStore } from "../cache/transcript";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { StoredSession } from "../types";
import {
  SessionErrorPayload,
  SessionStartedPayload,
  SessionStoppedPayload,
  TranscriptCorrectedPayload,
  TranscriptFinalPayload,
  TranscriptPartialPayload,
} from "../types/deepgram.types";
import { DeepgramLiveService } from "./deepgram.service";
import { GladiaDiarizationService } from "./diarzation.service"; // AssemblyAI — unchanged
import { SessionStore } from "./session.service";

// ── Emit helpers ──────────────────────────────────────────────────────────────

function emitSessionStarted(socket: Socket, payload: SessionStartedPayload) {
  socket.emit("session-started", payload);
}
function emitPartial(socket: Socket, payload: TranscriptPartialPayload) {
  socket.emit("transcript-partial", payload);
}
function emitFinal(socket: Socket, payload: TranscriptFinalPayload) {
  socket.emit("transcript-final", payload);
}
function emitCorrected(socket: Socket, payload: TranscriptCorrectedPayload) {
  socket.emit("transcript-corrected", payload);
}
function emitStopped(socket: Socket, payload: SessionStoppedPayload) {
  socket.emit("session-stopped", payload);
}
function emitError(socket: Socket, payload: SessionErrorPayload) {
  socket.emit("session-error", payload);
}

// ── Dependency injection ──────────────────────────────────────────────────────

export interface RealtimeHandlerDeps {
  sessionStore?: SessionStore;
  transcriptStore?: TranscriptStore;
  diarizationService?: GladiaDiarizationService;
}

// ── Cleanup helpers ───────────────────────────────────────────────────────────

async function rollbackFailedSessionStart(
  transcriptStore: TranscriptStore,
  sessionId: string,
  liveService: DeepgramLiveService | null,
): Promise<void> {
  if (liveService) {
    await liveService.close().catch((err) => {
      logger.warn("Failed to close live service after start error", {
        err,
        sessionId,
      });
    });
  }
  await transcriptStore.deleteSession(sessionId);
}

async function persistAbortedSession(
  transcriptStore: TranscriptStore,
  session: StoredSession,
  reason: "disconnect" | "ttl_expired",
): Promise<void> {
  await session.liveService.close().catch((err) => {
    logger.warn("Failed to close live service for aborted session", {
      err,
      reason,
      sessionId: session.sessionId,
    });
  });

  let transcript = "";
  try {
    transcript = await transcriptStore.getTranscript(session.sessionId);
  } catch (err) {
    logger.error("Failed to load transcript during session cleanup", {
      err,
      reason,
      sessionId: session.sessionId,
    });
  }

  await transcriptStore.updateStatus(session.sessionId, "ERROR", transcript);

  logger.warn("Session ended before stop-session", {
    reason,
    sessionId: session.sessionId,
    transcriptLength: transcript.length,
  });
}

// ── Main registration ─────────────────────────────────────────────────────────

export function registerRealtimeHandlers(
  io: Server,
  deps: RealtimeHandlerDeps = {},
): void {
  const transcriptStore = deps.transcriptStore ?? new TranscriptStore();
  const sessionStore =
    deps.sessionStore ??
    new SessionStore({
      onExpire: async (_socketId, session) => {
        await persistAbortedSession(transcriptStore, session, "ttl_expired");
      },
    });
  const diarizationService =
    deps.diarizationService ?? new GladiaDiarizationService();

  io.on("connection", (socket: Socket) => {
    logger.info("Client connected", { socketId: socket.id });

    // ── START SESSION ─────────────────────────────────────────────────────────
    socket.on("start-session", async () => {
      const activeSession = sessionStore.get(socket.id);
      if (activeSession) {
        logger.warn("Rejected duplicate start-session", {
          socketId: socket.id,
          sessionId: activeSession.sessionId,
        });
        emitError(socket, { message: "Session already active" });
        return;
      }

      let sessionId: string | null = null;
      let liveService: DeepgramLiveService | null = null;

      try {
        sessionId = await transcriptStore.createSession();
        liveService = new DeepgramLiveService(sessionId, env.DEEPGRAM_API_KEY);
        const activeSessionId = sessionId;

        liveService.on("transcript", async (event) => {
          if (!event.isFinal) {
            // ── Partial: text only — no speaker label ───────────────────────
            // Deepgram speaker labels on partials are unreliable.
            // AssemblyAI will provide the accurate labels after the session.
            emitPartial(socket, {
              text: event.text,
              speaker: null,          // ← intentionally null
              sessionId: activeSessionId,
            });
            return;
          }

          // ── Final utterance: persist text only, no speaker labels ──────────
          // We store segments without speaker attribution because Deepgram's
          // live speaker numbering may not match AssemblyAI's final numbering.
          // AssemblyAI transcript-corrected replaces this entirely.
          const textOnlySegments = event.segments.map((seg) => ({
            ...seg,
            speaker: null, // ← strip Deepgram speaker label
          }));

          await transcriptStore.appendSegments(activeSessionId, textOnlySegments);

          emitFinal(socket, {
            text: event.text,
            speaker: null,            // ← intentionally null
            segments: [],             // ← empty: AssemblyAI owns segments
            sessionId: activeSessionId,
          });

          logger.debug("Live final utterance (text only)", {
            sessionId: activeSessionId,
            text: event.text,
          });
        });

        liveService.on("error", (err) => {
          logger.error("Deepgram WS error", { err, sessionId: activeSessionId });
          emitError(socket, { message: "Transcription error" });
        });

        liveService.on("close", (code) => {
          logger.info("Deepgram WS closed", { code, sessionId: activeSessionId });
        });

        sessionStore.create(socket.id, activeSessionId, liveService);
        await liveService.connect();

        emitSessionStarted(socket, { sessionId: activeSessionId });
        logger.info("Session ready", {
          sessionId: activeSessionId,
          socketId: socket.id,
        });
      } catch (err) {
        const isDuplicateStart =
          err instanceof Error &&
          err.message.includes("Active session already exists");

        logger[isDuplicateStart ? "warn" : "error"]("Failed to start session", {
          err,
          sessionId,
        });

        if (sessionId) {
          const existing = sessionStore.get(socket.id);
          if (existing?.sessionId === sessionId) {
            sessionStore.delete(socket.id);
          }
          await rollbackFailedSessionStart(transcriptStore, sessionId, liveService);
        }

        emitError(socket, {
          message: isDuplicateStart
            ? "Session already active"
            : "Failed to start session",
        });
      }
    });

    // ── AUDIO CHUNK ───────────────────────────────────────────────────────────
    socket.on("audio-chunk", (chunk: ArrayBuffer | Buffer) => {
      const session = sessionStore.get(socket.id);
      if (!session) return;

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

      // Forward to Deepgram for live transcript text
      session.liveService.sendAudio(buffer);

      // Buffer locally — AssemblyAI gets the full audio after session ends
      sessionStore.appendAudio(socket.id, buffer);
    });

    // ── STOP SESSION ──────────────────────────────────────────────────────────
    socket.on("stop-session", async () => {
      const session = sessionStore.get(socket.id);
      if (!session) return;

      try {
        // CloseStream → waits up to 2s for Deepgram to drain final words
        await session.liveService.close();

        const liveTranscript = await transcriptStore.getTranscript(
          session.sessionId,
        );

        await transcriptStore.updateStatus(
          session.sessionId,
          "TRANSCRIBING",
          liveTranscript,
        );

        const audioChunks = session.audioChunks.slice();
        const { sessionId } = session;
        const { audioBufferTruncated, totalAudioBytes } = session;
        sessionStore.delete(socket.id);

        // Unblock frontend immediately with plain live transcript (no speakers)
        emitStopped(socket, { sessionId, transcript: liveTranscript });

        if (audioBufferTruncated) {
          logger.warn(
            "Skipping AssemblyAI post-processing — buffered audio is incomplete",
            { sessionId, bufferedMB: (totalAudioBytes / 1024 / 1024).toFixed(1) },
          );
          await transcriptStore.updateStatus(sessionId, "DONE", liveTranscript);
          return;
        }

        logger.info("Launching async AssemblyAI post-processing", {
          sessionId,
          bufferedMB: (totalAudioBytes / 1024 / 1024).toFixed(1),
        });

        // Fire-and-forget — AssemblyAI hears full audio, returns accurate speakers
        diarizationService
          .run(audioChunks, sessionId)
          .then(async ({ segments, transcript, speakerCount }) => {
            await transcriptStore.setTranscript(sessionId, transcript);

            // This replaces ALL Deepgram live labels on the frontend
            emitCorrected(socket, {
              sessionId,
              segments,   // ← accurate Speaker 0, 1, 2... from AssemblyAI
              transcript,
              speakerCount,
            });

            logger.info("AssemblyAI post-processing complete", {
              sessionId,
              speakerCount,
              segmentCount: segments.length,
            });
          })
          .catch((err) => {
            logger.error("AssemblyAI post-processing failed", { err, sessionId });
            transcriptStore.updateStatus(sessionId, "DONE").catch(() => {});
          });
      } catch (err) {
        logger.error("Failed to stop session", { err });
        emitError(socket, { message: "Failed to stop session" });
      }
    });

    // ── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const session = sessionStore.delete(socket.id);
      if (session) {
        await persistAbortedSession(transcriptStore, session, "disconnect");
      }
      logger.info("Client disconnected", { socketId: socket.id });
    });
  });
}
