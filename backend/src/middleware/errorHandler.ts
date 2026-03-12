import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError, sendError } from "../utils/error.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      sendError(res, `File too large. Max is ${env.MAX_FILE_SIZE_MB}MB`, 413, "FILE_TOO_LARGE");
      return;
    }
    sendError(res, `Upload error: ${err.message}`, 400, "UPLOAD_ERROR");
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.code ?? "UNKNOWN"}]: ${err.message}`);
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  logger.error("Unhandled error", { message, path: req.path });

  sendError(
    res,
    env.NODE_ENV === "production" ? "Internal server error" : message,
    500,
    "INTERNAL_ERROR"
  );
};