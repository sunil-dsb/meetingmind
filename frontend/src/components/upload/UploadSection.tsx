"use client";

import { FileWithPath } from "@/types/file";
import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/utils/constant";
import { formatBytes, formatDuration } from "@/utils/helper";
import { FC, useCallback, useRef, useState } from "react";
import DurationIcon from "../icons/DurationIcon";
import FileAudioIcon from "../icons/FIleIcon";
import FileSizeIcon from "../icons/FileSizeIcon";
import RemoveFileIcon from "../icons/RemoveFileIcon";
import UploadFileIcon from "../icons/UploadFileIcon";

interface UploadSectionProps {
  onFileSelect: (file: FileWithPath | null) => void;
}

const UploadSection: FC<UploadSectionProps> = ({ onFileSelect }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((selectedFile: File): string | null => {
    const fileName = selectedFile.name.toLowerCase();
    const ext = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
    const mimeType = selectedFile.type.toLowerCase();

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      return "File is too large. Maximum allowed size is 50 MB.";
    }

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file extension "${ext || "unknown"}". Please upload one of: ${ACCEPTED_EXTENSIONS.join(", ")}.`;
    }

    if (mimeType && !ACCEPTED_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_MIME_TYPES)[number])) {
      return `Unsupported file type "${mimeType}". Please upload a valid audio/video recording file.`;
    }

    return null;
  }, []);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    const error = validateFile(selectedFile);
    if (error) {
      setValidationError(error);
      setFile(null);
      setAudioDuration(null);
      onFileSelect?.(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setValidationError(null);
    const fileWithPath = selectedFile as FileWithPath;
    setFile(fileWithPath);
    onFileSelect?.(fileWithPath);

    const url = URL.createObjectURL(selectedFile);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setAudioDuration(null);
      URL.revokeObjectURL(url);
    };
  }, [onFileSelect, validateFile]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const removeFile = useCallback(() => {
    setFile(null);
    setAudioDuration(null);
    setValidationError(null);
    onFileSelect?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onFileSelect]);

  return (
    <section id="upload-section" className="px-6 pb-20 max-w-[760px] mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full font-bold tracking-widest uppercase bg-[var(--accent-glow)] border border-[var(--border-subtle)] text-[var(--accent-primary)] px-4 py-1.5 text-xs mb-5">
          Step 1 of 3
        </div>
        <h2 className="font-extrabold tracking-tight text-[var(--text-primary)] text-[clamp(24px,3.5vw,36px)] mb-3 leading-[1.2]">
          Upload Your Recording
        </h2>
        <p className="leading-relaxed text-[15px] text-[var(--text-secondary)]">
          Supports MP3, WAV, M4A, OGG, FLAC and more. Max 50 MB.
        </p>
      </div>

      {!file ? (
        <div
          className={`upload-zone py-[60px] px-10 text-center relative overflow-hidden ${dragOver ? "drag-over" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          id="audio-upload-dropzone"
        >
          {dragOver && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-[rgba(108,99,255,0.3)] animate-[spin-slow_linear_infinite]"
                  style={{
                    width: `${i * 120}px`,
                    height: `${i * 120}px`,
                    animationDuration: `${3 + i}s`
                  }}
                />
              ))}
            </div>
          )}

          <div
            className={`w-20 h-20 rounded-[20px] flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${dragOver
              ? "bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(16,217,160,0.2)] border border-[rgba(108,99,255,0.4)] scale-110"
              : "bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] scale-100"
              }`}
          >
            <UploadFileIcon />
          </div>

          <h3 className="text-[20px] font-bold mb-2">
            {dragOver ? "Drop your audio file here" : "Drag & drop your audio file"}
          </h3>
          <p className="text-[var(--text-secondary)] text-[15px] mb-6">
            or click to browse from your computer
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {ACCEPTED_EXTENSIONS.map((ext) => (
              <span
                key={ext}
                className="px-3 py-1 rounded-full bg-[rgba(108,99,255,0.08)] border border-[rgba(108,99,255,0.15)] text-xs font-semibold text-[var(--text-secondary)] tracking-wider"
              >
                {ext.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[rgba(108,99,255,0.2)] rounded-[20px] p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(16,217,160,0.2)] border border-[rgba(108,99,255,0.3)] flex items-center justify-center shrink-0">
              <FileAudioIcon />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {file.name}
              </div>
              <div className="flex gap-4 flex-wrap">
                <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-1">
                  <FileSizeIcon />

                  {formatBytes(file.size)}
                </span>
                {audioDuration && (
                  <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-1">
                    <DurationIcon />
                    {formatDuration(audioDuration)}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(16,217,160,0.1)] border border-[rgba(16,217,160,0.2)] text-[11px] font-bold text-[#10d9a0] tracking-wider">
                  ✓ Ready
                </span>
              </div>
            </div>

            <button
              onClick={removeFile}
              id="remove-file-btn"
              className="bg-[rgba(255,80,80,0.08)] border border-[rgba(255,80,80,0.15)] rounded-[10px] text-[#ff5050] w-9 h-9 cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[rgba(255,80,80,0.15)] hover:scale-110"
            >
              <RemoveFileIcon />

            </button>
          </div>
        </div>
      )}

      {validationError && (
        <p className="mt-4 text-[13px] leading-relaxed text-red-500 text-center">
          {validationError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        id="audio-file-input"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </section>
  );
};

export default UploadSection;
