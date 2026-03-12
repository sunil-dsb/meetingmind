import { randomUUID } from "crypto";
import { redis, RedisKeys } from "../config/redis.js";

export type SessionStatus =
  | "RECORDING"
  | "TRANSCRIBING"
  | "SUMMARIZING"
  | "DONE"
  | "ERROR";

export interface SessionRecord {
  id: string;
  transcript: string;
  summary: object | null;
  duration: number | null;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

type SessionUpdate = Partial<
  Pick<SessionRecord, "transcript" | "summary" | "duration" | "status">
>;

function serializeSession(record: SessionRecord): string {
  return JSON.stringify(record);
}

function parseSession(raw: string | null): SessionRecord | null {
  if (!raw) return null;
  return JSON.parse(raw) as SessionRecord;
}

export async function createSessionRecord(): Promise<SessionRecord> {
  const now = new Date().toISOString();
  const session: SessionRecord = {
    id: randomUUID(),
    transcript: "",
    summary: null,
    duration: null,
    status: "RECORDING",
    createdAt: now,
    updatedAt: now,
  };

  await redis
    .multi()
    .set(RedisKeys.session(session.id), serializeSession(session))
    .zadd(RedisKeys.sessionsIndex, Date.now(), session.id)
    .exec();

  return session;
}

export async function getSessionRecord(
  sessionId: string,
): Promise<SessionRecord | null> {
  return parseSession(await redis.get(RedisKeys.session(sessionId)));
}

export async function updateSessionRecord(
  sessionId: string,
  update: SessionUpdate,
): Promise<void> {
  const current = await getSessionRecord(sessionId);
  if (!current) return;

  const next: SessionRecord = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(RedisKeys.session(sessionId), serializeSession(next));
}

export async function listSessionRecords(
  limit = 50,
): Promise<SessionRecord[]> {
  const sessionIds = await redis.zrevrange(
    RedisKeys.sessionsIndex,
    0,
    limit - 1,
  );
  if (sessionIds.length === 0) return [];

  const sessions = await Promise.all(
    sessionIds.map((sessionId) => getSessionRecord(sessionId)),
  );
  return sessions.filter((session): session is SessionRecord => session !== null);
}

export async function deleteSessionRecord(sessionId: string): Promise<void> {
  await redis
    .multi()
    .del(RedisKeys.session(sessionId))
    .zrem(RedisKeys.sessionsIndex, sessionId)
    .exec();
}
