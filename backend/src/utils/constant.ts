import { SchemaField, SessionStoreLimits } from "../types";

export const ALWAYS_INCLUDED_FIELDS: SchemaField[] = [
  "title",
  "conversationType",
  "oneLineSummary",
  "sentiment",
];

export const OUTPUT_FIELD_MAP: Record<string, SchemaField[]> = {
  summary: [
    "fullSummary",
    "participants",
    "mainTopics",
    "keyPoints",
    "toneAnalysis",
    "tags",
    "speakerBreakdown",
  ],

  action_items: ["actionItems", "decisions", "nextSteps", "followUpQuestions"],
  decisions: ["decisions"],
  risks: ["risks", "keyMetrics", "insights"],
  full_transcript: [],
  pdf: [],
};


export const SUMMARY_LENGTH_INSTRUCTIONS: Record<string, string> = {
  brief: "Write fullSummary as ONE concise paragraph (~80 words max).",
  medium: "Write fullSummary in 3 balanced paragraphs (~200 words total).",
  detailed:
    "Write fullSummary as a thorough multi-paragraph breakdown covering all angles (~400 words).",
};

export const OUTPUT_PROMPT_SECTIONS: Record<string, string> = {
  summary: [
    "- fullSummary: {SUMMARY_LENGTH_INSTRUCTION}",
    "- participants: names or Speaker 0 / Speaker 1 labels",
    "- mainTopics: each as a specific statement, not a one-word label",
    "- keyPoints: most important things said",
    "- toneAnalysis: 2 sentences on tone, power dynamic, relationship quality",
    "- tags: 3–6 short keyword tags",
    "- speakerBreakdown: key statement per speaker",
  ].join("\n"),

  action_items: [
    "- actionItems: tasks with owner, task description, due date, and priority (High/Medium/Low)",
    "- decisions: decisions made — empty array if none",
    "- nextSteps: specific actionable next steps — not vague",
    "- followUpQuestions: important unanswered questions",
  ].join("\n"),

  decisions: [
    "- decisions: concrete decisions, agreements, or final outcomes reached",
  ].join("\n"),

  risks: [
    "- risks: concerns, blockers, unresolved issues, warnings, or red flags",
    "- keyMetrics: important numbers, dates, amounts, or percentages mentioned",
    "- insights: deeper observations, urgency signals, or unspoken concerns",
  ].join("\n"),
};


export const GLADIA_BASE_URL = "https://api.gladia.io/v2";

export const LIVE_INIT_BODY = {
  encoding: "wav/pcm",
  bit_depth: 16,
  sample_rate: 16_000,
  channels: 1,
  model: "solaria-1",
  endpointing: 0.6,
  maximum_duration_without_endpointing: 10,
  language_config: { languages: ["en"], code_switching: false },
  pre_processing: { audio_enhancer: true, speech_threshold: 0.5 },
  realtime_processing: {
    named_entity_recognition: false,
    sentiment_analysis: false,
  },
  messages_config: {
    receive_partial_transcripts: true,
    receive_final_transcripts: true,
    receive_speech_events: false,
    receive_pre_processing_events: false,
    receive_realtime_processing_events: false,
    receive_post_processing_events: false,
    receive_acknowledgments: false,
    receive_errors: true,
    receive_lifecycle_events: false,
  },
};

export const KEEP_ALIVE_INTERVAL_MS = 10_000;
export const STOP_DRAIN_DELAY_MS = 800;

export const DEFAULTS: SessionStoreLimits = {
  maxSessionMs: 2 * 60 * 60 * 1_000,
  maxAudioBytes: 150 * 1024 * 1024,
};