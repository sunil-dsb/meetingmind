import { Request, Response, Router } from "express";
import { deleteUploadedFile, upload } from "../middleware/upload.js";
import { transcribeAudio } from "../services/assemblyai.js";
import { TranscriptionResult } from "../types/index.js";
import { AppError } from "../utils/error.js";
import { asyncHandler, sendSuccess } from "../utils/helper.js";

const transcribeRouter = Router();

transcribeRouter.post(
  "/",
  upload.single("audio"),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError(
        "No audio file. Field name must be 'audio'",
        400,
        "NO_FILE",
      );
    }

    const filePath = req.file.path;

    const language: string = (req.body?.language as string) || "en";
    const speakerDiarization: boolean = (req.body?.speakerDiarization as string) !== "false";

    try {
      const result: TranscriptionResult = await transcribeAudio(filePath, {
        language,
        speakerDiarization,
      });
      sendSuccess<TranscriptionResult>(res, result);
    } finally {
      deleteUploadedFile(filePath); // always runs even if error thrown
    }
  }),
);

export default transcribeRouter;
