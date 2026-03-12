import { z } from "zod";

export const summarizeBodySchema = z.object({
  transcript: z
    .string({ error: "Transcript is required" })
    .min(20, "Transcript must be at least 20 characters")
    .max(50_000, "Transcript too long — max 50,000 characters"),
  language: z.string().optional().default("en"),
  summaryLength: z.enum(["brief", "medium", "detailed"]).optional().default("medium"),
  selectedOutputs: z.array(z.string()).optional().default(["summary", "action_items", "pdf"]),
});

export type SummarizeBody = z.infer<typeof summarizeBodySchema>;

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm;codecs=opus",
] as const;