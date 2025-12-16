# InnerCompass Mini — PRD & Implementation Roadmap

## 1) PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1. Overview
InnerCompass Mini is a lightweight journaling app where a user writes a short entry and instantly gets a grounded reflection: mood tags, key themes, 2–5 reflection prompts, and one small “micro-action” they can do today. The core output is a strict JSON object from an LLM that the UI renders as clean, structured cards.

It’s for busy people who want quick clarity and a practical next step without scrolling through long advice. It solves the “I know I should reflect, but I don’t know where to start” problem by turning messy thoughts into a small, actionable reflection in seconds.

### 2. Goals & Non-Goals
**Goals (v1)**
- User can sign up/log in and create a journal entry.
- App calls an LLM and returns **validated, render-ready JSON** (schema-enforced).
- User can view the reflection result in a clean UI (tags, prompts, micro-action checklist).
- User’s entries and outputs are saved privately per account (RLS enforced).
- Deployed to Vercel with environment variables configured and working.

**Non-Goals (v1)**
- No long-term coaching programs, streaks, leaderboards, or gamification.
- No “chat back and forth” conversation threads—single entry → single reflection.
- No advanced analytics, embeddings/search, or semantic retrieval.
- No mobile app (web only).
- No medical/therapy claims; not a crisis service.

### 3. Target Users & Use Cases
**Primary persona**
- Busy student/engineer/creator who journals occasionally but wants quick structure and a next step.

**Use cases**
- As a user, I want to write how I’m feeling so that I can get clear reflection prompts.
- As a user, I want a small actionable step so that I can reduce overwhelm immediately.
- As a user, I want my reflections saved privately so that I can review later.
- As a user, I want consistent output formatting so the UI always looks clean and predictable.

### 4. Success Metrics (v1)
- User can: sign up → submit entry → see reflection JSON rendered → reload page and still see it (no errors).
- 95%+ of LLM responses pass schema validation (otherwise graceful retry/error).
- Reflection generation latency feels acceptable (e.g., typically < ~10 seconds).
- Basic reliability: no uncaught exceptions in core flow; errors shown with clear messages.

### 5. Requirements

#### Core Functional Requirements
1) **Auth (Supabase)**
- Users can sign up, log in, log out.
- Edge cases: session expiry; redirect unauthenticated users to login.

2) **Create Journal Entry**
- User submits free-text journal content (with max length limit).
- Edge cases: empty input; extremely long text; profanity (allow, but enforce length).

3) **Generate Reflection (LLM → JSON)**
- Server calls LLM with the entry text and a strict JSON schema.
- Validate response against schema (Zod).
- If validation fails: retry once with a “fix-to-schema” prompt; if still fails, show error.

4) **Render Reflection UI**
- Display: mood tags, key themes, reflection prompts, micro-action (title + duration + steps), reframe/mantra.
- Edge cases: empty arrays (show “none” states); long strings (truncate/expand).

5) **Persist Data (Supabase DB + RLS)**
- Save journal entry and reflection output JSON tied to user.
- Users can only read their own data.

#### Nice-to-Have / Stretch Requirements
- **History page**: list recent entries and open a past reflection.
- **Copy buttons**: copy prompts/micro-action to clipboard.
- **Micro-action timer**: simple 10-min timer UI (local only).
- **Rate limiting**: basic per-user throttle to avoid spam/cost.

### 6. UX / UI Notes

**Screen 1: Login**
- Purpose: authenticate user.
- Elements: email/password (or magic link), submit, error banner.
- Layout: centered card.

**Screen 2: New Entry**
- Purpose: write entry and generate reflection.
- Elements: textarea, character counter, “Generate Reflection” button, loading skeleton.
- Layout: left side entry; right side reserved for preview/loading (optional).

**Screen 3: Reflection Result**
- Purpose: display JSON output cleanly.
- Elements:
  - Mood tags as badges
  - “Reframe” card (headline)
  - “Micro-action” card with checklist steps + optional timer button
  - Reflection prompts in accordion
  - Save state + timestamp
- Layout: stacked cards with clear sections.

**Screen 4 (optional): History**
- Purpose: quickly revisit old reflections.
- Elements: list of entries (date + first line), click to open.

