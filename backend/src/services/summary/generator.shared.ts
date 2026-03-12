import { logger } from "../../config/logger.js";
import {
  MeetingSummaryPartial,
  SchemaField,
} from "../../types/index.js";
import { callLLM } from "./llm.client.js";
import { pickSummarySchema } from "./prompt.builder.js";

export interface GeneratorContext {
  language?: string;
  summaryLength?: "brief" | "medium" | "detailed";
  attempt: number;
}

export interface SummaryGeneratorDefinition {
  name: string;
  fields: readonly SchemaField[];
  promptSections: string;
  maxOutputTokens: number;
}

function buildLanguageInstruction(language?: string): string {
  if (!language || language === "en") return "";

  return (
    `The transcript may be in a non-English language (language code: ${language}). ` +
    "Analyze it as-is and produce the structured output in ENGLISH regardless.\n\n"
  );
}

export async function runSummaryGenerator(
  transcript: string,
  context: GeneratorContext,
  definition: SummaryGeneratorDefinition,
): Promise<MeetingSummaryPartial> {
  const schema = pickSummarySchema(definition.fields);

  const { output, usage, finishReason } = await callLLM<
    MeetingSummaryPartial,
    typeof schema
  >({
    transcript,
    promptSections: definition.promptSections,
    attempt: context.attempt,
    languageInstruction: buildLanguageInstruction(context.language),
    schema,
    maxOutputTokens: definition.maxOutputTokens,
    outputName: definition.name,
  });

  logger.info(`${definition.name} generator succeeded`, {
    attempt: context.attempt,
    finishReason,
    fields: [...definition.fields],
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  });

  return output;
}
