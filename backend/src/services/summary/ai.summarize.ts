import { logger } from "../../config/logger.js";
import { MeetingSummaryPartial } from "../../types/index.js";
import { AppError } from "../../utils/error.js";
import { SummarizeInputSchema } from "../../validators/summary.js";
import { generateActionItems } from "./action-items.generator.js";
import { generateDecisions } from "./decisions.generator.js";
import { filterOutput, resolveRequestedFields } from "./prompt.builder.js";
import { generateRisks } from "./risks.generator.js";
import { generateSummary } from "./summary.generator.js";

const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SummarizeConfig {
  language?: string;
  summaryLength?: "brief" | "medium" | "detailed";
  selectedOutputs?: string[];
}

function shouldRunSummaryGenerator(selectedOutputs: string[]): boolean {
  void selectedOutputs;
  return true;
}

function shouldRunActionItemsGenerator(selectedOutputs: string[]): boolean {
  return (
    selectedOutputs.length === 0 || selectedOutputs.includes("action_items")
  );
}

function shouldRunDecisionsGenerator(selectedOutputs: string[]): boolean {
  return (
    selectedOutputs.length === 0 ||
    selectedOutputs.includes("action_items") ||
    selectedOutputs.includes("decisions")
  );
}

function shouldRunRisksGenerator(selectedOutputs: string[]): boolean {
  return (
    selectedOutputs.length === 0 || selectedOutputs.includes("risks")
  );
}

async function attemptSummarize(
  transcript: string,
  attempt: number,
  config: SummarizeConfig,
): Promise<MeetingSummaryPartial> {
  const selectedOutputs = config.selectedOutputs ?? [];
  const requestedFields = resolveRequestedFields(selectedOutputs);
  const context = {
    attempt,
    language: config.language,
    summaryLength: config.summaryLength,
  } as const;

  const generatorRuns: Array<Promise<MeetingSummaryPartial>> = [];
  const activeGenerators: string[] = [];

  if (shouldRunSummaryGenerator(selectedOutputs)) {
    activeGenerators.push("summary");
    generatorRuns.push(generateSummary(transcript, context));
  }

  if (shouldRunActionItemsGenerator(selectedOutputs)) {
    activeGenerators.push("actionItems");
    generatorRuns.push(generateActionItems(transcript, context));
  }

  if (shouldRunDecisionsGenerator(selectedOutputs)) {
    activeGenerators.push("decisions");
    generatorRuns.push(generateDecisions(transcript, context));
  }

  if (shouldRunRisksGenerator(selectedOutputs)) {
    activeGenerators.push("risks");
    generatorRuns.push(generateRisks(transcript, context));
  }

  logger.info("Attempting summarization", {
    attempt,
    selectedOutputs,
    requestedFields: requestedFields === "all" ? "all" : [...requestedFields],
    generators: activeGenerators,
  });

  const partialOutputs = await Promise.all(generatorRuns);
  const mergedOutput = Object.assign({}, ...partialOutputs);

  return filterOutput(mergedOutput, requestedFields);
}

export async function summarizeMeeting(
  rawTranscript: string,
  config: SummarizeConfig = {},
): Promise<MeetingSummaryPartial> {
  const inputParsed = SummarizeInputSchema.safeParse({
    transcript: rawTranscript,
  });

  if (!inputParsed.success) {
    const issues = inputParsed.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    logger.warn("Invalid input", { issues });
    throw new AppError(`Invalid input: ${issues}`, 400, "INVALID_INPUT");
  }

  const { transcript } = inputParsed.data;

  logger.info("Starting summarization", {
    transcriptLength: transcript.length,
    model: "openai/gpt-oss-120b",
    selectedOutputs: config.selectedOutputs,
    summaryLength: config.summaryLength,
    maxRetries: MAX_RETRIES,
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptSummarize(transcript, attempt, config);
    } catch (err: unknown) {
      lastError = err;
      const msg = (err as Error).message ?? "";

      const isRetryable =
        msg.includes("schema") ||
        msg.includes("parse") ||
        msg.includes("rate") ||
        msg.includes("429") ||
        msg.includes("timeout") ||
        msg.includes("502") ||
        msg.includes("503") ||
        msg.includes("NoObjectGeneratedError");

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = 1000 * attempt; // 1s → 2s → 3s
        logger.warn(`Attempt ${attempt} failed — retrying in ${delay}ms`, {
          error: msg,
        });
        await sleep(delay);
        continue;
      }

      logger.error("Non-retryable error", { error: msg, attempt });
      break;
    }
  }

  logger.error("All attempts failed", { error: (lastError as Error).message });
  throw new AppError(
    "Summary generation failed after all retries. Please try again.",
    502,
    "LLM_ALL_FAILED",
  );
}
