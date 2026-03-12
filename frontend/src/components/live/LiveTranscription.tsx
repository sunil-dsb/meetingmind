"use client";

import { useRealtimeRecorder } from "@/hooks/useRealtimeRecorder";
import { generateSummary } from "@/lib/api";
import { FinalLine, LiveTranscriptionProps, RealtimeRecorderReturn, Segment } from "@/types/live.transcription";
import { getSpeakerColor } from "@/utils/helper";
import { ArrowRight } from "lucide-react";
import { FC, useCallback, useState } from "react";
import SpeakerLine from "./SpeakerLine";


const LiveTranscription: FC<LiveTranscriptionProps> = ({ onSummaryGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const {
        isRecording,
        sessionId,
        partialText,
        finalLines,
        error,
        startRecording,
        stopRecording,
        correctedTranscript,
        isDiarizing,
    }: RealtimeRecorderReturn = useRealtimeRecorder();

    const handleSummary = useCallback(async () => {
        if (!sessionId) return;
        setSummaryError(null);
        setLoading(true);
        try {
            const result = await generateSummary(sessionId);
            onSummaryGenerated?.(result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Summary generation failed.";
            setSummaryError(message);
        } finally {
            setLoading(false);
        }
    }, [sessionId, onSummaryGenerated]);

    return (
        <div className="w-full max-w-[900px] font-inherit mx-auto">
            {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 px-5 rounded-xl mb-6 flex items-center gap-3 text-[15px]">
                    <span className="text-[20px]">⚠️</span> {error}
                </div>
            )}
            {summaryError && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 px-5 rounded-xl mb-6 flex items-center gap-3 text-[15px]">
                    <span className="text-[20px]">!</span> {summaryError}
                </div>
            )}

            <div className="flex justify-center gap-3 flex-wrap mb-8 w-full">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl text-[16px] font-bold shadow-[0_8px_20px_rgba(34,197,94,0.25)] border-none cursor-pointer flex items-center gap-2 transition-transform duration-300 hover:-translate-y-[2px] active:scale-[0.98]"
                    >
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-8 py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl text-[16px] font-bold shadow-[0_8px_20px_rgba(239,68,68,0.25)] border-none cursor-pointer flex items-center gap-2 transition-transform duration-300 hover:-translate-y-[2px] active:scale-[0.98]"
                    >
                        <div className="w-3 h-3 rounded-sm bg-white animate-pulse" />
                        Stop Recording
                    </button>
                )}

                {/* Summary button */}
                {!isRecording && correctedTranscript && (
                    <button
                        onClick={handleSummary}
                        disabled={loading}
                        className={`px-8 py-4 bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-xl text-[16px] font-bold shadow-[0_8px_20px_rgba(108,99,255,0.25)] border-none flex items-center gap-2 transition-all duration-300 ${loading
                            ? "cursor-default opacity-70"
                            : "cursor-pointer hover:-translate-y-[2px] active:scale-[0.98]"
                            }`}
                    >
                        ✨ {loading ? "Generating Summary..." : "Generate Summary"}
                    </button>
                )}
            </div>

            {/* ── Live Transcript Box ── */}
            <div className="bg-bg-card border border-border-card rounded-[20px] p-6 min-h-[300px] mb-8 shadow-sm text-left w-full">
                <div className="flex justify-between items-center flex-wrap gap-2 mb-6 pb-4 border-b border-border-card">
                    <div className="text-[13px] text-text-muted font-semibold tracking-[2px]">
                        LIVE TRANSCRIPT
                    </div>
                    {sessionId && (
                        <div className="text-[12px] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                            Session: {sessionId.slice(-8)}
                        </div>
                    )}
                </div>

                <div className="font-mono text-[15px] leading-[1.8]">
                    {/* Final confirmed lines */}
                    {finalLines.map((line: FinalLine, i: number) => {
                        if (line.segments && line.segments.length > 0) {
                            return (
                                <div key={i} className="mb-3">
                                    {line.segments.map((seg: Segment, j: number) => (
                                        <SpeakerLine key={j} speaker={seg.speaker} text={seg.text} />
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <div key={i} className="mb-3">
                                <SpeakerLine speaker={line.speaker} text={line.text} />
                            </div>
                        );
                    })}

                    {/* Partial live words */}
                    {partialText && (
                        <div className="flex gap-3 items-start opacity-70">
                            <span
                                className="font-bold tracking-[0.5px] uppercase shrink-0 min-w-[70px] text-[11px] pt-[3px]"
                                style={{ color: getSpeakerColor(partialText.speaker) }}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </span>
                            <span className="text-purple-400 italic leading-[1.7]">
                                {partialText.text}
                                <span className="inline-block animate-pulse w-2 h-[15px] bg-purple-400 ml-1 align-middle" />
                            </span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isRecording && finalLines.length === 0 && !partialText && (
                        <div className="text-text-secondary text-center py-10 italic">
                            Press <span className="text-emerald-500 font-semibold">Start Recording</span> to begin...
                        </div>
                    )}
                </div>
            </div>

            {/* ── Diarizing spinner ── */}
            {isDiarizing && (
                <div className="flex items-center gap-3.5 bg-purple-500/5 border border-purple-500/20 rounded-[14px] px-6 py-[18px] mb-6">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-500/20 border-t-purple-600 animate-spin shrink-0" />
                    <div>
                        <div className="text-purple-400 font-semibold text-[14px]">
                            Identifying speakers...
                        </div>
                        <div className="text-text-muted text-[12px] mt-0.5">
                            We are analysing the full audio — usually takes 15–30 seconds
                        </div>
                    </div>
                </div>
            )}

            {/* ── Corrected Transcript ── */}
            {correctedTranscript && (
                <div className="bg-bg-card border border-emerald-500/25 rounded-[20px] p-6 mb-8 shadow-sm w-full">
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-6 pb-4 border-b border-border-card">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-[13px] text-text-muted font-semibold tracking-[2px]">
                                FINAL TRANSCRIPT
                            </div>
                            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-[10px] py-[2px] rounded-full font-semibold whitespace-nowrap">
                                ✓ Speaker-verified
                            </div>
                        </div>
                        <div className="text-[12px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                            🎙 {correctedTranscript.speakerCount} speaker{correctedTranscript.speakerCount !== 1 ? "s" : ""} detected
                        </div>
                    </div>

                    <div className="font-mono text-[15px] leading-[1.8]">
                        {correctedTranscript.segments.map((seg: Segment, i: number) => (
                            <div key={i} className="mb-3">
                                <SpeakerLine speaker={seg.speaker} text={seg.text} isfinal={true} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveTranscription;

