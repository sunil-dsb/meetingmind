const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function generateSummary(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Summary failed");
    return data.data;
}

export async function transcribeAudio(file: File, language: string, speakerDiarization: boolean) {
    const formData = new FormData();
    formData.append("audio", file, "recording.webm");
    formData.append("language", language);
    formData.append("speakerDiarization", String(speakerDiarization));

    const res = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Transcription failed: ${res.status}`);
    }

    return await res.json();
}

export async function summarizeTranscript(transcript: string, language: string, summaryLength: string, selectedOutputs: string[]) {
    const res = await fetch(`${API_BASE_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            transcript,
            language,
            summaryLength,
            selectedOutputs,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Summarization failed: ${res.status}`);
    }

    return await res.json();
}