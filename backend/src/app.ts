import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import sessionRouter from "./routes/session";
import summarizeRouter from "./routes/summarize";
import transcribeRouter from "./routes/transcribe";
import { registerRealtimeHandlers } from "./services/live.transcription.service";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e7,
});

registerRealtimeHandlers(io);

app.use(cors({ origin: env.ALLOWED_ORIGIN, methods: ["GET", "POST"] }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests", code: "RATE_LIMITED" },
});

app.use("/api", limiter);

app.use("/api/transcribe", transcribeRouter);
app.use("/api/summarize", summarizeRouter);
app.use("/api/sessions", sessionRouter);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: "Route not found", code: "NOT_FOUND" });
});

app.use(errorHandler);

async function start() {
  httpServer.listen(env.PORT, () => {
    logger.info("Backend running", { url: `http://localhost:${env.PORT}` });
    logger.info(`Health -> http://localhost:${env.PORT}/api/health`);
  });
}

start();

export default app;
