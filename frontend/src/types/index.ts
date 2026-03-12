export type Stage = "idle" | "ready" | "processing" | "done" | "error";

export interface MeetingActionItem {
    task: string;
    owner?: string;
    due?: string;
    priority?: string;
}

export interface Config {
    language: string;
    speakerDiarization: boolean;
    selectedOutputs: ("summary" | "action_items" | "pdf" | "transcript")[];
    summaryLength: "brief" | "medium" | "detailed";
}

export interface MeetingResult {
    title: string;
    date: string;
    conversationType: string;
    oneLineSummary: string;
    summary: string;
    speakers: string[];
    mainTopics: string[];
    keyPoints: string[];
    decisions: string[];
    actionItems: MeetingActionItem[];
    keyMetrics: (string | Record<string, unknown>)[];
    risks: string[];
    sentiment: string;
    toneAnalysis: string;
    insights: string[];
    nextSteps: string;
    followUpQuestions: string[];
    tags: string[];
    pdf_url: string | null;
    transcript: string;
    duration: string;
}

export type SelectedOutput = "summary" | "action_items" | "transcript" | "pdf";
export type RichTextValue = string | Record<string, unknown>;

export interface ResultsData extends Omit<MeetingResult, "decisions" | "keyMetrics" | "risks"> {
  decisions: RichTextValue[];
  keyMetrics: RichTextValue[];
  risks: RichTextValue[];
  action_items?: MeetingActionItem[];
  keyDecisions?: RichTextValue[];
  key_decisions?: RichTextValue[];
  transcriptExcerpt?: string;
  transcript_excerpt?: string;
}

export interface TabButtonProps {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

export interface ResultsSectionProps {
  isVisible: boolean;
  result: ResultsData | null;
  onReset: () => void;
  selectedOutputs?: SelectedOutput[];
}