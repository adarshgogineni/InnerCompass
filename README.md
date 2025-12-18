# InnerCompass Mini

A lightweight journaling app where users write entries and instantly get grounded reflections with mood tags, key themes, reflection prompts, and actionable micro-actions.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **UI:** shadcn/ui components + Tailwind CSS
- **Auth/DB:** Supabase (Postgres + Row Level Security)
- **LLM:** OpenAI (server-side API calls)
- **Deployment:** Vercel

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=         # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Your Supabase anon/public key (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=        # Your Supabase service role key (server-only, never expose!)

# OpenAI Configuration
OPENAI_API_KEY=                   # Your OpenAI API key
```

### How to get these values:

- **Supabase:** Create a project at [supabase.com](https://supabase.com), then go to Project Settings > API
- **OpenAI:** Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

