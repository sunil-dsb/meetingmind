import { LanguageOption, OutputOption } from "@/types/config";


export const stats = [
    { value: "99.2%", label: "Transcription Accuracy" },
    { value: "<30s", label: "Processing Time" },
    { value: "50+", label: "Languages Supported" },
    { value: "10K+", label: "Meetings Analyzed" },
] as const;

export const ACCEPTED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".mp4", ".webm", ".flac", ".aac"];
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const ACCEPTED_MIME_TYPES = [
    "audio/aac",
    "audio/flac",
    "audio/mp3",
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/x-aac",
    "audio/x-flac",
    "audio/x-m4a",
    "audio/x-wav",
    "audio/x-pn-wav",
    "audio/wave",
    "video/mp4",
    "video/webm",
] as const;

export const languageOptions: LanguageOption[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "ar", label: "Arabic", flag: "🇸🇦" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
    { code: "zh", label: "Chinese", flag: "🇨🇳" },
    { code: "ja", label: "Japanese", flag: "🇯🇵" },
    { code: "pt", label: "Portuguese", flag: "🇧🇷" },
    { code: "ru", label: "Russian", flag: "🇷🇺" },
];

export const outputOptions: OutputOption[] = [
    {
        id: "summary",
        label: "Smart Summary",
        desc: "Concise paragraph overview of the entire meeting",
        color: "#6c63ff",
    },
    {
        id: "action_items",
        label: "Action Items",
        desc: "Extracted tasks, owners, and deadlines",
        color: "#10d9a0",
    },
    {
        id: "transcript",
        label: "Full Transcript",
        desc: "Word-by-word transcription with timestamps",
        color: "#f97316",
    },
    {
        id: "pdf",
        label: "PDF Report",
        desc: "Downloadable formatted report with all insights",
        color: "#a78bfa",
    },
];

export const summaryLengthOptions = [
    { id: "brief" as const, label: "Brief", desc: "~1 paragraph" },
    { id: "medium" as const, label: "Balanced", desc: "~3 paragraphs" },
    { id: "detailed" as const, label: "Detailed", desc: "Full breakdown" },
] as const;

export const ALL_TABS = [
    { id: "summary", label: "Summary", icon: "📝", outputKey: "summary" },
    { id: "actions", label: "Action Items", icon: "✅", outputKey: "action_items" },
    { id: "decisions", label: "Decisions", icon: "💡", outputKey: "action_items" }, // always show with action_items
    { id: "insights", label: "Insights", icon: "🔍", outputKey: "summary" },       // always show with summary
    { id: "transcript", label: "Transcript", icon: "📃", outputKey: "transcript" },
];

export const SPEAKER_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f87171", "#a78bfa"] as const;

export const PRIORITY_COLORS = {
  high: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#ef4444" },
  medium: { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", text: "#f97316" },
  low: { bg: "rgba(16,217,160,0.1)", border: "rgba(16,217,160,0.2)", text: "#10d9a0" },
};