export interface Segment {
    speaker?: string | null;
    text: string;
}

export interface TranscriptLine {
    speaker?: string | null;
    text: string;
    segments?: Segment[];
}

export interface LiveTranscriptionProps {
    onSummaryGenerated?: (summary: RawSummaryResponse) => void;
}


export interface FinalLine {
    text: string;
    speaker: string | null;
    segments: Segment[];
}

export interface PartialLine {
    text: string;
    speaker: string | null;
}

export interface CorrectedTranscript {
    segments: Segment[];
    transcript: string;
    speakerCount: number;
}

export interface RealtimeRecorderReturn {
    isRecording: boolean;
    sessionId: string | null;
    sessionIdRef: React.MutableRefObject<string | null>;
    partialText: PartialLine | null;
    finalLines: FinalLine[];
    fullTranscript: string;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    correctedTranscript: CorrectedTranscript | null;
    isDiarizing: boolean;
}

type RawActionItem =
    | string
    | { description: string; assignee?: string }
    | { text: string; assignee?: string | undefined }
    | { content: string; owner?: string }
    | { task: string };

type RawActionItems = RawActionItem[];

export interface RawSummaryResponse {
    summary?: {
        title?: string;
        conversationType?: string;
        oneLineSummary?: string;
        fullSummary?: string;
        summary?: string;
        participants?: string[];
        speakers?: string[];
        mainTopics?: string[];
        keyPoints?: string[];
        decisions?: string[];
        keyDecisions?: string[];
        actionItems?: RawActionItems | null;
        action_items?: RawActionItems | null;
        keyMetrics?: (string | Record<string, unknown>)[];
        risks?: string[];
        sentiment?: string;
        toneAnalysis?: string;
        insights?: string[];
        nextSteps?: string;
        followUpQuestions?: string[];
        tags?: string[];
        pdf_url?: string | null;
        pdfUrl?: string | null;
    };
    speakers?: string[];
    transcript?: string;
    duration?: string;
    createdAt?: string;
    [key: string]: unknown;
}
