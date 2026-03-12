import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema, } from "zod";
import { sendError } from "../utils/error.js";

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(
        (e: ZodError["issues"][number]) => ({
          field: e.path.join("."),
          message: e.message,
        })
      );
      sendError(
        res,
        `Validation failed: ${errors.map((e) => `${e.field} — ${e.message}`).join("; ")}`,
        400,
        "VALIDATION_ERROR"
      );
      return;
    }

    req.body = result.data;
    next();
  };
};