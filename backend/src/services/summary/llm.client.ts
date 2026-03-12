import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";

const LLM_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`LLM call timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export interface CallLLMParams<TSchema extends z.ZodTypeAny> {
  transcript: string;
  promptSections: string;
  attempt: number;
  languageInstruction?: string;
  schema: TSchema;
  maxOutputTokens: number;
  outputName?: string;
}

export async function callLLM<TOutput, TSchema extends z.ZodTypeAny>({
  transcript,
  promptSections,
  attempt,
  languageInstruction = "",
  schema,
  maxOutputTokens,
  outputName = "MeetingSummary",
}: CallLLMParams<TSchema>): Promise<{
  output: TOutput;
  usage: any;
  finishReason: string;
}> {
  const { output, usage, finishReason } = await withTimeout(
    Promise.resolve().then(() =>
      generateText({
        model: openrouter.chat("meta-llama/llama-4-maverick", {
          plugins: [{ id: "response-healing" }],
        }),
        output: Output.object({
          schema,
          name: outputName,
          description: "Structured analysis of a conversation",
        }),
        temperature: attempt === 1 ? 0.3 : 0.1,
        maxOutputTokens,
        system:
          "You are an expert conversation analyst with 20 years of experience. " +
          "Analyze ANY conversation type — business, medical, legal, casual, technical. " +
          "Detect the conversation type first — it shapes your entire analysis. " +
          "Be SPECIFIC — every point must be useful without reading the transcript. " +
          "When told to leave fields empty, set strings to '' and arrays to []. " +
          "Never invent information not present in the transcript.",
        prompt:
          languageInstruction +
          promptSections +
          "\n\nDomain-specific rules:\n" +
          "- Medical: symptoms, diagnoses, treatments, medications, follow-ups\n" +
          "- Legal: clauses, obligations, rights, risks, deadlines\n" +
          "- Business: decisions, action items, strategy, blockers\n" +
          "- Sales: objections, agreements, pricing, next steps\n" +
          "- Casual: topics discussed, plans made, agreements\n\n" +
          `TRANSCRIPT:\n${transcript}`,
      }),
    ),
    LLM_TIMEOUT_MS,
  );

  return { output: output as TOutput, usage, finishReason };
}
