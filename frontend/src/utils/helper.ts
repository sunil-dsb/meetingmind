import { MeetingResult, RichTextValue } from "@/types";
import { RawSummaryResponse } from "@/types/live.transcription";
import { SPEAKER_COLORS } from "./constant";

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
};

export const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};

export const getSpeakerColor = (speaker?: string | null): string => {
    if (!speaker) return "#a1a1aa";
    const num = parseInt(speaker.replace(/\D/g, ""), 10);
    return SPEAKER_COLORS[isNaN(num) ? 0 : num % SPEAKER_COLORS.length];
};

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

export const normalizeActionItems = (rawItems: unknown): MeetingResult["actionItems"] => {
    // Guard: null, undefined, non-array
    if (!Array.isArray(rawItems)) return [];

    return rawItems
        .map((item): MeetingResult["actionItems"][number] | null => {
            if (isNonEmptyString(item)) {
                return { task: item };
            }

            if (typeof item === 'object' && item !== null) {
                const obj = item as Record<string, unknown>;
                const possibleTask = obj.task ?? obj.description ?? obj.text ?? obj.content;
                const possibleOwner = obj.owner ?? obj.assignee;
                const possibleDue = obj.due ?? obj.deadline;
                const possiblePriority = obj.priority;

                if (isNonEmptyString(possibleTask)) {
                    return {
                        task: possibleTask.trim(),
                        owner: isNonEmptyString(possibleOwner) ? possibleOwner : undefined,
                        due: isNonEmptyString(possibleDue) ? possibleDue : undefined,
                        priority: isNonEmptyString(possiblePriority) ? possiblePriority : undefined,
                    };
                }
            }

            return null;
        })
        .filter((item): item is MeetingResult["actionItems"][number] => item !== null);
};


export const createMeetingResult = (rawResponse: RawSummaryResponse): MeetingResult => {
    return {
        title: (rawResponse.summary?.title as string) ?? "Live Transcription",
        date: new Date(rawResponse.createdAt ?? Date.now()).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        }),
        conversationType: (rawResponse.summary?.conversationType as string) ?? "",
        oneLineSummary: (rawResponse.summary?.oneLineSummary as string) ?? "",
        summary: (rawResponse.summary?.fullSummary as string) ?? (rawResponse.summary?.summary as string) ?? "",
        speakers: ((rawResponse.summary?.participants ??
            rawResponse.summary?.speakers ??
            rawResponse.speakers ?? []) as string[]).filter(Boolean),
        mainTopics: (rawResponse.summary?.mainTopics as string[]) ?? [],
        keyPoints: (rawResponse.summary?.keyPoints as string[]) ?? [],
        decisions: (rawResponse.summary?.decisions as string[]) ?? (rawResponse.summary?.keyDecisions as string[]) ?? [],
        actionItems: normalizeActionItems(rawResponse.summary?.actionItems ?? rawResponse.summary?.action_items),
        keyMetrics: (rawResponse.summary?.keyMetrics as (string | Record<string, unknown>)[]) ?? [],
        risks: (rawResponse.summary?.risks as string[]) ?? [],
        sentiment: (rawResponse.summary?.sentiment as string) ?? "",
        toneAnalysis: (rawResponse.summary?.toneAnalysis as string) ?? "",
        insights: (rawResponse.summary?.insights as string[]) ?? [],
        nextSteps: (rawResponse.summary?.nextSteps as string) ?? "",
        followUpQuestions: (rawResponse.summary?.followUpQuestions as string[]) ?? [],
        tags: (rawResponse.summary?.tags as string[]) ?? [],
        pdf_url: (rawResponse.summary?.pdf_url as string | null) ?? (rawResponse.summary?.pdfUrl as string | null) ?? null,
        transcript: (rawResponse.transcript as string) ?? "",
        duration: (rawResponse.duration as string) ?? "",
    };
};

export const readRecordText = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

export const renderRichText = (value: RichTextValue): string => {
  if (typeof value === "string") return value;
  return readRecordText(value.text) ?? readRecordText(value.description) ?? JSON.stringify(value);
};

export const renderMetric = (metric: RichTextValue): string => {
  if (typeof metric === "string") return metric;
  const metricValue = readRecordText(metric.value) ?? readRecordText(metric.metric) ?? "N/A";
  const label = readRecordText(metric.label);
  return label ? `${metricValue} ${label}` : metricValue;
};


