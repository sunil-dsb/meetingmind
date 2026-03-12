import { MeetingSummaryPartial, SchemaField } from "../../types/index.js";
import { GeneratorContext, runSummaryGenerator } from "./generator.shared.js";

const SUMMARY_FIELDS = [
  "title",
  "conversationType",
  "oneLineSummary",
  "sentiment",
  "fullSummary",
  "participants",
  "mainTopics",
  "keyPoints",
  "toneAnalysis",
  "tags",
  "speakerBreakdown",
] as const satisfies readonly SchemaField[];

export async function generateSummary(
  transcript: string,
  context: GeneratorContext,
): Promise<MeetingSummaryPartial> {
  const summaryLength = context.summaryLength ?? "medium";

  const lengthInstruction =
    summaryLength === "brief"
      ? "Write fullSummary as ONE concise paragraph (~80 words max)."
      : summaryLength === "detailed"
        ? "Write fullSummary as a thorough multi-paragraph breakdown covering all angles (~400 words)."
        : "Write fullSummary in 3 balanced paragraphs (~200 words total).";

  return runSummaryGenerator(transcript, context, {
    name: "SummaryGenerator",
    fields: SUMMARY_FIELDS,
    maxOutputTokens: 1800,
    promptSections: [
      "Populate these fields only:",
      "- title: specific descriptive title",
      "- conversationType: detect the conversation type from the transcript",
      "- oneLineSummary: one sentence capturing the outcome, not just the topic",
      "- sentiment: overall tone of the conversation",
      `- fullSummary: ${lengthInstruction}`,
      "- participants: names if present, otherwise speaker labels",
      "- mainTopics: each as a specific statement, not a one-word topic",
      "- keyPoints: the most important points discussed",
      "- toneAnalysis: 2 concise sentences on tone, power dynamic, and relationship quality",
      "- tags: 3-6 short keyword tags",
      "- speakerBreakdown: one useful statement per speaker",
    ].join("\n"),
  });
}

