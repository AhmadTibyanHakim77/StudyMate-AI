# StudyMate AI Audit

Updated: 2026-10-09

## Scope and constraints

- The authoritative PRD was supplied in the current task. No prior implementation plan or test suite was present; this audit and `IMPLEMENTATION_PLAN.md` now track implementation against that PRD. A Vitest unit suite has since been added.
- Git status/history could not be inspected because this directory is not a Git repository. Existing files were preserved.
- The configured PostgreSQL endpoint was initially unavailable. A new isolated PostgreSQL 17 container and persistent volume, `studymate-postgres-local` / `studymate-local-postgres-data`, were created using the existing local `DATABASE_URL` credentials without changing `.env` or touching the pre-existing `kost-postgres` container/volume.
- The new database was verified to contain zero tables before `prisma db push`; the current schema was then applied. No existing database or data was reset. Random test accounts using the reserved `.invalid` domain remain in this new local database.
- The repository now contains authenticated material/PDF workflows, AI feature endpoints and interfaces, quiz scoring, flashcard reviews, tutor lexical retrieval, analytics, and profile settings. Live AI generation remains blocked by missing credentials; production S3 storage is not configured.

## Status checklist

| Area | Status | Evidence / remaining work |
| --- | --- | --- |
| Production build and TypeScript | PASS | Final `npm run build` and `npm exec -- tsc --noEmit` pass. Explicit Turbopack root removed the parent-root/lockfile warning; fixed local storage path removed filesystem tracing warnings. |
| ESLint | PASS | `npm run lint` passes after current feature additions. |
| Prisma schema/database | PASS | Schema validation, client generation, additive local schema sync, and `SELECT 1` pass. No checked-in migration history; local `db push` is not production migration practice. |
| Landing page | PARTIAL | Root route responds HTTP 200; six requested features are represented, fabricated metrics removed, and copy states AI provider prerequisites. Full link/content/accessibility review remains. |
| Registration | PASS | Live API test returned 201, verified the user row in PostgreSQL, verified the bcrypt hash, confirmed no password was returned, and confirmed duplicate email returns 409. Rate limiting and email verification are not implemented. |
| Login/session | PASS | Live NextAuth test verified correct login/session identity, wrong password rejection (401), logout cookie expiry, and anonymous session after logout. Rate limiting and password reset are not implemented. |
| Private dashboard | PASS | Browser session loads live user-scoped metrics and recent material/quiz data; empty states show zero/no activity. |
| Theme and language | PARTIAL | Six themes exist. Browser verified Ocean Blue selection and persistence after refresh. Other page contrast/accessibility combinations still need review. |
| Material library/upload | PARTIAL | User-scoped list/search/detail/delete, private file route, local-dev private storage, status, and PDF metadata are implemented. S3 adapter exists but production credentials are absent. |
| PDF processing | PARTIAL | PDF signature/MIME/size checks, text extraction, empty-text rejection, chunking, and status persistence verified with an in-memory PDF. Processing is synchronous; no OCR or background job. |
| AI Summary | BLOCKED | Server-side OpenAI-compatible client, schema-validated structured summaries, chunk aggregation, storage/history UI exist. Missing `AI_API_KEY`; live generation is not verified. |
| AI Quiz | PARTIAL | Root cause is verified: runtime `AI_API_KEY` is absent; `AI_API_URL` and `AI_MODEL` are present. Quiz returns 503 with code `AI_PROVIDER_NOT_CONFIGURED`, identifies missing `AI_API_KEY`, and creates no row. DB-backed mechanics test confirmed answer keys are hidden, server scoring is authoritative despite spoofed client score, and history persists. Live AI question quality remains unverified. |
| Flashcards | PARTIAL | AI deck generation is blocked without `AI_API_KEY`. Viewer/review APIs exist; DB test verified per-user review persistence. Spaced repetition is not implemented. |
| AI Tutor / RAG | PARTIAL | User-scoped lexical retrieval, prompt boundary, source persistence, conversations, and citations exist. DB/API test verified abstention when no relevant chunk is found and conversation persistence. Live LLM grounding/citations are blocked without `AI_API_KEY`; no embeddings/pgvector. |
| Analytics and settings | PARTIAL | User-scoped actual material/quiz/attempt/score data, 14-day quiz activity, and name update work. General study events and email changes are absent. |
| Logo and brand | PARTIAL | Added a reusable SVG mark/wordmark to landing, auth, and dashboard and registered the mark as favicon. The chat image was not available as a file in the repository, so the vector mark follows the supplied visual reference rather than being the original uploaded bitmap. |
| API security | PARTIAL | New routes enforce sessions and owner filters; uploads validate type/size/signature; password hashes and private files are not exposed. Rate limiting, malware scanning, and broader security tests remain. |
| Database / migrations | PARTIAL | Local PostgreSQL reachable; new DB initialized empty and additive schema changes synced. No checked-in migrations; production migration strategy remains. |
| Tests | PARTIAL | Vitest unit suite passes 14 tests for AI config/request/error/output handling and tutor retrieval. Manual browser/API/DB tests cover auth, upload/extraction/storage/ownership/delete, analytics/profile, page routes, themes, quiz scoring, and explicit AI `503`. Full automated integration/e2e coverage remains absent. |
| Deployment readiness | BLOCKED | Requires production S3 credentials, live AI provider credentials, reviewed migrations, rate limiting, and automated tests. No deployment attempted. |

