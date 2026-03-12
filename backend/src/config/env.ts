import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envScghema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000").transform(Number),
  ASSEMBLYAI_API_KEY: z.string().min(1, "ASSEMBLYAI_API_KEY is required"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),
  ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
  MAX_FILE_SIZE_MB: z.string().default("50").transform(Number),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  DEEPGRAM_API_KEY: z.string().min(1, "DEEPGRAM_API_KEY is required"),
});

const parsed = envScghema.safeParse(process.env);

if (!parsed.success) {
  console.error("Missing environment variables:\n");
  parsed.error.issues.forEach((e) => {
    console.error(`  ${e.path.join(".")} -> ${e.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
