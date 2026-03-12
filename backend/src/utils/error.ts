import { Response } from "express";
import { ApiError } from "../types";

export class AppError extends Error {
    constructor(
        message:string,
        public readonly statusCode: number = 500,
        public readonly code?: string
    )
    {
        super(message);
        this.name  = "AppError";
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function sendError(
  res: Response,
  message: string,
  status = 500,
  code?: string
): void {
  const body: ApiError = {
    success: false,
    error: message,
    ...(code ? { code } : {}),
  };
  res.status(status).json(body);
}