### 7. Technical Constraints & Assumptions
- **Frontend:** Next.js (App Router) + TypeScript
- **UI:** shadcn/ui components
- **Auth/DB:** Supabase (Postgres + RLS)
- **Deployment:** Vercel
- **LLM:** server-side API call (OpenAI or similar), returning strict JSON validated with Zod.
- **Security/Privacy:**
  - Never expose LLM API key to client.
  - RLS enforced on all user tables.
  - Store minimal PII; journal text is sensitive—treat as private data.
- **Performance:**
  - Enforce max input size (e.g., 2k–5k chars) to control latency/cost.

### 8. Risks & Open Questions
**Risks**
- LLM occasionally returns invalid JSON → must validate + retry path.
- Journaling content can be sensitive → privacy expectations are high.
- Self-harm content → must show a safety note and clear “not a crisis service” messaging.

**Open Questions**
- Do we allow deleting entries in v1?
- Do we want magic link auth vs email/password?
- What’s the max entry length for v1?
- Which LLM provider/model do you want as default (OpenAI since you already have API access)?

---

## 2) IMPLEMENTATION ROADMAP FOR A JUNIOR ENGINEER

### A. High-Level Phases
1) **Setup & Scaffolding** — create the app skeleton, tooling, and baseline UI.  
2) **Auth + Database** — implement Supabase auth + tables + RLS.  
3) **LLM Reflection API** — build server endpoint that returns schema-validated JSON.  
4) **Core UI Flow** — entry page + result renderer using shadcn.  
5) **Polish, QA, Deployment** — error handling, logging, rate limiting (optional), Vercel deploy.

### B. Detailed Task Breakdown

#### Phase 1: Setup & Scaffolding
**Task 1: Create Next.js app + install UI deps**
- Description: scaffold Next.js App Router project, install shadcn/ui, set up basic layout.
- Implementation hints: initialize shadcn; create `app/(auth)` and `app/(app)` route groups.
- Dependencies: none
- Acceptance criteria: app runs locally; homepage renders a basic shell layout.

**Task 2: Add env var management + linting**
- Description: add `.env.local`, document required vars, ensure TypeScript/lint passes.
- Implementation hints: create `src/lib/env.ts` to read and validate env vars (optional Zod).
- Dependencies: Task 1
- Acceptance criteria: missing env vars produce a clear error locally.

#### Phase 2: Auth + Database
**Task 3: Create Supabase project + connect keys**
- Description: create Supabase project, set URL/keys in env.
- Implementation hints: use Supabase SSR helpers for Next.js if you already have a template.
- Dependencies: Task 2
- Acceptance criteria: can hit Supabase from server and client without errors.

**Task 4: Implement auth pages**
- Description: login/signup page, session handling, protected routes.
- Implementation hints: redirect unauthenticated users from `/app/*` to `/login`.
- Dependencies: Task 3
- Acceptance criteria: user can sign up, log in, log out; protected page blocks anon users.

**Task 5: Create DB tables + RLS**
- Description: create `journal_entries` and `journal_outputs` tables with policies.
- Implementation hints: store `output` as `jsonb`; enforce `auth.uid() = user_id`.
- Dependencies: Task 3
- Acceptance criteria: user can insert/select their rows; cannot access another user’s rows.

#### Phase 3: LLM Reflection API
**Task 6: Define the reflection JSON schema**
- Description: create Zod schema (single source of truth for UI + validation).
- Implementation hints: `ReflectionSchema` with mood_tags, key_themes, reflection_prompts, micro_action, reframe, mantra, safety_note.
- Dependencies: Phase 1
- Acceptance criteria: schema compiles; you can parse a sample object successfully.

**Task 7: Create `/api/generate` endpoint**
- Description: authenticated POST endpoint that saves entry, calls LLM, validates JSON, saves output, returns result.
- Implementation hints: server-only LLM call; handle 401/400/500 cleanly; add a 1x retry on schema failure.
- Dependencies: Tasks 4–6
- Acceptance criteria: curl/postman call returns valid JSON; rows appear in both tables.

