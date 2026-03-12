import z from "zod";

export const SummarizeInputSchema = z.object({
  transcript: z
    .string()
    .min(20, "Transcript must be at least 20 characters")
    .max(50000, "Transcript must be under 50,000 characters")
    .transform((t) => t.trim()),
});

const ActionItemSchema = z.object({
  owner: z.string().describe("Person responsible — name or role"),
  task: z.string().describe("Specific actionable task"),
  due: z.string().describe("Deadline if mentioned, otherwise TBD"),
  priority: z.enum(["High", "Medium", "Low"]).describe("Priority level"),
});

const SpeakerSegmentSchema = z.object({
  speaker: z.string().describe("Speaker label e.g. Speaker 0, Doctor, John"),
  text: z.string().describe("Key thing this speaker said"),
});

export const MeetingSummarySchema = z.object({
  title: z.string().describe("Specific descriptive title — not generic"),

  conversationType: z
    .string()
    .describe(
      "Auto-detected type: Business Meeting | Medical Consultation | " +
        "Legal Discussion | Sales Call | Technical Discussion | " +
        "Casual Conversation | Interview | Negotiation | Other",
    ),

  oneLineSummary: z
    .string()
    .describe("One sentence capturing the OUTCOME not just the topic"),

  fullSummary: z
    .string()
    .describe(
      "3 paragraphs: 1) context and purpose " +
        "2) what was discussed in detail " +
        "3) final outcome and implications",
    ),

  participants: z
    .array(z.string())
    .describe("Names if mentioned, else Speaker 0 / Speaker 1 etc."),

  mainTopics: z
    .array(z.string())
    .describe("Each topic as a specific statement — not a one-word label"),

  keyPoints: z
    .array(z.string())
    .describe("Most important things said — works for any domain"),

  decisions: z
    .array(z.string())
    .describe("Decisions made — empty array if none"),

  actionItems: z
    .array(ActionItemSchema)
    .describe("Tasks to complete after this conversation"),

  keyMetrics: z
    .array(z.string())
    .default([])
    .describe("Numbers, dates, amounts, dosages, percentages mentioned"),

  risks: z
    .array(z.string())
    .default([])
    .describe("Concerns, warnings, unresolved issues, red flags"),

  sentiment: z
    .enum([
      "Positive",
      "Negative",
      "Neutral",
      "Mixed",
      "Tense",
      "Productive",
      "Inconclusive",
    ])
    .describe("Overall emotional tone of the conversation"),

  toneAnalysis: z
    .string()
    .describe("2 sentences on tone, power dynamic, relationship quality"),

  insights: z
    .array(z.string())
    .default([])
    .describe(
      "Deep observations — patterns, urgency signals, " +
        "avoided topics, power dynamics, unspoken concerns",
    ),

  nextSteps: z.string().describe("Specific actionable next steps — not vague"),

  followUpQuestions: z
    .array(z.string())
    .default([])
    .describe("Important unanswered questions"),

  tags: z.array(z.string()).default([]).describe("3-6 short keyword tags"),

  speakerBreakdown: z
    .array(SpeakerSegmentSchema)
    .default([])
    .describe("Key statements per speaker"),
});