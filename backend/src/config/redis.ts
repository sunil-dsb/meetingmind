import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error",   (err) => logger.error(" Redis error", { err }));

// Keys helper — keeps all Redis keys consistent
export const RedisKeys = {
  transcript: (sessionId: string) => `session:${sessionId}:transcript`,
  session:    (sessionId: string) => `session:${sessionId}:meta`,
  status:     (sessionId: string) => `session:${sessionId}:status`,
  sessionsIndex: "sessions:index",
};

export const TRANSCRIPT_TTL = 60 * 60;
