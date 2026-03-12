import { MeetingSummaryPartial, SchemaField } from "../../types/index.js";
import { GeneratorContext, runSummaryGenerator } from "./generator.shared.js";

const RISK_FIELDS = [
  "risks",
  "keyMetrics",
  "insights",
] as const satisfies readonly SchemaField[];

export async function generateRisks(
  transcript: string,
  context: GeneratorContext,
): Promise<MeetingSummaryPartial> {
  return runSummaryGenerator(transcript, context, {
    name: "RisksGenerator",
    fields: RISK_FIELDS,
    maxOutputTokens: 900,
    promptSections: [
      "Populate these fields only:",
      "- risks: concerns, blockers, unresolved issues, warnings, or red flags",
      "- keyMetrics: important numbers, dates, amounts, deadlines, dosages, or percentages mentioned",
      "- insights: deeper observations such as urgency signals, hidden tension, avoided topics, or unspoken concerns",
      "Use empty arrays if the transcript does not contain enough evidence for a field.",
    ].join("\n"),
  });
}

