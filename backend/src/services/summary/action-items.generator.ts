import { MeetingSummaryPartial, SchemaField } from "../../types/index.js";
import { GeneratorContext, runSummaryGenerator } from "./generator.shared.js";

const ACTION_ITEM_FIELDS = [
  "actionItems",
  "nextSteps",
  "followUpQuestions",
] as const satisfies readonly SchemaField[];

export async function generateActionItems(
  transcript: string,
  context: GeneratorContext,
): Promise<MeetingSummaryPartial> {
  return runSummaryGenerator(transcript, context, {
    name: "ActionItemsGenerator",
    fields: ACTION_ITEM_FIELDS,
    maxOutputTokens: 900,
    promptSections: [
      "Populate these fields only:",
      "- actionItems: tasks with owner, task description, due date, and priority (High/Medium/Low)",
      "- nextSteps: specific actionable next steps, not vague follow-up language",
      "- followUpQuestions: important unanswered questions that should be clarified later",
      "Use empty arrays when no action items or follow-up questions exist.",
      "Use an empty string when there are no concrete next steps.",
    ].join("\n"),
  });
}

