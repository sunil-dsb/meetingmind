import { logger } from "../config/logger";
import { SessionStoreLimits, SessionStoreOptions, StoredSession } from "../types";
import { DEFAULTS } from "../utils/constant";
import { DeepgramLiveService } from "./deepgram.service";

export class SessionStore {
  private readonly sessions = new Map<string, StoredSession>();
  private readonly opts: SessionStoreLimits;
  private readonly onExpire?: SessionStoreOptions["onExpire"];

  constructor(options: SessionStoreOptions = {}) {
    this.opts = {
      maxSessionMs: options.maxSessionMs ?? DEFAULTS.maxSessionMs,
      maxAudioBytes: options.maxAudioBytes ?? DEFAULTS.maxAudioBytes,
    };
    this.onExpire = options.onExpire;
  }

  get(socketId: string): StoredSession | undefined {
    return this.sessions.get(socketId);
  }

  create(
    socketId: string,
    sessionId: string,
    liveService: DeepgramLiveService,
  ): StoredSession {
    if (this.sessions.has(socketId)) {
      throw new Error(`Active session already exists for socket ${socketId}`);
    }

    const ttlTimer = setTimeout(() => {
      const expiredSession = this.delete(socketId);
      if (!expiredSession) return;

      logger.warn("Session TTL expired — forcing eviction", {
        socketId,
        sessionId,
      });

      if (this.onExpire) {
        void Promise.resolve(this.onExpire(socketId, expiredSession)).catch(
          (err) => {
            logger.error("Expired session cleanup failed", {
              err,
              socketId,
              sessionId,
            });
          },
        );
      }
    }, this.opts.maxSessionMs);

    const stored: StoredSession = {
      liveService,
      sessionId,
      audioChunks: [],
      totalAudioBytes: 0,
      audioBufferTruncated: false,
      startedAt: Date.now(),
      ttlTimer,
    };

    this.sessions.set(socketId, stored);
    return stored;
  }

  appendAudio(socketId: string, chunk: Buffer): boolean {
    const session = this.sessions.get(socketId);
    if (!session) return false;

    if (session.totalAudioBytes + chunk.length > this.opts.maxAudioBytes) {
      if (!session.audioBufferTruncated) {
        session.audioBufferTruncated = true;
        logger.warn("Audio buffer cap reached — dropping subsequent chunks", {
          socketId,
          sessionId: session.sessionId,
          capBytes: this.opts.maxAudioBytes,
        });
      }
      return false;
    }

    session.audioChunks.push(chunk);
    session.totalAudioBytes += chunk.length;
    return true;
  }

  delete(socketId: string): StoredSession | undefined {
    const session = this.sessions.get(socketId);
    if (!session) return undefined;
    clearTimeout(session.ttlTimer);
    this.sessions.delete(socketId);
    return session;
  }

  get size(): number {
    return this.sessions.size;
  }
}