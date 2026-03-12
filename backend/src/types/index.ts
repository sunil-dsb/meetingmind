import z from "zod";
import { DeepgramLiveService } from "../services/deepgram.service";
import { MeetingSummarySchema } from "../validators/summary";

// ── Transcription ─────────────────────────────────────────────
export interface Utterance {
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
}

export interface TranscriptionResult {
  transcript: string;
  utterances: Utterance[];
  durationSeconds: number;
}

export interface DiarizationResult {
  segments: Array<{
    speaker: string;
    text: string;
  }>;
  transcript: string;
  speakerCount: number;
}

export type MeetingSummaryOutput = z.infer<typeof MeetingSummarySchema>;
export type MeetingSummary = MeetingSummaryOutput;
export type MeetingSummaryPartial = Partial<MeetingSummaryOutput>;
export type ActionItem = MeetingSummaryOutput["actionItems"][number];
export type MeetingSentiment = MeetingSummaryOutput["sentiment"];

// ── API Response shape ────────────────────────────────────────
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type SchemaField = keyof MeetingSummaryOutput;

export type SchemaShape = typeof MeetingSummarySchema.shape;

export interface StoredSession {
  liveService: DeepgramLiveService;
  sessionId: string;
  audioChunks: Buffer[];
  totalAudioBytes: number;
  audioBufferTruncated: boolean;
  startedAt: number;
  ttlTimer: NodeJS.Timeout;
}

export interface SessionStoreOptions {
  maxSessionMs?: number;
  maxAudioBytes?: number;
  onExpire?: (
    socketId: string,
    session: StoredSession,
  ) => void | Promise<void>;
}

export type SessionStoreLimits = Required<
  Pick<SessionStoreOptions, "maxSessionMs" | "maxAudioBytes">
>;
