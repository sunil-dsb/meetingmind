import { MeetingSummaryPartial, SchemaField } from "../../types/index.js";
import { GeneratorContext, runSummaryGenerator } from "./generator.shared.js";

const DECISION_FIELDS = ["decisions"] as const satisfies readonly SchemaField[];

export async function generateDecisions(
  transcript: string,
  context: GeneratorContext,
): Promise<MeetingSummaryPartial> {
  return runSummaryGenerator(transcript, context, {
    name: "DecisionsGenerator",
    fields: DECISION_FIELDS,
    maxOutputTokens: 500,
    promptSections: [
      "Populate these fields only:",
      "- decisions: concrete decisions, agreements, or final outcomes reached in the conversation",
      "Use an empty array if no real decision was made.",
      "Do not include action items or open questions here unless they were explicitly decided.",
    ].join("\n"),
  });
}