## Changes made in this audit

- Replaced the obsolete `next lint` script and legacy compatibility configuration with native Next.js ESLint flat configs.
- Added server-side Zod validation and normalized email for registration; required a name, enforced bcrypt's 72-byte password limit, used bcrypt cost 12, handled unique conflicts as 409, and distinguished validation/database/internal errors.
- Added sanitized server-side database diagnostics, explicit UI success/error states, and loading/submission guards; normalized email on login.
- Removed Prisma query logging so account data and password hashes are not written as query diagnostics.
- Replaced hardcoded dashboard counts with user-scoped Prisma counts.
- Fixed ThemeProvider context availability and replaced effect-driven preference initialization with external-store subscriptions; applied the same pattern to language preference.
- Removed `any` casts for language selection.
- Removed unverified dashboard preview numbers and an unsupported claim about user counts from the landing page.
- Added private PDF storage (local development and S3-compatible production adapter), authenticated materials routes/UI, text extraction/chunking, and page metadata.
- Added data-driven dashboard/navigation, summary/quiz/flashcard/tutor interfaces, analytics, profile settings, and user-owned API routes.
- Added server-only structured AI client, chunk-based summary/quiz/deck prompts, lexical tutor retrieval, quiz scoring, review persistence, and tutor citations. Live model calls deliberately return `503` while `AI_API_KEY` is absent.
- Added explicit AI configuration status and distinct provider handling for missing settings, invalid credentials, rate limit, timeout, network, provider errors, and malformed structured output; endpoint messages name missing variable names only.
- Added the StudyMate logo mark/wordmark and favicon based on the supplied visual reference.
- Added Vitest configuration/tests, `.gitignore`, S3 environment placeholders, and `IMPLEMENTATION_PLAN.md`.

## Verification log

- `npm run lint`: PASS after feature additions.
- `npm exec -- tsc --noEmit`: PASS after feature additions.
- `npm exec -- prisma validate`: PASS; `prisma generate` and additive local `db push` completed.
- `npm test`: PASS, 14 tests across AI provider handling and tutor retrieval.
- `npm run build`: PASS on final source; no Turbopack root, lockfile, or filesystem tracing warnings.
- Auth: browser registration success and login/dashboard verified; API tests verified persistence/hash/no hash leakage, duplicate 409, wrong password 401, logout/session clear.
- Materials: authenticated PDF upload 201/completed; extracted source text/page count verified; private download 200; second user receives 404; delete returns 200 and removes record/file.
- App smoke: all eight dashboard routes returned 200 for an authenticated user; profile patch and analytics returned 200.
- AI runtime config: `AI_API_URL`/`AI_MODEL` set; `AI_API_KEY` absent. Quiz API returned 503, `AI_PROVIDER_NOT_CONFIGURED`, and `missingVariables: ["AI_API_KEY"]`; database count confirmed no quiz was created. Other AI routes share the same configuration gate; no generated records were claimed or stored.
- Learning mechanics: DB-backed test confirmed GET hides quiz answers, server calculates scores and ignores a spoofed client score, attempts/history persist, flashcard reviews persist, and tutor abstains/saves a conversation with no relevant evidence.
- Browser: register success, login/dashboard, profile update/header refresh, mobile materials layout/navigation, theme change, and persistence after reload verified. Mobile nav uses fixed-width scrollable items.
- Local PostgreSQL readiness/query and `curl http://localhost:3000` returned success.

## Next work, in dependency order

1. Set up a valid AI provider key and test generated summary/quiz/deck/tutor output, grounding, citation accuracy, and failure handling.
2. Configure the intended production S3-compatible bucket and credentials; test private upload/read/delete against it.
3. Create and review checked-in Prisma migrations for shared/production databases; do not use `db push` on existing production data.
4. Add automated integration/browser tests and rate limiting; complete malware scanning, timeout/worker design, and security review. AI/provider unit tests now pass.
5. Review landing-page FAQ/features against actual released capabilities, accessibility/contrast across themes, and all mobile/desktop pages.
6. Verify hosting runtime/storage/duration constraints and complete production configuration before deployment readiness checks.
