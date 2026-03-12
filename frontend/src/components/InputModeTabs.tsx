"use client";

import { FC } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface InputModeTabsProps {
  inputMode: 'upload' | 'live';
  setInputMode: (mode: 'upload' | 'live') => void;
}

const InputModeTabs: FC<InputModeTabsProps> = ({
  inputMode,
  setInputMode
}) => {
  return (
    <div className="flex justify-center mb-12 px-4">
      <div className="flex bg-bg-card border border-border-subtle rounded-full p-1.5 gap-1 shadow-sm w-full max-w-md">
        {/* Upload Tab - EXACT original styling */}
        <button
          onClick={() => setInputMode("upload")}
          className={`flex-1 px-4 py-2.5 rounded-full text-sm border-none cursor-pointer transition-all duration-300 whitespace-nowrap text-center outline-none 
            ${inputMode === "upload"
              ? "bg-accent-glow text-accent-primary font-extrabold"
              : "bg-transparent text-text-secondary font-semibold"
            }`}
          aria-pressed={inputMode === "upload"}
          aria-label="Upload Audio mode"
        >
          Upload Audio
        </button>

        {/* Live Tab - EXACT original styling */}
        <button
          onClick={() => setInputMode("live")}
          className={`flex-1 px-4 py-2.5 rounded-full text-sm border-none cursor-pointer transition-all duration-300 whitespace-nowrap text-center outline-none 
            ${inputMode === "live"
              ? "bg-accent-glow text-accent-primary font-extrabold"
              : "bg-transparent text-text-secondary font-semibold"
            }`}
          aria-pressed={inputMode === "live"}
          aria-label="Live Transcription mode"
        >

          Live Transcription
        </button>
      </div>
    </div>
  );
};

export default InputModeTabs;
