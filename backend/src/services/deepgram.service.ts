// ─────────────────────────────────────────────────────────────────────────────
// services/deepgram.service.ts
//
// YOUR FRONTEND sends: raw Linear16 PCM, 16 kHz, mono (AudioWorklet).
// This file is hardwired to match that exactly.
//
// Root cause of blank live transcript:
//   Previous version defaulted to webm-opus — Deepgram received raw PCM but
//   tried to parse it as a WebM container → decoded nothing → silence.
//   Fix: explicitly declare encoding=linear16, sample_rate=16000, channels=1.
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";
import WebSocket from "ws";
import { logger } from "../config/logger";
import {
    DeepgramLiveMessage,
    DeepgramResultMessage,
    DeepgramWord,
    TranscriptSegment,
} from "../types/deepgram.types";

const DEEPGRAM_WS_URL = "wss://api.deepgram.com/v1/listen";

// ── Public event contract (identical to old GladiaLiveService) ────────────────

export interface LiveTranscriptEvent {
  isFinal: boolean;
  text: string;
  speaker: string | null;
  segments: TranscriptSegment[];
}

export declare interface DeepgramLiveService {
  on(event: "transcript", listener: (e: LiveTranscriptEvent) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "close", listener: (code: number) => void): this;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class DeepgramLiveService extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly sessionId: string;
  private readonly apiKey: string;

  /**
   * Accumulates is_final (word-locked) chunks between speech_final /
   * UtteranceEnd flushes so the frontend always receives complete sentences.
   */
  private utteranceBuffer: DeepgramWord[] = [];
  private isClosing = false;

  constructor(sessionId: string, apiKey: string) {
    super();
    this.sessionId = sessionId;
    this.apiKey = apiKey;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    const url = this.buildWsUrl();

    this.ws = new WebSocket(url, {
      headers: { Authorization: `Token ${this.apiKey}` },
    });

    await new Promise<void>((resolve, reject) => {
      this.ws!.once("open", resolve);
      this.ws!.once("error", reject);
    });

    this.ws.on("message", (raw) => this.handleMessage(raw));
    this.ws.on("error", (err) => this.emit("error", err));
    this.ws.on("close", (code) => {
      this.emit("close", code);
      logger.info("Deepgram WS closed", { code, sessionId: this.sessionId });
    });

    logger.info("Deepgram live WS open", {
      sessionId: this.sessionId,
      encoding: "linear16",
      sampleRate: 16000,
      channels: 1,
    });
  }

  sendAudio(chunk: Buffer): void {
    if (this.ws?.readyState === WebSocket.OPEN && !this.isClosing) {
      this.ws.send(chunk);
    }
  }

  async close(): Promise<void> {
    if (this.isClosing || !this.ws) return;
    this.isClosing = true;

    if (this.ws.readyState === WebSocket.OPEN) {
      // Tell Deepgram to flush remaining audio and emit final transcripts
      this.ws.send(JSON.stringify({ type: "CloseStream" }));

      // Wait up to 2s for Deepgram to drain before hard-closing
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 2000);
        this.ws!.once("close", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close(1000);
      }
    }

