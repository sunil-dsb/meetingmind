"use client";

import { FileWithPath } from '@/types/file';
import { FC } from 'react';
import PlayAnalysisIcon from './icons/PlayAnalysisIcon';
import UploadPromptIcon from './icons/UploadPromptIcon';

interface ProcessButtonProps {
  file: FileWithPath | null;
  onProcess: () => void;
  isPending?: boolean;
}

const ProcessButton: FC<ProcessButtonProps> = ({ file, onProcess, isPending = false }) => {
  return (
    <div className="max-w-[760px] mx-auto px-6 pb-24 flex flex-col items-center justify-center text-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full font-bold tracking-widest uppercase text-[12px] px-4 py-[6px] mb-5 border border-border-subtle text-accent-primary bg-accent-glow">
          Step 3 of 3
        </div>

        <h2 className="font-extrabold tracking-tight text-[clamp(24px,3.5vw,36px)] mb-3 leading-[1.2] text-text-primary">
          Analyze Your Meeting
        </h2>

        <p className="leading-relaxed text-[15px] text-text-secondary">
          {file
            ? `Ready to process "${file.name}"`
            : "Upload an audio file first to get started"
          }
        </p>
      </div>

      <button
        onClick={onProcess}
        disabled={!file || isPending}
        id="start-analysis-btn"
        className={`inline-flex justify-center items-center gap-3 rounded-2xl font-black transition-all duration-300 ease-in-out px-12 py-4 text-[17px] w-full sm:w-auto max-w-md
          ${file && !isPending
            ? "cursor-pointer text-white border-none bg-gradient-to-r from-accent-primary to-accent-secondary shadow-[0_12px_40px_var(--accent-glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_60px_var(--accent-glow)] active:scale-[0.98]"
            : "cursor-not-allowed bg-bg-secondary text-text-muted border border-border-card opacity-60"
          }`}
      >
        {file && !isPending ? (
          <>
            <PlayAnalysisIcon />
            Start Analysis
          </>
        ) : (
          <>
            <UploadPromptIcon />
            Upload a File First
          </>
        )}
      </button>

      {file && (
        <p className="text-[13px] mt-4 text-text-secondary">
          Your audio is processed securely and never stored permanently
        </p>
      )}
    </div>
  );
};

export default ProcessButton;