**Task 8: Add basic abuse/cost controls (simple)**
- Description: enforce max chars, basic per-user cooldown (optional).
- Implementation hints: reject if entry too long; store last request time; or in-memory throttle for MVP.
- Dependencies: Task 7
- Acceptance criteria: very long input is rejected with clear message; repeated spam is throttled (if implemented).

#### Phase 4: Core UI Flow
**Task 9: Build “New Entry” page**
- Description: textarea + button; submit to `/api/generate`; show loading state.
- Implementation hints: use shadcn `Textarea`, `Button`, `Skeleton`; disable button during request.
- Dependencies: Task 7
- Acceptance criteria: user can submit entry and see result returned in the UI.

**Task 10: Build “Reflection Result” renderer**
- Description: render JSON sections consistently.
- Implementation hints:
  - Mood tags → `Badge`
  - Reframe → `Card`
  - Prompts → `Accordion`
  - Micro-action steps → checklist (local state)
- Dependencies: Task 9
- Acceptance criteria: all JSON fields render; no crashing on empty arrays/long text.

**Task 11 (Stretch): History page**
- Description: list last 20 entries; click to open result.
- Implementation hints: query `journal_entries` + join latest output; or two queries.
- Dependencies: Tasks 5, 10
- Acceptance criteria: user can revisit old reflections after refresh.

#### Phase 5: Polish, QA, Deployment
**Task 12: Error UX + logging**
- Description: friendly errors (toast/banner), log server errors.
- Implementation hints: return structured API errors; show actionable messages in UI.
- Dependencies: Phase 4
- Acceptance criteria: failures don’t break the UI; user sees clear next step.

**Task 13: Deploy to Vercel**
- Description: set env vars, verify Supabase redirect URLs, deploy.
- Implementation hints: ensure auth redirect URIs include Vercel domain.
- Dependencies: all prior
- Acceptance criteria: production app works end-to-end on Vercel.

### C. Milestones & Suggested Timeline (10–20 hrs/week)
**M1 (Week 1): Auth + DB ready**
- Tasks 1–5  
- Demo: user can sign up/log in and access a protected page.

**M2 (Week 2): Core feature end-to-end**
- Tasks 6–10  
- Demo (critical v1): user submits entry → gets reflection → UI renders it.

**M3 (Week 3, optional polish): History + deployment hardening**
- Tasks 11–13  
- Demo: app deployed, stable, and revisit-able.

> If you’re pushing for a 1-day MVP with Claude Code, aim for Tasks 1–10 + 13 and skip history.

### D. Testing & QA Plan
**Most important tests (v1)**
- **Unit tests:** Zod schema parsing; “LLM invalid JSON → retry → failure path”.
- **Integration tests:** `/api/generate` with auth; DB insert/select with RLS.

**Manual QA checklist**
- Sign up → log in → log out works  
- Submit empty entry → see validation error  
- Submit normal entry → see reflection render  
- Refresh result page → data still accessible  
- Confirm another user cannot access your entry (basic RLS sanity)

**Edge cases**
- LLM timeout/failure → show “Try again” message  
- Very long entry → rejected with max length message  
- Empty arrays → UI shows “No tags/themes detected” cleanly

### E. Documentation & Handover
Document in `README.md`:
- Project overview + core flow
- Setup steps (local + Supabase)
- Required env vars
- DB schema + RLS policies
- API endpoints:
  - `POST /api/generate` (request/response examples)
- JSON schema (copy/paste + explanation)
- Deployment notes (Vercel + Supabase auth redirects)
- Key decisions (why schema validation, retry behavior, input limits)

---

## First Day Plan
1) Create the repo + scaffold Next.js App Router project.  
2) Install shadcn/ui and set up a basic layout + route groups.  
3) Create Supabase project and add env vars locally.  
4) Implement auth pages and protected `/app/new`.  
5) Create DB tables + RLS policies in Supabase SQL editor.  
6) Define `ReflectionSchema` (Zod) and add a sample JSON fixture.  
7) Implement `POST /api/generate` (stub response first, then real LLM call).  
8) Build the New Entry page calling the API and render the JSON in cards/accordion.  
9) Do a full end-to-end run locally: login → submit → render → refresh.  
10) Deploy to Vercel and verify auth redirects + core flow works in production.
