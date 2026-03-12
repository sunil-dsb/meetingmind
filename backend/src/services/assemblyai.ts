import { AssemblyAI } from "assemblyai";
import fs from "fs";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { TranscriptionResult, Utterance } from "../types";
import { AppError } from "../utils/error";

const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY });

export interface TranscribeConfig {
  language?: string;
  speakerDiarization?: boolean;
}

type AudioInput = string | Buffer;

async function transcribeAudioInput(
  audio: AudioInput,
  inputType: "file" | "buffer",
  config: TranscribeConfig = {},
): Promise<TranscriptionResult> {
  if (inputType === "file" && !fs.existsSync(audio)) {
    throw new Error("File not found: " + audio);
  }

  const { language = "en", speakerDiarization = true } = config;

  logger.info("Uploading to AssemblyAI", {
    inputType,
    language,
    speakerDiarization,
    ...(inputType === "file"
      ? { filePath: audio }
      : { bytes: Buffer.byteLength(audio) }),
  });

  const result = await client.transcripts.transcribe({
    audio,
    speaker_labels: speakerDiarization,
    punctuate: true,
    speech_models: ["universal-2"],
    // Only set language_code when a non-English language is specified.
    // Passing "en" explicitly is skipped to allow AssemblyAI's multilingual auto-detection.
    ...(language && language !== "en" ? { language_code: language } : {}),
  });

  if (result.status === "error") {
    throw new AppError(
      `AssemblyAI failed: ${result.error ?? "unknown"}`,
      502,
      "TRANSCRIPTION_FAILED",
    );
  }

  logger.info("Transcription complete", { duration: result.audio_duration });

  const utterances: Utterance[] = (result.utterances ?? []).map((u) => ({
    speaker: `Speaker ${u.speaker}`,
    text: u.text,
    startMs: u.start,
    endMs: u.end,
  }));

  const transcript =
    utterances.length > 0
      ? utterances.map((u) => `${u.speaker}: ${u.text}`).join("\n")
      : (result.text ?? "");

  return {
    transcript,
    utterances,
    durationSeconds: result.audio_duration ?? 0,
  };
}

export async function transcribeAudio(
  filePath: string,
  config: TranscribeConfig = {},
): Promise<TranscriptionResult> {
  return transcribeAudioInput(filePath, "file", config);
}

export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  config: TranscribeConfig = {},
): Promise<TranscriptionResult> {
  return transcribeAudioInput(audioBuffer, "buffer", config);
}
