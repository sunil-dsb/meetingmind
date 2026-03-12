import { MeetingSummaryOutput, SchemaField, SchemaShape } from "../../types";
import { ALWAYS_INCLUDED_FIELDS, OUTPUT_FIELD_MAP, OUTPUT_PROMPT_SECTIONS, SUMMARY_LENGTH_INSTRUCTIONS } from "../../utils/constant";
import { MeetingSummarySchema } from "../../validators/summary";

export function resolveRequestedFields(
  selectedOutputs: string[],
): Set<SchemaField> | "all" {
  if (!selectedOutputs || selectedOutputs.length === 0) return "all";

  // Only LLM-relevant outputs contribute fields; "pdf" and "full_transcript" do not.
  const llmOutputs = selectedOutputs.filter(
    (o) => o !== "pdf" && o !== "full_transcript",
  );

  if (llmOutputs.length === 0) {
    // User only selected pdf / full_transcript — still generate core fields
    // so the response isn't empty.
    return new Set(ALWAYS_INCLUDED_FIELDS);
  }

  const fields = new Set<SchemaField>(ALWAYS_INCLUDED_FIELDS);
  for (const output of llmOutputs) {
    const mapped = OUTPUT_FIELD_MAP[output] ?? [];
    mapped.forEach((f) => fields.add(f));
  }
  return fields;
}

export function buildPromptSections(
  selectedOutputs: string[],
  summaryLength: string,
): string {
  const length = summaryLength ?? "medium";
  if (!selectedOutputs || selectedOutputs.length === 0) {
    // No filter — ask for everything
    return (
      "Populate ALL fields in the schema.\n" +
      SUMMARY_LENGTH_INSTRUCTIONS[length]
    );
  }

  const lines: string[] = [
    "Populate ONLY the fields listed below. Set every other field to an empty string or empty array.\n",
    "// Always-included core fields:",
    "- title: specific descriptive title",
    "- conversationType: auto-detected conversation type",
    "- oneLineSummary: one sentence capturing the OUTCOME",
    "- sentiment: overall emotional tone\n",
  ];

  for (const output of selectedOutputs) {
    const section = OUTPUT_PROMPT_SECTIONS[output];
    if (!section) continue; // "pdf", "full_transcript" — no LLM fields

    const instruction =
      SUMMARY_LENGTH_INSTRUCTIONS[length] ??
      SUMMARY_LENGTH_INSTRUCTIONS["medium"] ??
      "Write fullSummary in 3 balanced paragraphs (~400 words total).";
    const resolved = section.replace(
      "{SUMMARY_LENGTH_INSTRUCTION}",
      instruction,
    );
    lines.push(`// ${output} fields:`);
    lines.push(resolved);
    lines.push("");
  }

  return lines.join("\n");
}

export function filterOutput(
  output: Partial<MeetingSummaryOutput>,
  requestedFields: Set<SchemaField> | "all",
): Partial<MeetingSummaryOutput> {
  if (requestedFields === "all") return output;

  const filtered: Partial<MeetingSummaryOutput> = {};
  for (const field of requestedFields) {
    if (field in output) {
      // Safe dynamic assignment — field is a keyof MeetingSummaryOutput
      (filtered as Record<string, unknown>)[field] = output[field];
    }
  }
  return filtered;
}

export function pickSummarySchema(fields: readonly SchemaField[]) {
  const pickMask = {} as Partial<Record<keyof SchemaShape, true>>;
  for (const key of fields) {
    pickMask[key as keyof SchemaShape] = true;
  }

  return MeetingSummarySchema.pick(
    pickMask as Record<keyof SchemaShape, true>,
  );
}
