"use client";

import { useEffect, useState } from "react";

interface ProcessingStep {
  id: string;
  label: string;
  icon: string;
  duration: number;
}

interface WaveBarProps {
  delay: number;
}

interface ProcessingViewProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: "upload", label: "Uploading audio file", icon: "UP", duration: 1200 },
  { id: "transcribe", label: "Transcribing speech to text", icon: "MIC", duration: 2500 },
  { id: "analyze", label: "Analyzing content and context", icon: "AI", duration: 1800 },
  { id: "summary", label: "Generating smart summary", icon: "SUM", duration: 1400 },
  { id: "actions", label: "Extracting action items", icon: "TASK", duration: 1000 },
  { id: "pdf", label: "Compiling PDF report", icon: "PDF", duration: 900 },
];

function WaveBar({ delay }: WaveBarProps) {
  return (
    <div
      className="animate-wave w-1 h-full rounded-sm bg-gradient-to-b from-[#6c63ff] to-[#10d9a0]"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export default function ProcessingView({ isVisible, onComplete }: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      setCompletedSteps([]);
      return;
    }

    const totalDuration = PROCESSING_STEPS.reduce((sum, step) => sum + step.duration, 0);
    const completedSet = new Set<number>();
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 80;
      setProgress(Math.min((elapsed / totalDuration) * 100, 99));

      let accum = 0;
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        accum += PROCESSING_STEPS[i].duration;
        if (elapsed >= accum && !completedSet.has(i)) {
          completedSet.add(i);
          setCompletedSteps((prev) => (prev.includes(i) ? prev : [...prev, i]));
          if (i + 1 < PROCESSING_STEPS.length) {
            setCurrentStep(i + 1);
          }
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => onComplete?.(), 600);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <section className="px-6 pb-20 max-w-[760px] mt-[120px] mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.25)] mb-4 text-xs font-bold text-[#f97316] tracking-[0.06em] uppercase">
          Step 3 of 3
        </div>
        <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-1px] mb-3">
          Processing Your Meeting
        </h2>
        <p className="text-base text-[var(--text-secondary)] leading-[1.6]">
          Our AI is hard at work. This usually takes under 30 seconds.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-10">
        <div className="flex items-center justify-center gap-1.5 h-[60px] mb-9">
          {Array.from({ length: 20 }, (_, i) => (
            <WaveBar key={i} delay={i * 0.06} />
          ))}
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2.5 items-center">
            <span className="text-[14px] font-semibold text-[var(--text-secondary)]">
              {PROCESSING_STEPS[currentStep]?.label || "Finalizing..."}
            </span>
            <span className="text-[18px] font-extrabold bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] bg-clip-text text-transparent">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] via-[#a78bfa] to-[#10d9a0] animate-[shimmer_2s_linear_infinite] transition-all duration-150"
              style={{ width: `${progress}%`, backgroundSize: "200% 100%" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {PROCESSING_STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i);
            const isCurrent = i === currentStep && !isDone;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-400 border ${
                  isCurrent
                    ? "bg-[rgba(108,99,255,0.08)] border-[rgba(108,99,255,0.2)]"
                    : isDone
                    ? "bg-[rgba(16,217,160,0.05)] border-[rgba(16,217,160,0.15)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-400 text-[15px] border ${
                    isDone
                      ? "bg-[rgba(16,217,160,0.15)] border-[rgba(16,217,160,0.3)]"
                      : isCurrent
                      ? "bg-[rgba(108,99,255,0.15)] border-[rgba(108,99,255,0.3)]"
                      : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L19 8" stroke="#10d9a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6c63ff] animate-[pulse-glow_1.5s_ease-in-out_infinite]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
                  )}
                </div>

                <span className="text-[14px]">{step.icon}</span>

                <span
                  className={`text-[15px] transition-colors duration-400 ${isCurrent || isDone ? "font-semibold" : "font-normal"} ${
                    isDone ? "text-[#10d9a0]" : isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] animate-[bounce-dot_1.2s_ease-in-out_infinite]"
                        style={{ animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}

                {isDone && <span className="ml-auto text-[12px] text-[#10d9a0] font-semibold">Done</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
