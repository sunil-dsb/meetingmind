"use client";
import { MeetingResult, ResultsSectionProps, TabButtonProps } from "@/types";
import { ALL_TABS, PRIORITY_COLORS } from "@/utils/constant";
import { readRecordText, renderMetric, renderRichText } from "@/utils/helper";
import { useState } from "react";
import { generateMeetingPDF } from "../utils/pdfGenerator";

function TabButton({ id, label, icon, active, onClick }: TabButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`max-sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] border-none text-[14px] cursor-pointer transition-all duration-300 font-semibold whitespace-nowrap outline-1 outline-transparent hover:text-[var(--text-secondary)] hover:bg-[rgba(108,99,255,0.05)] ${active ? "bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(167,139,250,0.15)] text-[var(--accent-secondary)] font-bold outline-[rgba(108,99,255,0.25)] hover:bg-gradient-to-br hover:from-[rgba(108,99,255,0.2)] hover:to-[rgba(167,139,250,0.15)] hover:text-[var(--accent-secondary)]" : "bg-transparent text-[var(--text-muted)]"}`}
    >
      <span className="text-[16px]">{icon}</span>
      {label}
    </button>
  );
}


export default function ResultsSection({ isVisible, result, onReset, selectedOutputs }: ResultsSectionProps) {
  const activeOutputs = selectedOutputs && selectedOutputs.length > 0 ? selectedOutputs : ["summary", "action_items", "transcript", "pdf"];
  const visibleTabs = ALL_TABS.filter((tab) => activeOutputs.includes(tab.outputKey));
  const showPdfButton = activeOutputs.includes("pdf");

  const defaultTab = visibleTabs.length > 0 ? visibleTabs[0].id : "summary";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copying, setCopying] = useState(false);

  if (!isVisible || !result) return null;

  const resolvedTab = visibleTabs.find((t) => t.id === activeTab) ? activeTab : defaultTab;

  const data = result;
  const actionItems = data.actionItems ?? data.action_items ?? [];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleDownloadPdf = () => {
    const pdfData: MeetingResult = {
      ...data,
      decisions: data.decisions.map(renderRichText),
      risks: data.risks.map(renderRichText),
      keyMetrics: data.keyMetrics.map(renderMetric),
    };
    generateMeetingPDF(pdfData);
  };

  return (
    <section id="results-section" className="px-4 pb-20 max-w-[900px] mt-[120px] mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-10">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[rgba(16,217,160,0.1)] border border-[rgba(16,217,160,0.25)] mb-5 text-[14px] font-bold text-[#10d9a0]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 4L12 14.01L9 11.01" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Analysis Complete
        </div>
        <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-1.5px] mb-2 leading-[1.15]">
          {data.title}
        </h2>

        <div className="flex gap-3 justify-center flex-wrap mt-3.5">
          {[
            { icon: "📅", label: data.date },
            { icon: "⏱️", label: data.duration || null },
            { icon: "👥", label: `${(data.speakers || []).length} Speakers` },
          ].filter((m) => m.label).map((m, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[13px] text-[var(--text-secondary)] font-medium"
            >
              {m.icon} {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex gap-2.5 mb-7 mt-6 flex-wrap justify-end w-full">
        {showPdfButton && (
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPdf}
            className="max-sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] text-white border-none text-[14px] font-bold cursor-pointer transition-all duration-300 shadow-[0_6px_20px_rgba(108,99,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(108,99,255,0.55)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Download PDF
          </button>
        )}
        <button
          id="copy-summary-btn"
          onClick={() => handleCopy(data.summary)}
          className={`max-sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold cursor-pointer transition-all duration-300 ${copying ? "bg-[rgba(255,255,255,0.04)] text-[#10d9a0] border border-[rgba(16,217,160,0.3)]" : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]"}`}
        >
          {copying ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L19 8" stroke="#10d9a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5" stroke="currentColor" strokeWidth="2" /></svg> Copy Summary</>
          )}
        </button>
        <button
          id="new-meeting-btn"
          onClick={onReset}
          className="max-sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-transparent text-[var(--text-muted)] border border-[rgba(255,255,255,0.08)] text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M3 12A9 9 0 0 1 12 3C14.5 3 16.8 3.9 18.5 5.4L21 3V9H15L17.5 6.5C16.3 5.5 14.7 5 13 5C9.1 5 6 8.1 6 12H3ZM21 12A9 9 0 0 1 12 21C9.5 21 7.2 20.1 5.5 18.6L3 21V15H9L6.5 17.5C7.7 18.5 9.3 19 11 19C14.9 19 18 15.9 18 12H21Z" fill="currentColor" />
          </svg>
          New Meeting
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 bg-[rgba(255,255,255,0.03)] rounded-[14px] border border-[rgba(255,255,255,0.06)]">
        {visibleTabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={`tab-${tab.id}`}
            label={tab.label}
            icon={tab.icon}
            active={resolvedTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[20px] p-5 min-h-[300px]">
        {/* SUMMARY TAB */}
        {resolvedTab === "summary" && (
          <div>
            {/* Header row with conversation type + sentiment badges */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-[var(--border-card)] flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(108,99,255,0.15)] flex items-center justify-center text-[18px]">✨</div>
                <div>
                  <div className="text-[16px] font-bold">AI-Generated Summary</div>
                  <div className="text-[13px] text-[var(--text-muted)]">Powered by advanced LLM analysis</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {data.conversationType && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.25)] text-[12px] font-bold text-[#a78bfa] tracking-[0.05em] uppercase">
                    {data.conversationType}
                  </span>
                )}
                {data.sentiment && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(16,217,160,0.1)] border border-[rgba(16,217,160,0.25)] text-[12px] font-bold text-[#10d9a0] tracking-[0.05em] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10d9a0] inline-block" />
                    {data.sentiment}
                  </span>
                )}
              </div>
            </div>

            {data.oneLineSummary && (
              <p className="text-[14px] text-[var(--text-muted)] italic mb-4 leading-[1.6]">{data.oneLineSummary}</p>
            )}
            <p className="text-[16px] leading-[1.8] text-[var(--text-secondary)] whitespace-pre-line">{data.summary}</p>

            {/* Key Points */}
            {(data.keyPoints || []).length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--border-card)]">
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">⚡ Key Points</div>
                <div className="flex flex-col gap-2.5">
                  {data.keyPoints.map((pt, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] shrink-0 mt-2" />
                      <span className="text-[15px] leading-[1.65] text-[var(--text-secondary)]">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Topics */}
            {(data.mainTopics || []).length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--border-card)]">
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3">🏷️ Main Topics</div>
                <div className="flex flex-wrap gap-2">
                  {data.mainTopics.map((topic, i) => (
                    <span key={i} className="px-3.5 py-1 rounded-full bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)] text-[13px] font-semibold text-[#a78bfa]">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {data.nextSteps && (
              <div className="mt-6 pt-5 border-t border-[var(--border-card)]">
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3">🚀 Next Steps</div>
                <div className="flex gap-3 px-4 py-4 rounded-[14px] bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.15)]">
                  <span className="text-[18px] shrink-0">➡️</span>
                  <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">{data.nextSteps}</p>
                </div>
              </div>
            )}

            {/* Participants */}
            {(data.speakers || []).length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--border-card)]">
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">Participants</div>
                <div className="flex flex-wrap gap-2.5">
                  {data.speakers.map((speaker, si) => (
                    <span key={si} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(108,99,255,0.08)] border border-[rgba(108,99,255,0.15)] text-[13px] font-semibold text-[var(--accent-secondary)]">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-[11px] font-extrabold text-white">{speaker[0]}</div>
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(data.tags || []).length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--border-card)]">
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-2.5">🔖 Tags</div>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[12px] font-semibold text-[var(--text-muted)]">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {resolvedTab === "insights" && (
          <div className="flex flex-col gap-7">
            {/* Tone Analysis */}
            {data.toneAnalysis && (
              <div>
                <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[var(--border-card)]">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(167,139,250,0.12)] flex items-center justify-center text-[18px]">🎭</div>
                  <div>
                    <div className="text-[16px] font-bold">Tone Analysis</div>
                    <div className="text-[13px] text-[var(--text-muted)]">Communication dynamic & emotional quality</div>
                  </div>
                </div>
                <p className="text-[15px] leading-[1.8] text-[var(--text-secondary)] px-5 py-4 rounded-[14px] bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.15)] m-0">{data.toneAnalysis}</p>
              </div>
            )}

            {/* Deep Insights */}
            {(data.insights || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">🧠 Deep Insights</div>
                <div className="flex flex-col gap-2.5">
                  {data.insights.map((item, i) => (
                    <div key={i} className="flex gap-3.5 px-4 py-3.5 rounded-xl bg-[rgba(108,99,255,0.05)] border border-[rgba(108,99,255,0.12)]">
                      <span className="text-[16px] shrink-0">💬</span>
                      <span className="text-[14px] leading-[1.65] text-[var(--text-secondary)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-Up Questions */}
            {(data.followUpQuestions || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">❓ Follow-Up Questions</div>
                <div className="flex flex-col gap-2.5">
                  {data.followUpQuestions.map((q, i) => (
                    <div key={i} className="flex gap-3 items-start px-4 py-3 rounded-xl bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.12)]">
                      <span className="text-[14px] font-bold text-[#f97316] shrink-0 mt-[1px]">{i + 1}.</span>
                      <span className="text-[14px] leading-[1.6] text-[var(--text-secondary)]">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            {(data.keyMetrics || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">📊 Key Metrics</div>
                <div className="flex flex-wrap gap-2.5">
                  {data.keyMetrics.map((metric, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-[rgba(108,99,255,0.07)] border border-[rgba(108,99,255,0.15)] text-[14px] font-semibold text-[var(--accent-secondary)]">
                      {renderMetric(metric)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {(data.risks || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">⚠️ Risks & Concerns</div>
                <div className="flex flex-col gap-2.5">
                  {data.risks.map((risk, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3.5 rounded-xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)]">
                      <span className="text-[16px] shrink-0">🔴</span>
                      <span className="text-[14px] leading-[1.6] text-[var(--text-secondary)]">{renderRichText(risk)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(data.insights || []).length === 0 && !data.toneAnalysis && (data.followUpQuestions || []).length === 0 && (
              <p className="text-[14px] text-[var(--text-muted)] italic">No deeper insights were generated for this conversation.</p>
            )}
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {resolvedTab === "actions" && (
          <div className="flex flex-col gap-8">
            {/* Task Cards */}
            {actionItems.length > 0 && (
              <div>
              <div className="mb-5 pb-5 border-b border-[var(--border-card)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(16,217,160,0.12)] flex items-center justify-center text-[18px]">✅</div>
                  <div>
                    <div className="text-[16px] font-bold">Action Items</div>
                    <div className="text-[13px] text-[var(--text-muted)]">{actionItems.length} tasks identified</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                  {actionItems.map((item, i) => {
                    const priorityKey = (item.priority || "").toLowerCase();
                    const p = (priorityKey in PRIORITY_COLORS
                      ? PRIORITY_COLORS[priorityKey as keyof typeof PRIORITY_COLORS]
                      : {
                      bg: "rgba(108,99,255,0.1)",
                      border: "rgba(108,99,255,0.2)",
                      text: "#a78bfa",
                    });
                    return (
                      <div
                        key={i}
                        id={`action-item-${i}`}
                        className="flex gap-3.5 px-[18px] py-4 rounded-[14px] bg-[rgba(0,0,0,0.15)] border border-[var(--border-card)] transition-all duration-200 hover:bg-[rgba(108,99,255,0.04)] hover:border-[rgba(108,99,255,0.15)]"
                      >
                        <div className="w-[22px] h-[22px] rounded-md border-2 border-[rgba(108,99,255,0.3)] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-[15px] font-semibold mb-1.5 leading-[1.4]">{item.task}</div>
                          <div className="flex gap-2.5 flex-wrap">
                            {item.owner && (
                              <span className="text-[13px] text-[var(--text-muted)] flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                {item.owner}
                              </span>
                            )}
                            {item.due && (
                              <span className="text-[13px] text-[var(--text-muted)] flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                {item.due}
                              </span>
                            )}
                            {item.priority && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase" style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.text }}>
                                {item.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Decisions Made */}
            {(data.decisions || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">
                  💡 Decisions Made
                </div>
                <div className="flex flex-col gap-2.5">
                  {(data.decisions || []).map((decision, i) => (
                    <div
                      key={i}
                      className="flex gap-4 px-[18px] py-4 rounded-[14px] bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.12)]"
                    >
                      <div className="w-[26px] h-[26px] rounded-full bg-[rgba(249,115,22,0.15)] border border-[rgba(249,115,22,0.25)] flex items-center justify-center text-[13px] font-extrabold text-[#f97316] shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-[15px] leading-[1.6] text-[var(--text-primary)] font-medium">
                        {typeof decision === "object" ? JSON.stringify(decision) : decision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {data.nextSteps && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">
                  🚀 Next Steps
                </div>
                <div className="flex gap-3.5 px-5 py-4 rounded-[14px] bg-[rgba(16,217,160,0.05)] border border-[rgba(16,217,160,0.15)]">
                  <span className="text-[20px] shrink-0">➡️</span>
                  <p className="text-[15px] leading-[1.7] text-[var(--text-secondary)] m-0">{data.nextSteps}</p>
                </div>
              </div>
            )}

            {/* Follow-Up Questions */}
            {(data.followUpQuestions || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">
                  ❓ Follow-Up Questions
                </div>
                <div className="flex flex-col gap-2.5">
                  {(data.followUpQuestions || []).map((q, i) => (
                    <div key={i} className="flex gap-3 items-start px-4 py-3.5 rounded-xl bg-[rgba(108,99,255,0.05)] border border-[rgba(108,99,255,0.12)]">
                      <span className="text-[14px] font-extrabold text-[#a78bfa] shrink-0 mt-[1px]">{i + 1}.</span>
                      <span className="text-[14px] leading-[1.6] text-[var(--text-secondary)]">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KEY DECISIONS TAB */}
        {resolvedTab === "decisions" && (
          <div className="flex flex-col gap-7">
            {/* Decisions */}
            <div>
              <div className="mb-5 pb-5 border-b border-[var(--border-card)] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(249,115,22,0.12)] flex items-center justify-center text-[18px]">💡</div>
                <div>
                  <div className="text-[16px] font-bold">Key Decisions</div>
                  <div className="text-[13px] text-[var(--text-muted)]">{(data.keyDecisions || data.decisions || data.key_decisions || []).length} decisions recorded</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {(data.keyDecisions || data.decisions || data.key_decisions || []).length === 0 ? (
                  <p className="text-[14px] text-[var(--text-muted)] italic py-3">No key decisions were recorded for this meeting.</p>
                ) : (
                  (data.keyDecisions || data.decisions || data.key_decisions || []).map((decision, i) => (
                    <div
                      key={i}
                      className="flex gap-4 px-5 py-[18px] rounded-[14px] bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.12)]"
                    >
                      <div className="w-7 h-7 rounded-full bg-[rgba(249,115,22,0.15)] border border-[rgba(249,115,22,0.25)] flex items-center justify-center text-[13px] font-extrabold text-[#f97316] shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-[15px] leading-[1.6] text-[var(--text-primary)] font-medium">
                        {renderRichText(decision)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Key Metrics */}
            {(data.keyMetrics || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">
                  📊 Key Metrics
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                  {data.keyMetrics.map((metric, i) => (
                    <div
                      key={i}
                      className="px-[18px] py-4 rounded-[14px] bg-[rgba(108,99,255,0.07)] border border-[rgba(108,99,255,0.15)] text-center"
                    >
                      <div className="text-[22px] font-extrabold text-[var(--accent-secondary)] mb-1">
                        {renderMetric(metric).split(" ")[0]}
                      </div>
                      {typeof metric === "object" && readRecordText(metric.label) && (
                        <div className="text-[12px] text-[var(--text-muted)] font-semibold">{readRecordText(metric.label)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {(data.risks || []).length > 0 && (
              <div>
                <div className="text-[13px] font-bold text-[var(--text-muted)] tracking-[0.06em] uppercase mb-3.5">
                  ⚠️ Risks
                </div>
                <div className="flex flex-col gap-2.5">
                  {data.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-[18px] py-3.5 rounded-xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)]"
                    >
                      <span className="text-[16px] shrink-0">🔴</span>
                      <span className="text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                        {renderRichText(risk)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {resolvedTab === "transcript" && (
          <div>
            <div className="mb-5 pb-5 border-b border-[var(--border-card)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(167,139,250,0.12)] flex items-center justify-center text-[18px]">📃</div>
                <div>
                  <div className="text-[16px] font-bold">Full Transcript</div>
                  <div className="text-[13px] text-[var(--text-muted)]">Excerpt — download PDF for complete transcript</div>
                </div>
              </div>
            </div>
            <div className="bg-[rgba(0,0,0,0.2)] rounded-[14px] p-6 font-mono text-[14px] leading-loose text-[var(--text-secondary)] border border-[var(--border-card)] whitespace-pre-line max-h-[520px] overflow-y-auto">
              {data.transcriptExcerpt || data.transcript_excerpt || data.transcript || ""}
            </div>
            <div className="mt-4 px-[18px] py-3.5 rounded-xl bg-[rgba(108,99,255,0.06)] border border-[rgba(108,99,255,0.15)] text-[13px] text-[var(--text-secondary)] flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {data.duration ? `This is an excerpt. The complete ${data.duration} transcript is included in your PDF download.` : "The complete transcript is included in your PDF download."}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
