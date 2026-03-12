import { Request, Response, Router } from "express";
import { z } from "zod";
import {
  getSessionRecord,
  listSessionRecords,
  updateSessionRecord,
} from "../cache/session.metadata.js";
import { redis, RedisKeys } from "../config/redis.js";
import { validateBody } from "../middleware/validate.js";
import { summarizeMeeting } from "../services/summary/ai.summarize.js";
import { AppError } from "../utils/error.js";
import { asyncHandler, sendSuccess } from "../utils/helper.js";

const sessionRouter = Router();

const generateSummarySchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

sessionRouter.post(
  "/summary",
  validateBody(generateSummarySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body as { sessionId: string };

    const session = await getSessionRecord(sessionId);

    if (!session) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    if (!session.transcript || session.transcript.trim().length < 20) {
      throw new AppError("Transcript too short", 400, "TRANSCRIPT_TOO_SHORT");
    }

    await updateSessionRecord(sessionId, { status: "SUMMARIZING" });

    const summary = await summarizeMeeting(session.transcript);

    await updateSessionRecord(sessionId, {
      summary: summary as object,
      status: "DONE",
    });

    const updatedSession = await getSessionRecord(sessionId);
    if (!updatedSession) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    await redis.del(RedisKeys.transcript(sessionId));
    await redis.del(RedisKeys.status(sessionId));

    sendSuccess(res, {
      sessionId,
      summary,
      transcript: updatedSession.transcript,
      duration: updatedSession.duration,
      createdAt: updatedSession.createdAt,
    });
  }),
);

sessionRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.params["id"];
    if (!sessionId || Array.isArray(sessionId)) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    const session = await getSessionRecord(sessionId);

    if (!session) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    sendSuccess(res, session);
  }),
);

sessionRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const sessions = await listSessionRecords(50);

    sendSuccess(
      res,
      sessions.map(({ id, status, duration, summary, createdAt }) => ({
        id,
        status,
        duration,
        summary,
        createdAt,
      })),
    );
  }),
);

export default sessionRouter;
