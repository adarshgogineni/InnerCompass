# InnerCompass Mini — Implementation Plan

## Section 1 – High-Level Phases

### Phase 1: Project Setup & Scaffolding
**Goal:** Bootstrap the Next.js project with TypeScript, install shadcn/ui, configure the basic folder structure, and ensure the development environment runs locally with proper linting and type-checking.
**Deliverable:** A running Next.js app on localhost with a basic shell layout and environment variable management.

### Phase 2: Database & Schema Design
**Goal:** Set up the Supabase project, design and create database tables for journal entries and reflection outputs, and implement Row Level Security (RLS) policies.
**Deliverable:** Database schema deployed in Supabase with RLS enforced; ability to query tables from the app.

### Phase 3: Authentication & Authorization
**Goal:** Implement user sign-up, login, and logout using Supabase Auth; protect routes so unauthenticated users are redirected to login.
**Deliverable:** Working auth flow with session management and route protection.

### Phase 4: LLM Integration & API Layer
**Goal:** Define the strict JSON schema for reflections, create a server-side API endpoint that calls the LLM, validates the response, and implements retry logic for schema failures.
**Deliverable:** `/api/generate` endpoint that accepts journal entries and returns validated reflection JSON.

### Phase 5: Core UI & User Flows
**Goal:** Build the main user-facing pages: new entry submission form and reflection result renderer with clean, structured cards.
**Deliverable:** End-to-end flow where users can write entries, submit them, and see rendered reflections.

### Phase 6: Data Persistence & History
**Goal:** Save journal entries and reflection outputs to the database; optionally implement a history page to view past reflections.
**Deliverable:** User data persists across sessions; users can revisit old reflections (if history page is implemented).

### Phase 7: Error Handling, Security & Polish
**Goal:** Add comprehensive error handling, input validation, abuse controls (rate limiting, max length), safety messaging, and logging.
**Deliverable:** Production-ready error UX with clear user feedback and basic cost/abuse protections.

### Phase 8: Testing & Quality Assurance
**Goal:** Write unit tests for critical functions (schema validation, LLM retry logic), integration tests for API endpoints, and perform manual QA.
**Deliverable:** Test suite covering core flows; documented edge cases handled gracefully.

### Phase 9: Deployment & DevOps
**Goal:** Deploy the application to Vercel, configure production environment variables, set up Supabase auth redirect URLs, and verify end-to-end functionality in production.
**Deliverable:** Live production app accessible via Vercel URL with full functionality.

---

## Section 2 – Detailed Step-by-Step Plan

### Step 1: Initialize Next.js App Router Project

- **Phase:** Project Setup & Scaffolding
- **Goal:** Create a new Next.js project using the App Router with TypeScript and verify it runs locally.
- **Prerequisites:**
  - [x] Node.js v18+ installed
  - [x] npm or pnpm available
- **What to do:**
  - [x] Run `npx create-next-app@latest innercompass-mini --typescript --tailwind --app --no-src`
  - [x] Navigate into the project directory: `cd innercompass-mini`
  - [x] Start the dev server: `npm run dev`
  - [x] Open `http://localhost:3000` and verify the default Next.js page loads
  - [x] Delete the default page content in `app/page.tsx` and replace with a simple "InnerCompass Mini" heading
