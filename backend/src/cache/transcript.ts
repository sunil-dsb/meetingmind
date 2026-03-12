import { logger } from "../config/logger.js";
import { redis, RedisKeys, TRANSCRIPT_TTL } from "../config/redis.js";
import { TranscriptSegment } from "../types/deepgram.types.js";
import {
  createSessionRecord,
  deleteSessionRecord,
  SessionStatus,
  updateSessionRecord,
} from "./session.metadata.js";

const APPEND_TRANSCRIPT_SCRIPT = `
local key = KEYS[1]
local ttl = tonumber(ARGV[1])
local chunk = ARGV[2]

if chunk == nil or chunk == "" then
  return redis.call("EXPIRE", key, ttl)
end

local currentLength = redis.call("STRLEN", key)
if currentLength > 0 then
  redis.call("APPEND", key, "\\n")
end

redis.call("APPEND", key, chunk)
redis.call("EXPIRE", key, ttl)

return currentLength
`;

export class TranscriptStore {
  async createSession(): Promise<string> {
    const session = await createSessionRecord();
    await redis.setex(RedisKeys.transcript(session.id), TRANSCRIPT_TTL, "");
    await redis.setex(RedisKeys.status(session.id), TRANSCRIPT_TTL, session.status);
    return session.id;
  }

  async updateStatus(
    sessionId: string,
    status: SessionStatus,
    transcript?: string,
  ): Promise<void> {
    await redis.setex(RedisKeys.status(sessionId), TRANSCRIPT_TTL, status).catch((err) =>
      logger.error("Redis status update failed", { err, sessionId, status }),
    );

    await updateSessionRecord(sessionId, {
      status,
      ...(transcript !== undefined ? { transcript } : {}),
    }).catch((err) =>
      logger.error("Session metadata update failed", { err, sessionId, status }),
    );
  }

  async getTranscript(sessionId: string): Promise<string> {
    return (await redis.get(RedisKeys.transcript(sessionId))) ?? "";
  }

  async appendSegments(
    sessionId: string,
    segments: TranscriptSegment[],
  ): Promise<void> {
    const formatted = segments.map((s) => `${s.speaker}: ${s.text}`).join("\n");
    await redis.eval(
      APPEND_TRANSCRIPT_SCRIPT,
      1,
      RedisKeys.transcript(sessionId),
      String(TRANSCRIPT_TTL),
      formatted,
    );
  }

  async setTranscript(sessionId: string, transcript: string): Promise<void> {
    await redis.setex(
      RedisKeys.transcript(sessionId),
      TRANSCRIPT_TTL,
      transcript,
    );
    await updateSessionRecord(sessionId, {
      transcript,
      status: "DONE",
    }).catch((err) =>
      logger.error("Session transcript save failed", { err, sessionId }),
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await redis
      .del(
        RedisKeys.transcript(sessionId),
        RedisKeys.status(sessionId),
      )
      .catch((err) =>
        logger.error("Redis session cleanup failed", { err, sessionId }),
      );

    await deleteSessionRecord(sessionId).catch((err) =>
      logger.error("Session metadata delete failed", { err, sessionId }),
    );
  }
}
