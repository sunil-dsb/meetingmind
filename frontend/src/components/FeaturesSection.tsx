"use client";

const FEATURES = [
  {
    icon: "🎙️",
    title: "99.2% Accurate Transcription",
    desc: "Military-grade speech recognition across 50+ languages with automatic punctuation and formatting.",
    color: "#6c63ff",
    gradient: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(108,99,255,0.04))",
  },
  {
    icon: "🧠",
    title: "Smart AI Summaries",
    desc: "Context-aware summaries that capture the essence of your meeting without losing critical details.",
    color: "#a78bfa",
    gradient: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.04))",
  },
  {
    icon: "✅",
    title: "Action Item Extraction",
    desc: "Automatically identifies tasks, assigns owners, and extracts deadlines from natural conversation.",
    color: "#10d9a0",
    gradient: "linear-gradient(135deg, rgba(16,217,160,0.12), rgba(16,217,160,0.04))",
  },
  {
    icon: "👥",
    title: "Speaker Diarization",
    desc: "Recognizes and labels different voices so every contribution is attributed correctly.",
    color: "#f97316",
    gradient: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))",
  },
  {
    icon: "📄",
    title: "PDF Report Generation",
    desc: "Beautiful, shareable PDF reports with your transcript, summary, and action items in one document.",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(236,72,153,0.04))",
  },
  {
    icon: "⚡",
    title: "Lightning Fast Processing",
    desc: "Results delivered in under 30 seconds regardless of meeting length. No waiting, no queues.",
    color: "#eab308",
    gradient: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features-section" className="py-20 px-6 max-w-[1100px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-[clamp(32px,5vw,52px)] font-black tracking-[-1.5px] mb-4 leading-[1.1]">
          Everything You Need From a{" "}
          <span className="bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] bg-clip-text text-transparent">
            Meeting
          </span>
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-[520px] mx-auto leading-[1.7]">
          Stop taking notes. Let AI handle the details so you can focus on what matters.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            id={`feature-${i}`}
            className="rounded-[20px] p-7 transition-all duration-300 cursor-default hover:-translate-y-1.5"
            style={{
              background: feature.gradient,
              border: `1px solid ${feature.color}22`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 24px 60px ${feature.color}20`;
              e.currentTarget.style.borderColor = `${feature.color}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = `${feature.color}22`;
            }}
          >
            <div
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[26px] mb-4"
              style={{
                background: `${feature.color}18`,
                border: `1px solid ${feature.color}30`,
              }}
            >
              {feature.icon}
            </div>
            <h3 className="text-[17px] font-bold mb-2.5 text-[var(--text-primary)]">
              {feature.title}
            </h3>
            <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65]">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