- **Implementation hints:**
  - Choose "Yes" for ESLint when prompted
  - Choose "No" for `src/` directory (we'll use `app/` at root for App Router)
  - Choose "Yes" for Tailwind CSS
  - The project structure should have: `app/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`
- **Done when:**
  - [x] Dev server runs without errors
  - [x] `http://localhost:3000` shows your custom heading
  - [x] TypeScript compilation works (`npm run build` succeeds)

---

### Step 2: Install and Configure shadcn/ui

- **Phase:** Project Setup & Scaffolding
- **Goal:** Install shadcn/ui CLI and initialize the component library with a basic configuration.
- **Prerequisites:**
  - [x] Step 1 completed
- **What to do:**
  - [x] Run `npx shadcn@latest init`
  - [x] Choose the following options:
    - Style: "New York" (or "Default" based on preference)
    - Base color: "Slate"
    - CSS variables: "Yes"
  - [x] Verify that `components.json` was created at the root
  - [x] Install initial components you'll need: `npx shadcn@latest add button textarea card badge accordion skeleton`
  - [x] Check that `components/ui/` folder exists with installed components
- **Implementation hints:**
  - shadcn/ui creates a `components/ui/` folder and updates `tailwind.config.ts`
  - The `components.json` file defines paths and style preferences
  - Each component is copied into your project (not installed via npm), giving you full control
- **Done when:**
  - [x] `components.json` exists
  - [x] `components/ui/button.tsx`, `textarea.tsx`, `card.tsx`, etc. exist
  - [x] No errors when running `npm run dev`

---

### Step 3: Set Up Folder Structure & Route Groups

- **Phase:** Project Setup & Scaffolding
- **Goal:** Organize the app into logical route groups for authenticated and unauthenticated sections.
- **Prerequisites:**
  - [x] Step 2 completed
- **What to do:**
  - [x] Create route groups:
    - `app/(auth)/login/page.tsx` (login page)
    - `app/(auth)/signup/page.tsx` (signup page)
    - `app/(app)/new/page.tsx` (new journal entry, protected)
    - `app/(app)/result/[id]/page.tsx` (reflection result, protected)
    - `app/(app)/history/page.tsx` (optional history page, protected)
  - [x] Create shared layout files:
    - `app/(auth)/layout.tsx` (minimal layout for auth pages)
    - `app/(app)/layout.tsx` (layout for authenticated app pages, will include auth check later)
  - [x] Create `lib/` folder for utilities: `lib/supabaseClient.ts`, `lib/env.ts`, `lib/schemas.ts`
  - [x] Add placeholder content to each page (e.g., `export default function LoginPage() { return <h1>Login</h1> }`)
- **Implementation hints:**
  - Route groups (folders with parentheses) don't affect URL structure but help organize layouts
  - `app/(auth)/login/page.tsx` maps to `/login`
  - `app/(app)/new/page.tsx` maps to `/new`
  - Keep `lib/` at the root for shared business logic
- **Done when:**
  - [x] All route folders exist with placeholder pages
  - [x] Navigating to `/login`, `/signup`, `/new` shows placeholder content
  - [x] `lib/` folder created with empty files for now

---

### Step 4: Environment Variable Management

- **Phase:** Project Setup & Scaffolding
- **Goal:** Set up `.env.local` with placeholders for required environment variables and create a utility to validate them.
- **Prerequisites:**
  - [x] Step 3 completed
- **What to do:**
  - [x] Create `.env.local` at the root with the following keys (leave values empty for now):
    ```
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    OPENAI_API_KEY=
    ```
  - [x] Add `.env.local` to `.gitignore` (should already be there by default)
  - [x] Create `lib/env.ts` to validate environment variables:
    ```typescript
    // Export functions like getSupabaseUrl(), getOpenAIKey()
    // Throw errors if required vars are missing
    ```
  - [x] Document required env vars in a `README.md` section
- **Implementation hints:**
  - `NEXT_PUBLIC_*` vars are exposed to the browser; others are server-only
  - You can use Zod to validate env vars in `lib/env.ts`, but simple string checks are fine for MVP
  - Example: `if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')`
- **Done when:**
  - [x] `.env.local` exists with all keys listed
  - [x] Running the app without values shows a clear error from `lib/env.ts`
  - [x] README documents what each env var is for

---

### Step 5: Create Supabase Project

- **Phase:** Database & Schema Design
- **Goal:** Set up a new Supabase project and obtain the URL and API keys.
- **Prerequisites:**
  - [x] Supabase account created (free tier is fine)
  - [x] Step 4 completed
- **What to do:**
  - [x] Go to [supabase.com](https://supabase.com) and create a new project
  - [x] Name it "innercompass-mini" (or similar)
  - [x] Choose a region close to you
  - [x] Wait for the project to initialize (~2 minutes)
  - [x] Copy the following from Project Settings > API:
    - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
    - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
  - [x] Paste these values into `.env.local`
- **Implementation hints:**
  - The `anon` key is safe to expose in the browser; it respects RLS policies
  - The `service_role` key bypasses RLS—never expose it to the client
  - Keep the Supabase dashboard open; you'll use the SQL Editor next
- **Done when:**
  - [x] Supabase project is live
  - [x] All three Supabase env vars populated in `.env.local`
  - [x] You can access the Supabase dashboard

---

### Step 6: Create Supabase Client Utility

- **Phase:** Database & Schema Design
- **Goal:** Set up a Supabase client for server-side and client-side use.
- **Prerequisites:**
  - [x] Step 5 completed
  - [x] `@supabase/supabase-js` installed: `npm install @supabase/supabase-js`
- **What to do:**
  - [x] Install Supabase JS SDK: `npm install @supabase/supabase-js`
  - [x] Create `lib/supabaseClient.ts`:
    - Export `supabase` (browser client using anon key)
    - Export `supabaseAdmin` (server-only client using service role key)
  - [x] Import and validate env vars from `lib/env.ts`
- **Implementation hints:**
  - Browser client example:
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    ```
  - Server/admin client uses `SUPABASE_SERVICE_ROLE_KEY` instead of anon key
  - Use the admin client only in API routes or server components where you need to bypass RLS
- **Done when:**
  - [x] `lib/supabaseClient.ts` exports both clients
  - [x] No errors when importing in a test file
  - [x] App still runs without crashing

---

### Step 7: Design Database Schema

- **Phase:** Database & Schema Design
- **Goal:** Define the tables and columns needed for journal entries and reflection outputs.
- **Prerequisites:**
  - [x] Step 6 completed
- **What to do:**
  - [x] Document the schema in a file `docs/schema.sql` (or in README):
    ```sql
    -- Table: journal_entries
    CREATE TABLE journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      entry_text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Table: journal_outputs
    CREATE TABLE journal_outputs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      output JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - [x] Add indexes:
    ```sql
    CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
    CREATE INDEX idx_journal_outputs_entry_id ON journal_outputs(entry_id);
    CREATE INDEX idx_journal_outputs_user_id ON journal_outputs(user_id);
    ```
- **Implementation hints:**
  - `user_id` references Supabase's built-in `auth.users` table
  - `entry_text` is the raw journal content
  - `output` stores the validated JSON reflection as a JSONB column
  - Use `UUID` for primary keys; Supabase generates them automatically
- **Done when:**
  - [x] Schema is documented and reviewed
  - [x] You understand which columns will store what data
  - [x] Ready to run this SQL in Supabase

---

### Step 8: Create Database Tables in Supabase

- **Phase:** Database & Schema Design
- **Goal:** Execute the SQL to create tables and indexes in the Supabase SQL Editor.
- **Prerequisites:**
  - [x] Step 7 completed
- **What to do:**
  - [x] Open Supabase Dashboard → SQL Editor
  - [x] Copy the SQL from Step 7 into a new query
  - [x] Run the query
  - [x] Verify tables appear in Table Editor
  - [x] Verify indexes appear under each table
- **Implementation hints:**
  - If you get errors, check that `auth.users` is available (it's a built-in Supabase table)
  - Use the Table Editor to visually inspect the schema
  - You can add sample data manually to test later
- **Done when:**
  - [x] `journal_entries` table exists with columns: `id`, `user_id`, `entry_text`, `created_at`
  - [x] `journal_outputs` table exists with columns: `id`, `entry_id`, `user_id`, `output`, `created_at`
  - [x] Indexes created successfully

---

### Step 9: Implement Row Level Security (RLS) Policies

- **Phase:** Database & Schema Design
- **Goal:** Enable RLS on both tables and create policies so users can only access their own data.
- **Prerequisites:**
  - [x] Step 8 completed
- **What to do:**
  - [x] In SQL Editor, enable RLS:
    ```sql
    ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE journal_outputs ENABLE ROW LEVEL SECURITY;
    ```
  - [x] Create policies for `journal_entries`:
    ```sql
    -- Users can insert their own entries
    CREATE POLICY "Users can insert own entries"
      ON journal_entries FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Users can select their own entries
    CREATE POLICY "Users can select own entries"
      ON journal_entries FOR SELECT
      USING (auth.uid() = user_id);
    ```
  - [x] Create similar policies for `journal_outputs`:
    ```sql
    CREATE POLICY "Users can insert own outputs"
      ON journal_outputs FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can select own outputs"
      ON journal_outputs FOR SELECT
      USING (auth.uid() = user_id);
    ```
  - [x] Run these queries in SQL Editor
- **Implementation hints:**
  - RLS policies are enforced when using the `anon` key
  - `auth.uid()` returns the current authenticated user's ID
  - With these policies, users cannot read or write other users' data
  - Service role key bypasses RLS—use it only in trusted server code
- **Done when:**
  - [x] RLS enabled on both tables
  - [x] Policies created and visible in Supabase Dashboard > Authentication > Policies
  - [x] You've confirmed (mentally or in docs) that users can only access their own rows

---

### Step 10: Set Up Authentication Pages (UI Only)

- **Phase:** Authentication & Authorization
- **Goal:** Build login and signup page UIs with forms; no backend logic yet.
- **Prerequisites:**
  - [x] Step 9 completed
  - [x] shadcn/ui components installed (button, input, card)
- **What to do:**
  - [x] Install input component: `npx shadcn@latest add input label`
  - [x] Create `app/(auth)/login/page.tsx`:
    - Form with email and password fields
    - "Login" button
    - Link to signup page
  - [x] Create `app/(auth)/signup/page.tsx`:
    - Form with email and password fields
    - "Sign Up" button
    - Link to login page
  - [x] Style both pages using shadcn `Card`, `Label`, `Input`, `Button`
  - [x] Add basic client-side validation (required fields)
- **Implementation hints:**
  - Use `<form>` with `onSubmit` handlers (preventDefault for now)
  - Center the form card on the page using Flexbox or Grid
  - Keep it simple: email + password only (no magic link yet)
  - Example structure:
    ```tsx
    <Card>
      <CardHeader>Login</CardHeader>
      <CardContent>
        <Label>Email</Label>
        <Input type="email" required />
        <Label>Password</Label>
        <Input type="password" required />
        <Button>Login</Button>
      </CardContent>
    </Card>
    ```
- **Done when:**
  - [x] `/login` and `/signup` pages render clean forms
  - [x] Forms are styled and responsive
  - [x] No functionality yet, but UI is ready for auth logic

---

### Step 11: Implement Supabase Auth Logic

- **Phase:** Authentication & Authorization
- **Goal:** Wire up login and signup forms to Supabase Auth; handle success and error states.
- **Prerequisites:**
  - [x] Step 10 completed
  - [x] `@supabase/auth-helpers-nextjs` installed: `npm install @supabase/auth-helpers-nextjs`
- **What to do:**
  - [x] Install Supabase Auth Helpers: `npm install @supabase/auth-helpers-nextjs`
  - [x] In `app/(auth)/signup/page.tsx`:
    - Import `supabase` from `lib/supabaseClient`
    - On form submit, call `supabase.auth.signUp({ email, password })`
    - On success, redirect to `/new`
    - On error, show error message in UI (toast or banner)
  - [x] In `app/(auth)/login/page.tsx`:
    - Call `supabase.auth.signInWithPassword({ email, password })`
    - On success, redirect to `/new`
    - On error, show error message
  - [x] Test both flows manually
- **Implementation hints:**
  - Use `useRouter` from `next/navigation` to programmatically redirect
  - Example:
    ```typescript
    const router = useRouter()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErrorMessage(error.message) }
    else { router.push('/new') }
    ```
  - You can use `useState` to manage error messages
  - For better UX, add a loading spinner during auth calls (disable button, show skeleton)
- **Done when:**
  - [x] Signing up with a new email creates a user in Supabase (check Auth > Users in dashboard)
  - [x] Logging in with valid credentials redirects to `/new`
  - [x] Invalid credentials show an error message
  - [x] No console errors

---

### Step 12: Implement Session Management & Protected Routes ✅

- **Phase:** Authentication & Authorization
- **Goal:** Redirect unauthenticated users from `/new`, `/result`, `/history` to `/login`; show logout button in authenticated layout.
- **Prerequisites:**
  - [x] Step 11 completed
- **What to do:**
  - [x] Create `lib/auth.ts` with a helper to get the current session:
    ```typescript
    export async function getCurrentUser() {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user ?? null
    }
    ```
  - [x] In `app/(app)/layout.tsx`:
    - Call `getCurrentUser()` (server component)
    - If no user, redirect to `/login` using `redirect()` from `next/navigation`
    - If user exists, render children and show a logout button in the header
  - [x] Create a logout button component that calls `supabase.auth.signOut()` and redirects to `/login`
- **Implementation hints:**
  - `app/(app)/layout.tsx` is a server component by default; you can call Supabase directly
  - Use `redirect('/login')` from `next/navigation` to redirect server-side
  - For the logout button, make it a client component (`'use client'`) with an onClick handler
  - Example logout:
    ```typescript
    const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }
    ```
- **Done when:**
  - [x] Visiting `/new` without being logged in redirects to `/login`
  - [x] Logging in allows access to `/new`
  - [x] Logout button appears in authenticated layout and works
  - [x] After logout, user is redirected to `/login`

---

### Step 13: Define Reflection JSON Schema with Zod ✅

- **Phase:** LLM Integration & API Layer
- **Goal:** Create a Zod schema that defines the exact structure of the reflection JSON returned by the LLM.
- **Prerequisites:**
  - [x] Step 12 completed
  - [x] `zod` installed: `npm install zod`
- **What to do:**
  - [x] Install Zod: `npm install zod`
  - [x] Create `lib/schemas.ts`
  - [x] Define `ReflectionSchema` using Zod with the following fields:
    ```typescript
    import { z } from 'zod'

    export const ReflectionSchema = z.object({
      mood_tags: z.array(z.string()).max(5),
      key_themes: z.array(z.string()).max(5),
      reflection_prompts: z.array(z.string()).min(2).max(5),
      micro_action: z.object({
        title: z.string(),
        duration_minutes: z.number().min(1).max(60),
        steps: z.array(z.string()).min(1).max(5),
      }),
      reframe: z.string().max(200),
      mantra: z.string().max(100).optional(),
      safety_note: z.string().optional(),
    })

    export type Reflection = z.infer<typeof ReflectionSchema>
    ```
  - [x] Create a sample JSON fixture that matches this schema and validate it manually to ensure the schema works
- **Implementation hints:**
  - This schema is the single source of truth for both LLM prompt instructions and validation
  - Use `.min()` and `.max()` to enforce length constraints
  - `z.infer` automatically generates a TypeScript type from the schema
  - Test the schema by calling `ReflectionSchema.parse(sampleData)` in a test file or Node REPL
- **Done when:**
  - [x] `ReflectionSchema` defined in `lib/schemas.ts`
  - [x] `Reflection` TypeScript type exported
  - [x] A sample JSON object successfully parses without errors

---

### Step 14: Create `/api/generate` Endpoint (Stub) ✅

- **Phase:** LLM Integration & API Layer
- **Goal:** Set up the API route structure; return a hardcoded valid reflection JSON for now (no LLM call yet).
- **Prerequisites:**
  - [x] Step 13 completed
- **What to do:**
  - [x] Create `app/api/generate/route.ts`
  - [x] Implement a `POST` handler:
    - Accept JSON body: `{ entry_text: string }`
    - Validate that `entry_text` is non-empty and under 5000 characters
    - Return a hardcoded `Reflection` object (copy from your sample fixture)
  - [x] Add basic error handling:
    - Return 400 if `entry_text` is missing or too long
    - Return 401 if user is not authenticated (check session using `supabase.auth.getSession()`)
  - [x] Test with curl or Postman:
    ```bash
    curl -X POST http://localhost:3000/api/generate \
      -H "Content-Type: application/json" \
      -d '{"entry_text": "I feel anxious about my exam."}'
    ```
- **Implementation hints:**
  - Use `export async function POST(request: Request) { ... }` for App Router API routes
  - Get the session in the API route using the Supabase client (server-side)
  - Return JSON using `Response.json()` or `NextResponse.json()`
  - Example:
    ```typescript
    if (!entry_text || entry_text.length > 5000) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    ```
- **Done when:**
  - [x] `POST /api/generate` returns 200 with hardcoded reflection JSON
  - [x] Returns 401 if not authenticated
  - [x] Returns 400 if input is invalid
  - [x] No crashes or TypeScript errors

---

### Step 15: Integrate OpenAI API for LLM Call

- **Phase:** LLM Integration & API Layer
- **Goal:** Replace the stub response with a real call to OpenAI's Chat Completions API; request strict JSON output matching the schema.
- **Prerequisites:**
  - [ ] Step 14 completed
  - [ ] OpenAI API key in `OPENAI_API_KEY` env var
  - [ ] `openai` SDK installed: `npm install openai`
- **What to do:**
  - [ ] Install OpenAI SDK: `npm install openai`
  - [ ] Create `lib/llm.ts` with a function `generateReflection(entryText: string): Promise<Reflection>`:
    - Initialize OpenAI client with API key
    - Call `openai.chat.completions.create()` with:
      - `model: 'gpt-4o-mini'` (or 'gpt-4o' if available)
      - `response_format: { type: 'json_object' }`
      - System prompt: "You are a compassionate journaling assistant. Return a JSON reflection for the user's journal entry. Follow this exact schema: ..."
      - User message: the `entryText`
    - Parse the response content as JSON
    - Validate with `ReflectionSchema.parse()`
    - Return the validated object
  - [ ] Update `app/api/generate/route.ts` to call `generateReflection(entry_text)` instead of returning hardcoded data
- **Implementation hints:**
  - OpenAI example:
    ```typescript
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: entryText },
      ],
      response_format: { type: 'json_object' },
    })
    const rawJson = JSON.parse(completion.choices[0].message.content)
    const reflection = ReflectionSchema.parse(rawJson)
    ```
  - Include the full schema in the system prompt so the LLM knows what to return
  - If the LLM returns invalid JSON, Zod will throw an error—handle it in the next step
- **Done when:**
  - [ ] API call to `/api/generate` triggers OpenAI request
  - [ ] Response is valid JSON matching `ReflectionSchema`
  - [ ] You can see LLM-generated reflections returned

---

### Step 16: Add Schema Validation & Retry Logic

- **Phase:** LLM Integration & API Layer
- **Goal:** If the LLM returns JSON that fails schema validation, retry once with a "fix-to-schema" prompt; if still invalid, return error.
- **Prerequisites:**
  - [ ] Step 15 completed
- **What to do:**
  - [ ] In `lib/llm.ts`, wrap the `ReflectionSchema.parse()` call in a try-catch
  - [ ] On validation error:
    - Log the error
    - Retry the OpenAI call with an additional system message: "Your previous response did not match the schema. Please fix it and return valid JSON."
    - Include the previous invalid response in the retry prompt
    - Parse and validate again
  - [ ] If the second attempt also fails, throw an error
  - [ ] In `app/api/generate/route.ts`, catch this error and return a 500 response with a user-friendly message: "Unable to generate reflection. Please try again."
- **Implementation hints:**
  - Use a simple counter or flag to track retries (max 1 retry)
  - Example retry prompt:
    ```typescript
    { role: 'system', content: 'Your previous response was invalid. Fix it to match the schema exactly.' }
    { role: 'assistant', content: invalidResponse }
    { role: 'user', content: 'Please fix the JSON.' }
    ```
  - Log both attempts to the server console for debugging
- **Done when:**
  - [ ] If LLM returns invalid JSON on first try, a second request is made
  - [ ] If second try also fails, user sees a clear error message
  - [ ] 95%+ of requests succeed on first or second attempt (test with varied inputs)

---

### Step 17: Save Journal Entry and Reflection Output to Database

- **Phase:** LLM Integration & API Layer
- **Goal:** After successfully generating and validating a reflection, insert the entry and output into Supabase tables.
- **Prerequisites:**
  - [ ] Step 16 completed
- **What to do:**
  - [ ] In `app/api/generate/route.ts`, after calling `generateReflection()`:
    - Insert into `journal_entries`: `{ user_id, entry_text }`
    - Get the returned `entry_id`
    - Insert into `journal_outputs`: `{ entry_id, user_id, output: reflection }`
    - Return both the `entry_id` and `reflection` to the client
  - [ ] Use `supabaseAdmin` (service role) for inserts to bypass RLS during server logic
  - [ ] Handle database errors gracefully (return 500 if insert fails)
- **Implementation hints:**
  - Example insert:
    ```typescript
    const { data: entry, error: entryError } = await supabaseAdmin
      .from('journal_entries')
      .insert({ user_id, entry_text })
      .select('id')
      .single()

    if (entryError) throw entryError

    const { error: outputError } = await supabaseAdmin
      .from('journal_outputs')
      .insert({ entry_id: entry.id, user_id, output: reflection })

    if (outputError) throw outputError
    ```
  - Return `{ entry_id: entry.id, reflection }` as JSON
- **Done when:**
  - [ ] Submitting an entry creates rows in both `journal_entries` and `journal_outputs`
  - [ ] You can see the data in Supabase Table Editor
  - [ ] API returns `entry_id` and `reflection`

---

### Step 18: Build "New Entry" Page UI

- **Phase:** Core UI & User Flows
- **Goal:** Create a page with a textarea for journal input, a submit button, and a loading state; call `/api/generate` on submit.
- **Prerequisites:**
  - [ ] Step 17 completed
  - [ ] shadcn components: `textarea`, `button`, `skeleton`
- **What to do:**
  - [ ] In `app/(app)/new/page.tsx`:
    - Add a `<Textarea>` for journal entry input
    - Add a character counter showing current length and max (5000)
    - Add a "Generate Reflection" `<Button>`
    - Disable button if input is empty or too long
    - On submit, call `POST /api/generate` with `fetch()`
    - Show a loading spinner or skeleton while waiting
    - On success, navigate to `/result/[entry_id]` with the returned `entry_id`
    - On error, display an error message (toast or alert)
  - [ ] Style the page with a clean layout (e.g., centered column, max-width 600px)
- **Implementation hints:**
  - Use `'use client'` directive since this page has state and events
  - Example fetch:
    ```typescript
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_text: text }),
    })
    const data = await res.json()
    if (res.ok) router.push(`/result/${data.entry_id}`)
    else setError(data.error)
    ```
  - Use shadcn `Skeleton` component during loading
- **Done when:**
  - [ ] `/new` page renders a functional form
  - [ ] Submitting an entry calls the API and shows loading state
  - [ ] On success, user is redirected to `/result/[entry_id]`
  - [ ] On error, user sees a helpful message

---

### Step 19: Build "Reflection Result" Page

- **Phase:** Core UI & User Flows
- **Goal:** Fetch and display the reflection JSON for a given `entry_id` using structured cards and components.
- **Prerequisites:**
  - [ ] Step 18 completed
  - [ ] shadcn components: `card`, `badge`, `accordion`
- **What to do:**
  - [ ] In `app/(app)/result/[id]/page.tsx`:
    - Get `entry_id` from the URL params
    - Fetch the reflection from Supabase:
      ```typescript
      const { data } = await supabase
        .from('journal_outputs')
        .select('output')
        .eq('entry_id', entry_id)
        .single()
      const reflection = data.output as Reflection
      ```
    - Render the reflection in sections:
      - **Mood tags**: `<Badge>` components in a flex row
      - **Reframe**: `<Card>` with the reframe text as a headline
      - **Micro-action**: `<Card>` with title, duration, and steps as a checklist (local state for checkboxes)
      - **Reflection prompts**: `<Accordion>` with each prompt as an item
      - **Mantra** (if present): small text or card
      - **Safety note** (if present): alert banner at the top
    - If no reflection found, show "Reflection not found"
  - [ ] Style each section clearly with spacing and hierarchy
- **Implementation hints:**
  - Use server component to fetch data (no client state needed for initial load)
  - Example badge list:
    ```tsx
    <div className="flex gap-2">
      {reflection.mood_tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
    </div>
    ```
  - For the micro-action checklist, use client component with `useState` to track checked steps
  - If arrays are empty, show fallback text like "No mood tags detected"
- **Done when:**
  - [ ] `/result/[entry_id]` fetches and displays the correct reflection
  - [ ] All sections (mood, reframe, prompts, micro-action) render cleanly
  - [ ] Empty arrays handled gracefully
  - [ ] Page is visually polished and easy to read

---

### Step 20: Add Input Validation & Abuse Controls

- **Phase:** Error Handling, Security & Polish
- **Goal:** Enforce max input length, add basic rate limiting (cooldown), and show clear validation errors.
- **Prerequisites:**
  - [ ] Step 19 completed
- **What to do:**
  - [ ] In `app/api/generate/route.ts`:
    - Reject requests if `entry_text` is empty or > 5000 chars (return 400)
    - Add a simple in-memory cooldown: store `user_id -> last_request_timestamp` in a Map
    - If user submitted a request in the last 60 seconds, return 429 "Too many requests"
  - [ ] In `app/(app)/new/page.tsx`:
    - Show character counter that turns red when over limit
    - Disable submit button if over limit or empty
    - Handle 429 response with a message: "Please wait 60 seconds before submitting again"
- **Implementation hints:**
  - In-memory cooldown example:
    ```typescript
    const cooldowns = new Map<string, number>()
    const lastRequest = cooldowns.get(user_id)
    if (lastRequest && Date.now() - lastRequest < 60000) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }
    cooldowns.set(user_id, Date.now())
    ```
  - For production, use a Redis-based rate limiter or Vercel Edge Config
  - Show character count like "1234 / 5000" under the textarea
- **Done when:**
  - [ ] Inputs over 5000 chars are rejected
  - [ ] Submitting twice within 60 seconds shows rate limit error
  - [ ] User sees clear feedback for all validation failures

---

### Step 21: Add Safety Note Handling

- **Phase:** Error Handling, Security & Polish
- **Goal:** If the LLM detects concerning content (self-harm, crisis), ensure `safety_note` is included and displayed prominently.
- **Prerequisites:**
  - [ ] Step 20 completed
- **What to do:**
  - [ ] Update the LLM system prompt in `lib/llm.ts` to include:
    - "If the entry mentions self-harm, suicidal thoughts, or crisis, include a `safety_note` field with a message like: 'If you're in crisis, please contact a helpline immediately. This app is not a substitute for professional help.'"
  - [ ] In `app/(app)/result/[id]/page.tsx`:
    - If `reflection.safety_note` exists, render it at the top in a prominent alert/banner (e.g., shadcn `Alert` with a warning icon)
  - [ ] Test by submitting an entry with crisis-related language and verifying the safety note appears
- **Implementation hints:**
  - Install shadcn alert: `npx shadcn@latest add alert`
  - Example:
    ```tsx
    {reflection.safety_note && (
      <Alert variant="destructive">
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>{reflection.safety_note}</AlertDescription>
      </Alert>
    )}
    ```
  - Add a disclaimer in the footer of the app: "This is not a crisis service"
- **Done when:**
  - [ ] Entries with crisis language trigger a `safety_note` in the LLM response
  - [ ] Safety note is displayed prominently on the result page
  - [ ] General disclaimer is visible on the app

---

### Step 22: Implement History Page (Stretch)

- **Phase:** Data Persistence & History
- **Goal:** Create a page that lists the user's past journal entries and allows them to click to view past reflections.
- **Prerequisites:**
  - [ ] Step 21 completed
- **What to do:**
  - [ ] In `app/(app)/history/page.tsx`:
    - Fetch all `journal_entries` for the current user, ordered by `created_at DESC`, limit 20
    - For each entry, fetch the latest `journal_output` (join on `entry_id`)
    - Display a list: date, first 50 chars of entry text, link to `/result/[entry_id]`
  - [ ] Use shadcn `Card` or `Table` to display the list
  - [ ] Add a "New Entry" button at the top linking to `/new`
- **Implementation hints:**
  - Query example:
    ```typescript
    const { data } = await supabase
      .from('journal_entries')
      .select('id, entry_text, created_at, journal_outputs(output)')
      .order('created_at', { ascending: false })
      .limit(20)
    ```
  - Truncate entry text for display: `entry_text.slice(0, 50) + '...'`
  - Format date nicely: use `new Date(created_at).toLocaleDateString()`
- **Done when:**
  - [ ] `/history` page lists user's entries
  - [ ] Clicking an entry navigates to `/result/[entry_id]`
  - [ ] Page is paginated or limited to 20 most recent entries

---

### Step 23: Add Error Handling & Logging

- **Phase:** Error Handling, Security & Polish
- **Goal:** Ensure all error paths return user-friendly messages; log server errors for debugging.
- **Prerequisites:**
  - [ ] Step 22 completed
- **What to do:**
  - [ ] In `app/api/generate/route.ts`:
    - Wrap all logic in try-catch
    - On unexpected errors, log to console (or external logger like Sentry)
    - Return 500 with message: "Something went wrong. Please try again."
  - [ ] In frontend pages:
    - Catch fetch errors and display user-friendly messages
    - Use shadcn `Toast` or `Alert` for error UI
  - [ ] Test error paths:
    - Invalid API key → user sees generic error
    - Network failure → user sees "Network error"
    - Database insert failure → user sees "Failed to save entry"
- **Implementation hints:**
  - Install shadcn toast: `npx shadcn@latest add toast`
  - Example error logging:
    ```typescript
    catch (error) {
      console.error('API error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    ```
  - Don't expose internal error details to users (e.g., stack traces, DB errors)
- **Done when:**
  - [ ] All error paths return user-friendly messages
  - [ ] Server logs errors for debugging
  - [ ] No unhandled exceptions crash the app

---

### Step 24: Add Copy-to-Clipboard for Prompts & Micro-Action (Stretch)

- **Phase:** Error Handling, Security & Polish
- **Goal:** Allow users to copy reflection prompts and micro-action steps to clipboard with one click.
- **Prerequisites:**
  - [ ] Step 23 completed
- **What to do:**
  - [ ] In `app/(app)/result/[id]/page.tsx`:
    - Add a small copy button next to each reflection prompt
    - Add a copy button for the entire micro-action
    - Use browser `navigator.clipboard.writeText()`
    - Show a toast notification on successful copy
  - [ ] Style buttons subtly (icon only, small size)
- **Implementation hints:**
  - Use a copy icon from `lucide-react` (comes with shadcn)
  - Example:
    ```tsx
    <Button size="sm" variant="ghost" onClick={() => {
      navigator.clipboard.writeText(prompt)
      toast({ title: 'Copied to clipboard' })
    }}>
      <CopyIcon />
    </Button>
    ```
  - Handle errors if clipboard API fails (older browsers)
- **Done when:**
  - [ ] Copy buttons appear next to prompts and micro-action
  - [ ] Clicking copies text to clipboard
  - [ ] Toast confirms successful copy

---

### Step 25: Add Micro-Action Timer (Stretch)

- **Phase:** Error Handling, Security & Polish
- **Goal:** Add a simple countdown timer for the micro-action duration (e.g., 10 minutes).
- **Prerequisites:**
  - [ ] Step 24 completed
- **What to do:**
  - [ ] In the micro-action card on `/result/[entry_id]`:
    - Add a "Start Timer" button
    - When clicked, start a countdown based on `duration_minutes`
    - Display remaining time (e.g., "9:45 remaining")
    - When timer ends, show a notification or alert
  - [ ] Use client-side state and `setInterval` to update the timer
  - [ ] Add pause/reset buttons if desired
- **Implementation hints:**
  - Example timer logic:
    ```typescript
    const [seconds, setSeconds] = useState(duration_minutes * 60)
    useEffect(() => {
      if (seconds > 0) {
        const timer = setTimeout(() => setSeconds(seconds - 1), 1000)
        return () => clearTimeout(timer)
      }
    }, [seconds])
    ```
  - Format seconds as MM:SS for display
  - Show a toast or alert when timer reaches 0
- **Done when:**
  - [ ] Timer button appears in micro-action card
  - [ ] Timer counts down and shows remaining time
  - [ ] User is notified when timer ends

---

### Step 26: Write Unit Tests for Schema Validation

- **Phase:** Testing & Quality Assurance
- **Goal:** Write tests to ensure the Zod schema correctly validates valid and invalid JSON.
- **Prerequisites:**
  - [ ] Step 25 completed
  - [ ] Testing framework installed (e.g., Jest or Vitest)
- **What to do:**
  - [ ] Install Vitest (recommended for Vite/Next.js): `npm install -D vitest`
  - [ ] Create `lib/__tests__/schemas.test.ts`
  - [ ] Write tests:
    - Valid reflection object → parses successfully
    - Missing required field → throws error
    - Invalid field type → throws error
    - Empty array for `reflection_prompts` (should fail `.min(2)`) → throws error
  - [ ] Run tests: `npm run test`
- **Implementation hints:**
  - Example test:
    ```typescript
    import { expect, test } from 'vitest'
    import { ReflectionSchema } from '../schemas'

    test('valid reflection parses', () => {
      const valid = { mood_tags: ['calm'], key_themes: ['work'], ... }
      expect(() => ReflectionSchema.parse(valid)).not.toThrow()
    })

    test('missing field throws', () => {
      const invalid = { mood_tags: ['calm'] }
      expect(() => ReflectionSchema.parse(invalid)).toThrow()
    })
    ```
  - Add a `test` script to `package.json`: `"test": "vitest"`
- **Done when:**
  - [ ] Tests written for valid and invalid cases
  - [ ] All tests pass
  - [ ] Coverage includes all schema constraints (min/max, required fields)

---

### Step 27: Write Integration Tests for `/api/generate`

- **Phase:** Testing & Quality Assurance
- **Goal:** Test the API endpoint end-to-end, including auth, input validation, LLM call, and DB insert.
- **Prerequisites:**
  - [ ] Step 26 completed
- **What to do:**
  - [ ] Create `app/api/generate/__tests__/route.test.ts`
  - [ ] Write tests:
    - Unauthenticated request → 401
    - Empty `entry_text` → 400
    - Valid request → 200 with valid reflection JSON
    - Database insert occurs (check Supabase test DB)
  - [ ] Use a test Supabase project or mock the DB calls
  - [ ] Mock OpenAI calls to avoid cost/latency (return fixture JSON)
- **Implementation hints:**
  - Use `vitest` or `jest` with `node-fetch` or `supertest` to call the API
  - Mock OpenAI:
    ```typescript
    vi.mock('openai', () => ({
      OpenAI: vi.fn(() => ({
        chat: { completions: { create: vi.fn(() => fixedResponse) } }
      }))
    }))
    ```
  - For DB, consider using a separate test Supabase project or mock the client
- **Done when:**
  - [ ] Tests cover auth, validation, success, and failure paths
  - [ ] Tests run reliably in CI/local
  - [ ] No test flakiness

---

### Step 28: Manual QA Checklist

- **Phase:** Testing & Quality Assurance
- **Goal:** Perform manual testing to catch edge cases and ensure the user experience is smooth.
- **Prerequisites:**
  - [ ] Step 27 completed
- **What to do:**
  - [ ] Test the full flow:
    - Sign up with a new account → succeeds
    - Log in with valid credentials → succeeds
    - Log in with invalid credentials → shows error
    - Submit empty entry → blocked with validation message
    - Submit valid entry → reflection appears
    - Refresh result page → data still loads
    - Log out → redirected to login
    - Try to access `/new` while logged out → redirected to login
  - [ ] Test edge cases:
    - Very long entry (5000+ chars) → rejected
    - Submit two entries quickly → rate limited
    - Entry with crisis language → safety note appears
    - Empty mood_tags array → shows "No mood tags"
  - [ ] Check responsive design (mobile, tablet, desktop)
  - [ ] Test in different browsers (Chrome, Safari, Firefox)
- **Implementation hints:**
  - Create a checklist in a document or issue tracker
  - Mark each test as pass/fail
  - Fix any bugs found before deployment
- **Done when:**
  - [ ] All critical flows tested and pass
  - [ ] Edge cases handled gracefully
  - [ ] No blocking bugs

---

### Step 29: Set Up Vercel Project

- **Phase:** Deployment & DevOps
- **Goal:** Create a Vercel project linked to your GitHub repo and configure environment variables.
- **Prerequisites:**
  - [ ] Step 28 completed
  - [ ] Code pushed to GitHub
  - [ ] Vercel account created
- **What to do:**
  - [ ] Push your code to a GitHub repository
  - [ ] Go to [vercel.com](https://vercel.com) and click "New Project"
  - [ ] Import your GitHub repo
  - [ ] Configure the project:
    - Framework preset: Next.js
    - Root directory: leave default
  - [ ] Add environment variables in Vercel dashboard:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `OPENAI_API_KEY`
  - [ ] Deploy the project (initial deployment)
- **Implementation hints:**
  - Vercel auto-detects Next.js and uses the correct build command
  - You can add env vars in the Vercel project settings > Environment Variables
  - Mark production vs preview environments appropriately
- **Done when:**
  - [ ] Vercel project created and linked to GitHub
  - [ ] All env vars configured
  - [ ] Initial deployment succeeds (even if not fully functional yet)

---

### Step 30: Configure Supabase Auth Redirect URLs

- **Phase:** Deployment & DevOps
- **Goal:** Update Supabase auth settings to allow authentication from the Vercel production URL.
- **Prerequisites:**
  - [ ] Step 29 completed
  - [ ] Vercel deployment URL obtained (e.g., `https://innercompass-mini.vercel.app`)
- **What to do:**
  - [ ] Go to Supabase Dashboard > Authentication > URL Configuration
  - [ ] Add your Vercel URL to:
    - Site URL: `https://innercompass-mini.vercel.app`
    - Redirect URLs: `https://innercompass-mini.vercel.app/**`
  - [ ] Save changes
  - [ ] Test auth on production by signing up and logging in
- **Implementation hints:**
  - The wildcard `/**` allows all routes under your domain
  - If you're using a custom domain, add that too
  - You can keep `localhost:3000` in the redirect URLs for local dev
- **Done when:**
  - [ ] Supabase redirect URLs configured
  - [ ] Auth works on production (sign up, log in, log out)
  - [ ] No redirect errors

---

### Step 31: Verify End-to-End Production Flow

- **Phase:** Deployment & DevOps
- **Goal:** Test the entire app on Vercel to ensure it works as expected in production.
- **Prerequisites:**
  - [ ] Step 30 completed
- **What to do:**
  - [ ] Visit your Vercel URL
  - [ ] Sign up with a new account
  - [ ] Submit a journal entry
  - [ ] Verify the reflection appears
  - [ ] Refresh the page and confirm data persists
  - [ ] Test logout and login
  - [ ] Check the history page (if implemented)
  - [ ] Open the result page in a new tab (test deep links)
  - [ ] Test on mobile device
- **Implementation hints:**
  - Use browser dev tools to check for console errors or network failures
  - Verify that API calls are hitting the correct production endpoints
  - Check Vercel logs and Supabase logs for any errors
- **Done when:**
  - [ ] All features work on production
  - [ ] No errors in browser console
  - [ ] Data persists correctly
  - [ ] App is stable and responsive

---

### Step 32: Add Logging & Monitoring (Optional)

- **Phase:** Deployment & DevOps
- **Goal:** Set up basic logging and error monitoring for production.
- **Prerequisites:**
  - [ ] Step 31 completed
- **What to do:**
  - [ ] Sign up for a monitoring service (e.g., Sentry, LogRocket, or Vercel Analytics)
  - [ ] Install the SDK: `npm install @sentry/nextjs` (if using Sentry)
  - [ ] Configure error tracking in `app/api/generate/route.ts` and other critical paths
  - [ ] Set up alerts for critical errors (e.g., LLM failures, DB errors)
  - [ ] Optional: add analytics to track user events (entry submissions, reflections generated)
- **Implementation hints:**
  - Sentry example:
    ```typescript
    import * as Sentry from '@sentry/nextjs'
    Sentry.init({ dsn: process.env.SENTRY_DSN })
    // In error handler:
    Sentry.captureException(error)
    ```
  - Vercel has built-in analytics; enable in project settings
  - Don't log sensitive data (journal entries, user emails)
- **Done when:**
  - [ ] Error monitoring configured
  - [ ] Errors reported to monitoring dashboard
  - [ ] Alerts set up for critical issues

---

### Step 33: Write README Documentation

- **Phase:** Deployment & DevOps
- **Goal:** Document the project setup, architecture, and key decisions in a clear README.
- **Prerequisites:**
  - [ ] Step 32 completed
- **What to do:**
  - [ ] Create or update `README.md` with the following sections:
    - Project overview & goals
    - Tech stack (Next.js, Supabase, OpenAI, shadcn/ui, Vercel)
    - Local setup steps (clone, install, env vars, run dev server)
    - Required environment variables (with descriptions)
    - Database schema (copy from `docs/schema.sql`)
    - API endpoints (POST `/api/generate` with request/response examples)
    - JSON schema (copy from `lib/schemas.ts` with explanation)
    - Deployment steps (Vercel + Supabase config)
    - Key design decisions (schema validation, retry logic, input limits)
    - Future enhancements (magic link auth, advanced analytics, etc.)
  - [ ] Include a demo GIF or screenshot (optional)
- **Implementation hints:**
  - Use Markdown headings and code blocks for clarity
  - Add a "Quick Start" section for new developers
  - Link to Supabase and OpenAI docs where relevant
- **Done when:**
  - [ ] README is comprehensive and clear
  - [ ] New developers can clone and run the app using the README
  - [ ] All key sections documented

---

### Step 34: Final Checklist & Handover

- **Phase:** Deployment & DevOps
- **Goal:** Perform a final review and ensure the project is ready for handover or further development.
- **Prerequisites:**
  - [ ] Step 33 completed
- **What to do:**
  - [ ] Review all code for obvious bugs or TODOs
  - [ ] Ensure all tests pass (`npm run test`)
  - [ ] Ensure build succeeds (`npm run build`)
  - [ ] Check that all env vars are documented
  - [ ] Verify RLS policies are correct (no data leaks)
  - [ ] Confirm rate limiting is active
  - [ ] Check that safety note logic works
  - [ ] Ensure error messages are user-friendly
  - [ ] Verify Vercel deployment is stable
  - [ ] Create a GitHub release or tag (e.g., `v1.0.0`)
  - [ ] Share the production URL and README with stakeholders
- **Implementation hints:**
  - Use a checklist in GitHub Issues or a doc
  - Do a final manual QA run
  - Archive or close any open issues related to v1
- **Done when:**
  - [ ] All items on the checklist complete
  - [ ] Project is production-ready
  - [ ] Stakeholders have access and documentation

---

## Section 3 – Order & Milestones

### M1 – Functional Skeleton (Steps 1–12)
**Includes:** Steps 1–12
**Demoable:**
- User can sign up, log in, and log out
- Auth pages are styled and functional
- Protected routes redirect unauthenticated users
- Database tables created with RLS enforced
- App runs locally with no errors

---

### M2 – Core Feature Complete (Steps 13–19)
**Includes:** Steps 13–19
**Demoable:**
- User can submit a journal entry on `/new`
- LLM generates a validated reflection
- Reflection is saved to the database
- User sees a clean, structured reflection on `/result/[id]`
- End-to-end flow works: login → submit entry → see reflection → refresh → data persists

---

### M3 – Polish & Production-Ready (Steps 20–25)
**Includes:** Steps 20–25
**Demoable:**
- Input validation and rate limiting active
- Safety note appears for crisis-related entries
- History page shows past reflections (if implemented)
- Copy-to-clipboard and timer features work (if implemented)
- Error handling is comprehensive and user-friendly

---

### M4 – Tested & Deployed (Steps 26–31)
**Includes:** Steps 26–31
**Demoable:**
- Unit and integration tests pass
- Manual QA completed with no critical bugs
- App deployed to Vercel and fully functional
- Auth works on production
- End-to-end production flow verified

---

### M5 – Documented & Monitored (Steps 32–34)
**Includes:** Steps 32–34
**Demoable:**
- Error monitoring and logging active
- README documentation complete
- Project ready for handover or next phase
- All stakeholders have access and understand the system

---

## Summary

This implementation plan breaks down the InnerCompass Mini PRD into **34 clear, actionable steps** across **9 high-level phases**. Each step includes:
- A clear goal
- Concrete checklist items
- Implementation hints
- Acceptance criteria

By following this plan in order, a junior engineer can build the entire app from scratch with minimal supervision. The plan covers:
- Project setup and tooling
- Database design and RLS
- Authentication and authorization
- LLM integration with schema validation
- UI development with shadcn/ui
- Error handling and security
- Testing and QA
- Deployment to Vercel
- Documentation and handover

The milestones (M1–M5) provide natural checkpoints to demo progress and ensure the project stays on track.
