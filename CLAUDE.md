# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start dev server in background (logs to logs.txt)
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest test suite
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Force Prisma migration reset
```

To run a single test file: `npx vitest run src/lib/__tests__/file-system.test.ts`

## Architecture

UIGen is a Next.js 15 (App Router) application that lets users describe React components in natural language; Claude AI generates the code via streaming tool calls, with a live iframe preview.

### Data Flow

1. User sends a chat message → `ChatInterface` → `POST /api/chat`
2. The API route creates a `VirtualFileSystem` from serialized project state, then calls Claude with streaming
3. Claude uses tool calls (`str_replace_editor`, `file_manager`) to create/edit files in the virtual FS
4. File changes stream back in real-time; `FileSystemContext` holds live state on the client
5. `PreviewFrame` picks up the active file, transforms JSX via Babel standalone, and renders in an iframe using `esm.sh` as the CDN for external imports
6. Authenticated users have project state persisted to SQLite (via Prisma); anonymous users track work in localStorage

### Key Modules

- **`/src/app/api/chat/`** — Streaming chat endpoint; creates the FS, builds the system prompt, registers tools, streams Claude's response
- **`/src/lib/file-system.ts`** — `VirtualFileSystem` class: in-memory Map-based FS, no disk I/O; serializes to/from JSON for DB storage
- **`/src/lib/tools/`** — AI tool definitions: `str-replace.ts` (view/create/str_replace/insert ops) and `file-manager.ts` (rename/delete)
- **`/src/lib/transform/jsx-transformer.ts`** — Babel transforms JSX → ES modules; builds an import map pointing to `esm.sh` for third-party packages
- **`/src/lib/provider.ts`** — Wraps Anthropic API; falls back to a mock provider when `ANTHROPIC_API_KEY` is absent
- **`/src/lib/contexts/`** — `ChatContext` (message history, streaming state) and `FileSystemContext` (file tree, selected file, FS instance)
- **`/src/lib/prompts/generation.tsx`** — System prompt that instructs Claude how to generate components
- **`/src/actions/`** — Next.js server actions for auth (`signUp`, `signIn`, `signOut`) and project CRUD
- **`/src/lib/auth.ts`** — JWT sessions stored in HTTP-only cookies; `bcrypt` for password hashing
- **`/prisma/schema.prisma`** — Two models: `User` and `Project`; project `messages` and `data` fields are JSON strings

### State Management

Global state uses React Context only — no Redux or Zustand. `ChatContext` and `FileSystemContext` are the two roots; both wrap the main layout in `main-content.tsx`.

### Preview System

The preview iframe is sandboxed. JSX is compiled at runtime by `@babel/standalone`. External package imports are rewritten to `esm.sh` CDN URLs via an import map injected into the iframe's `<head>`.

## Environment

Requires `ANTHROPIC_API_KEY` in `.env`. Without it, the app runs with a mock provider that returns placeholder responses.
