# StudyMate AI

StudyMate AI is a Next.js App Router application using React, TypeScript, Tailwind CSS, NextAuth, and Prisma. The current codebase contains the public landing page, credential registration/login, and a session-protected dashboard. Material processing and AI study workflows are not implemented yet; see [AUDIT.md](AUDIT.md) for verified status and blockers.

## Requirements

- Node.js compatible with the installed Next.js 16 release
- PostgreSQL reachable through `DATABASE_URL`
- npm

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. If `.env` does not exist, copy `.env.example` to `.env`. If it already exists, preserve it and verify/update only the required entries: `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`. Never commit `.env` or put real secrets in `.env.example`.
3. Start the existing local development database container with `docker start studymate-postgres-local` if it is stopped. It uses the persistent Docker volume `studymate-local-postgres-data` and binds only to `127.0.0.1:5432`. To stop it, use `docker stop studymate-postgres-local`.
4. The current local database was initialized from the Prisma schema only after verifying it was empty. The repository has no checked-in Prisma migration history; use reviewed migrations for shared or production databases, never assume `db push` is safe for an existing database.
5. Start the app:

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Next.js selects another port if 3000 is occupied.

## Checks

```sh
npm run lint
npm test
npm exec -- tsc --noEmit
npm exec -- prisma validate
npm run build
```

Run the unit suite with `npm test`. The current suite covers AI configuration/request validation and lexical tutor retrieval. API/database/browser workflows also have manual checks documented in `AUDIT.md`; live AI-provider and production object-storage tests still require credentials.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string; required for authentication and dashboard queries.
- `NEXTAUTH_SECRET`: random server-side signing secret.
- `NEXTAUTH_URL`: externally reachable app URL; use `http://localhost:3000` locally.
- `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`: server-side OpenAI-compatible chat-completions settings required by Summary, Quiz, Flashcards, and Tutor routes. The repository uses the OpenAI-compatible `/chat/completions` protocol; the default example endpoint/model are OpenAI. Put a valid provider key in the existing local `.env` without committing it. Without a key, the routes return `503` naming the missing setting and do not create generated content.
- `MAX_FILE_SIZE_MB`: upload limit (capped by the app at 25 MB). Local development stores private files under the ignored `uploads/` directory; production requires the S3-compatible variables below. An existing `UPLOAD_DIR` entry in `.env` is not used.
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: required for production object storage. `S3_ENDPOINT` is optional for S3-compatible providers. Keep credentials server-side.

## Deployment status

The project is not production-ready. Before deployment, configure a managed PostgreSQL service and reviewed migrations, configure and test the AI provider and private durable object storage, add rate limits, and complete security/browser audits. AI routes are implemented but return `503` until a valid server-side provider key is configured. Do not expose uploaded study materials from a public filesystem or claim provider-backed generation has been verified until it is tested end to end.
