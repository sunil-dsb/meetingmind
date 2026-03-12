"use client";

import { disconnectSocket, getExistingSocket, getSocket } from "@/lib/socket";
import { CorrectedTranscript, FinalLine, PartialLine, RealtimeRecorderReturn, Segment } from "@/types/live.transcription";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

const SOCKET_EVENTS = [
    "session-started",
    "transcript-partial",
    "transcript-final",
    "session-stopped",
    "session-error",
    "transcript-corrected",
] as const;

function clearSocketListeners(socket: Socket): void {
    SOCKET_EVENTS.forEach((event) => socket.off(event));
}

export function useRealtimeRecorder(): RealtimeRecorderReturn {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [partialText, setPartialText] = useState<PartialLine | null>(null);
    const [finalLines, setFinalLines] = useState<FinalLine[]>([]);
    const [fullTranscript, setFullTranscript] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [correctedTranscript, setCorrectedTranscript] = useState<CorrectedTranscript | null>(null);
    const [isDiarizing, setIsDiarizing] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const workletRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef<boolean>(false);
    const sessionIdRef = useRef<string | null>(null);

    const cleanupLocalAudio = useCallback((): void => {
        if (workletRef.current) {
            workletRef.current.port.onmessage = null;
            workletRef.current.disconnect();
            workletRef.current = null;
        }

        if (audioContextRef.current) {
            void audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const teardownSocket = useCallback((emitStopSession: boolean): void => {
        const socket = getExistingSocket();
        if (!socket) return;

        if (emitStopSession && socket.connected) {
            socket.emit("stop-session");
        }

        clearSocketListeners(socket);
        disconnectSocket();
    }, []);

    useEffect(() => {
        return () => {
            const shouldStopSession = isRecordingRef.current || Boolean(sessionIdRef.current);
            isRecordingRef.current = false;
            cleanupLocalAudio();
            teardownSocket(shouldStopSession);
        };
    }, [cleanupLocalAudio, teardownSocket]);

    const startRecording = useCallback(async (): Promise<void> => {
        setError(null);
        setFinalLines([]);
        setPartialText(null);
        setFullTranscript("");
        setSessionId(null);
        setCorrectedTranscript(null);
        setIsDiarizing(false);
        sessionIdRef.current = null;
        isRecordingRef.current = true;

        const socket = getSocket();
        try {
            // Force fresh connection each recording
            if (socket.connected) {
                socket.disconnect();
                await new Promise<void>((resolve) => setTimeout(resolve, 200));
            }

            socket.connect();
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Socket connection timeout - please try again"));
                }, 10_000);

                socket.once("connect", () => {
                    clearTimeout(timeout);
                    resolve(undefined);
                });

                socket.once("connect_error", (connectError: Error) => {
                    clearTimeout(timeout);
                    reject(connectError);
                });
            });

            clearSocketListeners(socket);

            socket.on("transcript-partial", ({ text, speaker }: { text: string; speaker: string | null }) => {
                setPartialText({ text, speaker: speaker ?? null });
            });

            socket.on("transcript-final", ({ text, speaker, segments }: {
                text: string;
                speaker: string | null;
                segments: Segment[];
            }) => {
                setFinalLines((prev) => [
                    ...prev,
                    {
                        text,
                        speaker: speaker ?? null,
                        segments: segments ?? [],
                    },
                ]);
                setPartialText(null);
            });

            socket.on("session-stopped", ({ transcript }: { transcript: string }) => {
                setFullTranscript(transcript || "");
                setIsDiarizing(true);
                setIsRecording(false);
            });

            socket.on("transcript-corrected", ({
                segments,
                transcript,
                speakerCount,
            }: CorrectedTranscript) => {
                setCorrectedTranscript({ segments, transcript, speakerCount });
                setIsDiarizing(false);
                teardownSocket(false);
            });

            socket.on("session-error", ({ message }: { message: string }) => {
                setError(message);
                setIsRecording(false);
                setIsDiarizing(false);
                isRecordingRef.current = false;
                cleanupLocalAudio();
                teardownSocket(true);
            });

            socket.emit("start-session");

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Deepgram connection timeout - please try again"));
                }, 10_000);

                socket.once("session-started", ({ sessionId }: { sessionId: string }) => {
                    clearTimeout(timeout);
                    setSessionId(sessionId);
                    sessionIdRef.current = sessionId;
                    resolve(undefined);
                });

                socket.once("session-error", ({ message }: { message: string }) => {
                    clearTimeout(timeout);
                    reject(new Error(message));
                });
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleSize: 16,
                },
            });

            streamRef.current = stream;

            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            await audioContext.audioWorklet.addModule("/audio-processor.js");

            const worklet = new AudioWorkletNode(audioContext, "pcm-processor");
            workletRef.current = worklet;

            const source = audioContext.createMediaStreamSource(stream);

            let chunkCount = 0;

            worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
                if (!isRecordingRef.current) return;
                socket.emit("audio-chunk", e.data);
                chunkCount++;
                if (chunkCount % 50 === 0) {
                    console.log(`Sent ${chunkCount} PCM chunks`);
                }
            };

            source.connect(worklet);
            worklet.connect(audioContext.destination);

            setIsRecording(true);
        } catch (err: unknown) {
            const e = err instanceof Error ? err : new Error("Microphone error");
            const msg = e.message || "Microphone error";
            setError(
                e.name === "NotAllowedError"
                    ? "Microphone permission denied."
                    : msg
            );
            isRecordingRef.current = false;
            setIsRecording(false);
            setIsDiarizing(false);
            cleanupLocalAudio();
            teardownSocket(true);
        }
    }, [cleanupLocalAudio, teardownSocket]);

    const stopRecording = useCallback(() => {
        console.log("Stopping recording...");
        isRecordingRef.current = false;
        cleanupLocalAudio();

        const socket = getExistingSocket();
        if (socket?.connected) {
            socket.emit("stop-session");
        }

        setIsRecording(false);
    }, [cleanupLocalAudio]);

    return {
        isRecording,
        sessionId,
        sessionIdRef,
        partialText,
        finalLines,
        fullTranscript,
        error,
        startRecording,
        stopRecording,
        correctedTranscript,
        isDiarizing,
    } as RealtimeRecorderReturn;
}
