import { logger } from "../config/logger";
import { DiarizationResult } from "../types";
import { buildWavBuffer } from "../utils/wav";
import { transcribeAudioBuffer } from "./assemblyai";

export interface DiarizationOptions {
  language?: string;
  speakerDiarization?: boolean;
}

const DEFAULTS: Required<DiarizationOptions> = {
  language: "en",
  speakerDiarization: true,
};

export class GladiaDiarizationService {
  private readonly options: Required<DiarizationOptions>;

  constructor(options: DiarizationOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  async run(audioChunks: Buffer[], sessionId: string): Promise<DiarizationResult> {
    logger.info("Starting async transcription with AssemblyAI", { sessionId });

    const wav = buildWavBuffer(audioChunks);
    logger.info("WAV built", { sessionId, bytes: wav.length });

    const result = await transcribeAudioBuffer(wav, {
      language: this.options.language,
      speakerDiarization: this.options.speakerDiarization,
    });

    const segments = result.utterances.map((u) => ({
      speaker: u.speaker,
      text: u.text.trim(),
    }));
    const speakerCount = new Set(result.utterances.map((u) => u.speaker)).size;

    logger.info("AssemblyAI transcription complete", {
      sessionId,
      speakerCount,
      segmentCount: segments.length,
    });

    return {
      segments,
      transcript: result.transcript,
      speakerCount,
    };
  }
}