    this.ws = null;
  }

  // ── Message handling ────────────────────────────────────────────────────────

  private handleMessage(raw: WebSocket.RawData): void {
    let msg: DeepgramLiveMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "Results":
        this.handleResults(msg);
        break;

      case "UtteranceEnd":
        // Noisy-room / overlapping-speech fallback flush
        this.flushBuffer("utterance_end");
        break;

      case "SpeechStarted":
        // Informational only
        break;

      default:
        break;
    }
  }

  private handleResults(msg: DeepgramResultMessage): void {
    const alt = msg.channel.alternatives[0];
    if (!alt) return;

    const text = alt.transcript.trim();
    if (!text) return;

    if (!msg.is_final) {
      // ── Interim: emit immediately for live rolling display ────────────────
      this.emit("transcript", {
        isFinal: false,
        text,
        speaker: this.dominantSpeaker(alt.words),
        segments: [],
      } satisfies LiveTranscriptEvent);
      return;
    }

    // ── is_final=true: words are locked — buffer until sentence boundary ─────
    this.utteranceBuffer.push(...alt.words);

    if (msg.speech_final) {
      this.flushBuffer("speech_final");
    }
    // else: hold — UtteranceEnd will flush as the safety-net fallback
  }

  // ── Buffer flush ────────────────────────────────────────────────────────────

  private flushBuffer(reason: "speech_final" | "utterance_end"): void {
    if (this.utteranceBuffer.length === 0) return;

    const words = this.utteranceBuffer;
    this.utteranceBuffer = [];

    const text = words
      .map((w) => w.punctuated_word ?? w.word)
      .join(" ")
      .trim();

    if (!text) return;

    logger.debug("Deepgram utterance flushed", {
      reason,
      sessionId: this.sessionId,
      wordCount: words.length,
      text,
    });

    this.emit("transcript", {
      isFinal: true,
      text,
      speaker: this.dominantSpeaker(words),
      segments: this.buildSegments(words),
    } satisfies LiveTranscriptEvent);
  }

  // ── Speaker helpers ─────────────────────────────────────────────────────────

  /**
   * Returns the label of the speaker with the most words in this chunk.
   * Returns null if Deepgram hasn't returned diarization data yet.
   */
  private dominantSpeaker(words: DeepgramWord[]): string | null {
    const counts = new Map<number, number>();
    for (const w of words) {
      if (w.speaker !== undefined) {
        counts.set(w.speaker, (counts.get(w.speaker) ?? 0) + 1);
      }
    }
    if (counts.size === 0) return null;
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
    return `Speaker ${top}`;
  }

  /**
   * Groups consecutive same-speaker words into TranscriptSegments.
   * Uses punctuated_word for clean display text.
   * Includes start/end timestamps for downstream AssemblyAI alignment.
   */
  private buildSegments(words: DeepgramWord[]): TranscriptSegment[] {
    if (words.length === 0) return [];

    const segments: TranscriptSegment[] = [];
    let curSpeaker = words[0]!.speaker ?? 0;
    let curWords: string[] = [];
    let segStart = words[0]!.start;

    for (let i = 0; i < words.length; i++) {
      const w = words[i]!;
      const wSpeaker = w.speaker ?? 0;

      if (wSpeaker === curSpeaker) {
        curWords.push(w.punctuated_word ?? w.word);
      } else {
        segments.push({
          speaker: `Speaker ${curSpeaker}`,
          text: curWords.join(" "),
          start: segStart,
          end: words[i - 1]?.end,
        });
        curSpeaker = wSpeaker;
        curWords = [w.punctuated_word ?? w.word];
        segStart = w.start;
      }
    }

    if (curWords.length > 0) {
      segments.push({
        speaker: `Speaker ${curSpeaker}`,
        text: curWords.join(" "),
        start: segStart,
        end: words[words.length - 1]?.end,
      });
    }

    return segments;
  }

  // ── URL builder ─────────────────────────────────────────────────────────────

  private buildWsUrl(): string {
    const params = new URLSearchParams({
      // ── Model ──────────────────────────────────────────────────────────────
      model:              "nova-3",    // Best overall WER for live streaming
      language:           "en",

      // ── Audio format — MUST match your AudioWorklet output exactly ─────────
      encoding:           "linear16", // Raw PCM int16 (what your worklet sends)
      sample_rate:        "16000",    // Matches AudioContext({ sampleRate: 16000 })
      channels:           "1",        // Matches channelCount: 1 in getUserMedia

      // ── Accuracy ───────────────────────────────────────────────────────────
      smart_format:       "true",     // Auto-format numbers, dates, currency
      punctuate:          "true",     // Proper punctuation in live display
      diarize:            "true",     // Per-word speaker labels in real-time
      filler_words:       "false",    // Remove "um", "uh" from transcript

      // ── Latency / sentence boundaries ──────────────────────────────────────
      interim_results:    "true",     // Show words ~150ms after spoken
      endpointing:        "300",      // Flush after 300ms silence (meeting cadence)
      utterance_end_ms:   "1200",     // Backup flush for noisy/overlapping speech
    });

    return `${DEEPGRAM_WS_URL}?${params.toString()}`;
  }
}