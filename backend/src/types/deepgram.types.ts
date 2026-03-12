export interface DeepgramWord {
  word: string;
  punctuated_word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words: DeepgramWord[];
}

export interface DeepgramResultMessage {
  type: "Results";
  channel_index: [number, number];
  duration: number;
  start: number;
  is_final: boolean;
  speech_final: boolean;
  channel: {
    alternatives: DeepgramAlternative[];
  };
}

export interface DeepgramUtteranceEndMessage {
  type: "UtteranceEnd";
  channel: number[];
  last_word_end: number;
}

export interface DeepgramSpeechStartedMessage {
  type: "SpeechStarted";
  channel: number[];
  timestamp: number;
}

export type DeepgramLiveMessage =
  | DeepgramResultMessage
  | DeepgramUtteranceEndMessage
  | DeepgramSpeechStartedMessage;

export interface TranscriptSegment {
  speaker: string | null;
  text: string;
  start?: number;
  end?: number;
}

export interface SessionStartedPayload {
  sessionId: string;
}

export interface TranscriptPartialPayload {
  text: string;
  speaker: string | null;
  sessionId: string;
}

export interface TranscriptFinalPayload {
  text: string;
  speaker: string | null;
  segments: TranscriptSegment[];
  sessionId: string;
}

export interface TranscriptCorrectedPayload {
  sessionId: string;
  segments: TranscriptSegment[];
  transcript: string;
  speakerCount: number;
}

export interface SessionStoppedPayload {
  sessionId: string;
  transcript: string;
}

export interface SessionErrorPayload {
  message: string;
}

export type AudioEncoding = "webm-opus" | "linear16";

export interface AudioConfig {
  encoding: AudioEncoding;
  sampleRate?: number;
  channels?: number;
}