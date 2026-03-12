"use client";

import { Config } from "@/types";
import { languageOptions, outputOptions, summaryLengthOptions } from "@/utils/constant";
import { FC, useCallback, useState } from "react";

interface ConfigSectionProps {
  config?: Config;
  onConfig: (config: Config) => void;
  disabled?: boolean;
}

const ConfigSection: FC<ConfigSectionProps> = ({ config, onConfig, disabled = false }) => {
  const [language, setLanguage] = useState("en");
  const [speakerDiarization, setSpeakerDiarization] = useState(true);
  const [selectedOutputs, setSelectedOutputs] = useState<Config["selectedOutputs"]>(["summary", "action_items", "pdf"]);
  const [summaryLength, setSummaryLength] = useState<Config["summaryLength"]>("medium");

  const notify = useCallback((updates: Partial<Config>) => {
    const next: Config = { language, speakerDiarization, selectedOutputs, summaryLength, ...updates };
    onConfig(next);
  }, [language, speakerDiarization, selectedOutputs, summaryLength, onConfig]);

  const handleLanguage = useCallback((val: string) => {
    setLanguage(val);
    notify({ language: val });
  }, [notify]);

  const handleDiarization = useCallback((val: boolean) => {
    setSpeakerDiarization(val);
    notify({ speakerDiarization: val });
  }, [notify]);

  const handleSummaryLength = useCallback((val: Config["summaryLength"]) => {
    setSummaryLength(val);
    notify({ summaryLength: val });
  }, [notify]);

  const toggleOutput = useCallback((id: Config["selectedOutputs"][number]) => {
    setSelectedOutputs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      notify({ selectedOutputs: next });
      return next;
    });
  }, [notify]);

  return (
    <section
      id="config-section"
      className={`px-6 pb-[60px] max-w-[760px] mx-auto transition-all duration-300 ${disabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
    >
      {/* Section label - EXACT equivalent */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-[14px] py-[5px] rounded-full bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] mb-4 text-xs font-bold text-accent-secondary uppercase tracking-[0.06em]">
          Step 2 of 3
        </div>
        <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-1px] mb-3">
          Configure Options
        </h2>
        <p className="text-base text-text-secondary leading-[1.6]">
          Customize how your meeting is processed and what you receive.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Language + Diarization row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Language */}
          <div className="bg-bg-card border border-border-card rounded-2xl p-5">
            <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-[0.05em] mb-3">
              🌐 Language
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguage(e.target.value)}
              id="language-select"
              className="w-full bg-black/20 border border-border-card rounded-xl text-text-primary px-[14px] py-[10px] text-[15px] font-medium cursor-pointer outline-none appearance-none bg-no-repeat bg-right"
            >
              {languageOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker diarization */}
          <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col justify-between">
            <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-[0.05em] mb-2">
              👥 Speaker Detection
            </label>
            <p className="text-[13px] text-text-muted mb-4 leading-[1.5]">
              Identify and label different speakers
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDiarization(!speakerDiarization)}
                id="speaker-toggle"
                className={`relative w-12 h-[26px] rounded-[13px] border-none cursor-pointer transition-all duration-300 flex-shrink-0 ${speakerDiarization
                  ? "bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] shadow-[0_0_15px_rgba(108,99,255,0.4)]"
                  : "bg-white/10"
                  }`}
              >
                <div
                  className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-300"
                  style={{ left: speakerDiarization ? "25px" : "3px" }}
                />
              </button>
              <span className={`text-sm font-semibold ${speakerDiarization ? "text-accent-secondary" : "text-text-muted"
                }`}>
                {speakerDiarization ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Output options */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-5">
          <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-[0.05em] mb-4">
            Output Options
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outputOptions.map((opt) => {
              const selected = selectedOutputs.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOutput(opt.id)}
                  id={`output-${opt.id}`}
                  type="button"
                  className={`
                    p-[14px_16px] rounded-xl cursor-pointer text-left transition-all duration-300 flex items-start gap-3 border
                    ${selected
                      ? "bg-[rgba(108,99,255,0.12)]"
                      : "bg-black/15 border-border-card hover:bg-purple-500/5"
                    }
                  `}
                  style={selected ? { borderColor: `${opt.color}44` } : undefined}
                >
                  <div>
                    <div
                      className={`text-sm font-bold mb-1 transition-colors duration-300 ${selected ? "" : "text-text-secondary"}`}
                      style={selected ? { color: opt.color } : undefined}
                    >
                      {opt.label}
                      {selected && <span className="ml-2 text-xs opacity-80">✓</span>}
                    </div>
                    <div className="text-xs text-text-muted leading-[1.4]">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary length */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-5">
          <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-[0.05em] mb-4">
            Summary Detail Level
          </label>
          <div className="flex gap-[10px] flex-wrap">
            {summaryLengthOptions.map((opt) => {
              const selected = summaryLength === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSummaryLength(opt.id)}
                  id={`summary-length-${opt.id}`}
                  className={`
                    flex-1 p-[12px_16px] rounded-xl cursor-pointer text-center transition-all duration-300
                    ${selected
                      ? "bg-gradient-to-r from-[rgba(108,99,255,0.2)] to-[rgba(167,139,250,0.15)] border-[rgba(108,99,255,0.4)]"
                      : "bg-black/15 border-border-card hover:bg-purple-500/5"
                    }
                  `}
                >
                  <div className={`text-sm font-bold mb-1 ${selected ? "text-accent-secondary" : "text-text-secondary"
                    }`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-text-muted">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfigSection;
