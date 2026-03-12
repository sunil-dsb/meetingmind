import { Request, Response } from "express";
import { summarizeMeeting } from "../services/summary/ai.summarize";
import { asyncHandler, sendSuccess } from "../utils/helper";

export const summarizeMeetingController = 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { transcript, language, summaryLength, selectedOutputs } = req.body as {
      transcript: string;
      language: string;
      summaryLength: "brief" | "medium" | "detailed";
      selectedOutputs: string[];
    };
    const summary = await summarizeMeeting(transcript, { language, summaryLength, selectedOutputs });
    sendSuccess(res, summary);
  })
