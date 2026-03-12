"use client";

import ErrorState from "@/components/ErrorState";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import InputModeTabs from "@/components/InputModeTabs";
import LiveTranscription from "@/components/live/LiveTranscription";
import Navbar from "@/components/Navbar";
import ProcessButton from "@/components/ProcessButton";
import ProcessingView from "@/components/ProcessingView";
import ResultsSection from "@/components/ResultsSection";
import ConfigSection from "@/components/upload/ConfigSection";
import UploadSection from "@/components/upload/UploadSection";
import { summarizeTranscript, transcribeAudio } from "@/lib/api";
import { Config, MeetingResult, Stage } from "@/types";
import { FileWithPath } from "@/types/file";
import { createMeetingResult, normalizeActionItems } from "@/utils/helper";
import { useCallback, useRef, useState, useTransition } from "react";


export default function HomePage() {
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("idle");
  const [inputMode, setInputMode] = useState<"upload" | "live">("upload");
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [config, setConfig] = useState<Config>({
    language: "en",
    speakerDiarization: true,
    selectedOutputs: ["summary", "action_items", "pdf"],
    summaryLength: "medium",
  });
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadRef = useRef<HTMLDivElement>(null);
  const apiDoneRef = useRef(false);
  const animDoneRef = useRef(false);
  const resultRef = useRef<MeetingResult | null>(null);

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({
      behavior: "smooth" as ScrollBehavior,
      block: "start"
    });
  }, []);

  const resetState = useCallback(() => {
    setFile(null);
    setResult(null);
    setErrorMsg("");
    setStage("idle");
    apiDoneRef.current = false;
    animDoneRef.current = false;
    resultRef.current = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const transitionToDone = useCallback((mergedResult: MeetingResult) => {
    setResult(mergedResult);
    requestAnimationFrame(() => {
      setStage("done");
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({
          behavior: "smooth" as ScrollBehavior,
          block: "start",
        });
      }, 300);
    });
  }, []);

  const handleFileSelect = useCallback((selectedFile: FileWithPath | null) => {
    setFile(selectedFile);
    setStage(selectedFile ? "ready" : "idle");
    if (selectedFile) setTimeout(scrollToUpload, 100);
  }, [scrollToUpload]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setErrorMsg("");
    apiDoneRef.current = false;
    animDoneRef.current = false;
    setStage("processing");

    try {
      const transcribeData = await transcribeAudio(
        file,
        config.language,
        config.speakerDiarization
      );

      const summarizeData = await summarizeTranscript(
        transcribeData.data.transcript,
        config.language,
        config.summaryLength,
        config.selectedOutputs
      );

      const mergedResult: MeetingResult = {
        title: summarizeData.data?.title ||
          transcribeData.data?.title ||
          file.name,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        conversationType: summarizeData.data?.conversationType ?? "",
        oneLineSummary: summarizeData.data?.oneLineSummary ?? "",
        summary: summarizeData.data?.fullSummary ?? summarizeData.data?.summary ?? "",
        speakers: summarizeData.data?.participants ?? transcribeData.data?.speakers ?? [],
        mainTopics: summarizeData.data?.mainTopics ?? [],
        keyPoints: summarizeData.data?.keyPoints ?? [],
        decisions: summarizeData.data?.decisions ?? summarizeData.data?.keyDecisions ?? [],
        actionItems: normalizeActionItems(
          summarizeData.data?.actionItems ?? summarizeData.data?.action_items
        ),
        keyMetrics: summarizeData.data?.keyMetrics ?? [],
        risks: summarizeData.data?.risks ?? [],
        sentiment: summarizeData.data?.sentiment ?? "",
        toneAnalysis: summarizeData.data?.toneAnalysis ?? "",
        insights: summarizeData.data?.insights ?? [],
        nextSteps: summarizeData.data?.nextSteps ?? "",
        followUpQuestions: summarizeData.data?.followUpQuestions ?? [],
        tags: summarizeData.data?.tags ?? [],
        pdf_url: summarizeData.data?.pdf_url ?? summarizeData.data?.pdfUrl ?? null,
        transcript: transcribeData.data?.transcript ?? "",
        duration: transcribeData.data?.duration ?? "",
      };

      resultRef.current = mergedResult;
      apiDoneRef.current = true;

      if (animDoneRef.current) {
        startTransition(() => {
          transitionToDone(mergedResult);
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Processing error:", error);
      setErrorMsg(error.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  }, [file, config, transitionToDone, startTransition]);

  const showLanding = stage === "idle" || stage === "ready";
  const showProcessing = stage === "processing" || isPending;
  const showResults = stage === "done";
  const showError = stage === "error";

  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-grid-purple/4"
        aria-hidden
        suppressHydrationWarning
      />
      <div className="relative z-10">
        {showLanding && !showResults && (
          <Hero onScrollToUpload={scrollToUpload} />
        )}

        {!showProcessing && !showResults && !showError && (
          <section ref={uploadRef} className="space-y-16">
            {showLanding && (
              <div className="max-w-3xl mx-auto mb-16 px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-16" />
              </div>
            )}

            <InputModeTabs inputMode={inputMode} setInputMode={setInputMode} />

            {inputMode === "upload" ? (
              <div className="space-y-8">
                <UploadSection onFileSelect={handleFileSelect} />
                <ConfigSection
                  disabled={!file}
                  config={config}
                  onConfig={setConfig}
                />
              </div>
            ) : (
              <div className="flex justify-center items-start w-full px-4 sm:px-6">
                <LiveTranscription
                  onSummaryGenerated={(res) => {
                    const mergedResult: MeetingResult = createMeetingResult(res);

                    setConfig(prev => ({
                      ...prev,
                      selectedOutputs: ["summary", "action_items", "transcript", "pdf"]
                    }));

                    transitionToDone(mergedResult);
                  }}
                />
              </div>
            )}

            {inputMode === "upload" && file && (
              <ProcessButton
                file={file}
                isPending={isPending}
                onProcess={handleProcess}
              />
            )}
          </section>
        )}
        {showError && <ErrorState errorMsg={errorMsg} onReset={resetState} />}
        {stage === "idle" && <FeaturesSection />}
        <ProcessingView
          isVisible={showProcessing}
          onComplete={() => {
            animDoneRef.current = true;
            if (apiDoneRef.current && resultRef.current) {
              transitionToDone(resultRef.current);
            }
          }}
        />
        <ResultsSection
          isVisible={showResults}
          result={result}
          onReset={resetState}
          selectedOutputs={config.selectedOutputs}
        />
        {!showProcessing && <Footer />}
      </div>
    </main>
  );
}
