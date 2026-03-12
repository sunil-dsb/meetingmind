# MeetingMind

MeetingMind is an AI-powered meeting intelligence platform that turns spoken conversations into:

- accurate transcripts
- structured summaries
- action items and decisions
- downloadable PDF reports

This repo is a `pnpm` monorepo with:

- `frontend` (Next.js app)
- `backend` (Express + Socket.IO + Redis + AI services)

## What This Project Is For

Use MeetingMind when you want to:

- upload recorded meeting audio and get structured insights
- run live transcription during a meeting
- extract action items, key points, decisions, risks, and next steps
- generate shareable summary PDFs

## Core Features

- Upload transcription using AssemblyAI 
- Live streaming transcription over Socket.IO + Deepgram
- Post-session speaker-corrected transcript (AssemblyAI diarization pass)
- LLM summarization through OpenRouter via AI SDK 
- Session metadata and transcript persistence in Redis
- Client-side PDF report generation from summary results

## Monorepo Structure

```text
meetingmind/
|- package.json                # workspace scripts
|- pnpm-workspace.yaml
|- pnpm-lock.yaml
|- frontend/                   # Next.js 16 + React 19 UI
|  `- src/
|     |- app/page.tsx          # main app flow (upload/live/results)
|     |- hooks/useRealtimeRecorder.ts
|     `- components/
`- backend/                    # Express API + Socket server
   `- src/
      |- app.ts                # API + Socket bootstrap
      |- routes/               # transcribe/summarize/sessions endpoints
      |- services/             # transcription + summary services
      |- cache/                # Redis session/transcript persistence
      `- config/               # env/logger/redis config
```

## High-Level Architecture

### Upload flow

1. Frontend uploads audio file to `POST /api/transcribe`.
2. Backend stores upload temporarily, sends it to AssemblyAI, returns transcript + utterances.
3. Frontend calls `POST /api/summarize` with transcript + summary options.
4. Backend runs summary generators and returns structured JSON.
5. Frontend renders results and can generate a PDF locally.

### Live flow

1. Frontend opens Socket.IO connection and emits `start-session`.
2. Backend creates a Redis-backed session and streams PCM audio to Deepgram.
3. Frontend receives live partial/final transcript events.
4. On `stop-session`, backend immediately returns current transcript.
5. Backend asynchronously runs full-audio AssemblyAI diarization and emits `transcript-corrected`.
6. Frontend triggers `POST /api/sessions/summary` to generate summary from stored transcript.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind
- Backend: Node.js, Express 5, TypeScript, Socket.IO
- AI/ML:
  - AssemblyAI (batch transcription + diarization)
  - Deepgram (realtime transcription)
  - OpenRouter via AI SDK (LLM summarization)
- Data: Redis (session state + transcript persistence)

## Prerequisites

- Node.js 20+ (22 recommended)
- `pnpm` 10+
- Redis instance
- API keys:
  - AssemblyAI
  - Deepgram
  - OpenRouter

## Setup

1. Install dependencies from repo root:

```bash
pnpm install
```

2. Create backend env file at `backend/.env`:

```env
NODE_ENV=development
PORT=5000
ALLOWED_ORIGIN=http://localhost:3000

ASSEMBLYAI_API_KEY=your_assemblyai_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENROUTER_API_KEY=your_openrouter_key

REDIS_URL=redis://localhost:6379

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=50
```

3. (Optional) Create frontend env file at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

If omitted, frontend falls back to those same localhost defaults.

## Run Locally

From repo root:

```bash
pnpm dev
```

This starts both apps in parallel:

- frontend: `http://localhost:3000`
- backend: `http://localhost:5000`

Useful commands:

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm build
pnpm lint
pnpm typecheck
```

## API Reference (Backend)

Base URL: `http://localhost:5000/api`

- `GET /health`
  - Health check

- `POST /transcribe`
  - Multipart form-data:
    - `audio` (file, required)
    - `language` (optional, default `en`)
    - `speakerDiarization` (optional, default `true`)

- `POST /summarize`
  - JSON body:
    - `transcript` (required, min 20 chars)
    - `language` (`en` default)
    - `summaryLength` (`brief | medium | detailed`)
    - `selectedOutputs` (string array)

- `POST /sessions/summary`
  - JSON body:
    - `sessionId` (required)
  - Generates summary for a live session transcript already stored in Redis.

- `GET /sessions/:id`
  - Fetch session metadata and status.

- `GET /sessions`
  - List recent sessions.

Success response format:

```json
{ "success": true, "data": {} }
```

Error response format:

```json
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

## Socket Events (Live Mode)

Client emits:

- `start-session`
- `audio-chunk` (PCM 16kHz mono chunks)
- `stop-session`

Server emits:

- `session-started`
- `transcript-partial`
- `transcript-final`
- `session-stopped`
- `transcript-corrected`
- `session-error`

## Code Map (Where To Read First)

- Frontend entry and UI flow: `frontend/src/app/page.tsx`
- Live recording + socket orchestration: `frontend/src/hooks/useRealtimeRecorder.ts`
- Backend bootstrap and routing: `backend/src/app.ts`
- Live transcription orchestration: `backend/src/services/live.transcription.service.ts`
- Upload transcription service: `backend/src/services/assemblyai.ts`
- Summary orchestration: `backend/src/services/summary/ai.summarize.ts`
- Env contract: `backend/src/config/env.ts`

## Notes

- Frontend and backend enforce a 50 MB upload size limit.
- Redis is required for live session flow and session summary endpoints.
