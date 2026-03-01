# BizPilot - AI Business Copilot

## Project Overview
BizPilot is an AI business copilot for local businesses. Owners paste their website URL, we scrape + embed the content, and spin up a customer-facing RAG chatbot. When buying intent is detected, a lead capture agent qualifies the customer conversationally and saves the lead to a dashboard.

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v3
- **Backend:** Supabase (Auth, Postgres with pgvector, Edge Functions)
- **AI:** Claude (chat) + OpenAI text-embedding-3-small (embeddings, 1536 dims)
- **Routing:** React Router v6

## Commands
- `npm run dev` — start dev server
- `npm run build` — type-check + build
- `npm run lint` — ESLint

## Architecture
- `src/` — React frontend
- `src/hooks/` — Custom React hooks (useAuth, useBusiness, useChat, useLeads)
- `src/components/` — UI components organized by feature
- `src/pages/` — Page-level components
- `src/app/` — Layout and routing
- `src/lib/` — Supabase client and utilities
- `src/types/` — TypeScript interfaces
- `supabase/functions/` — Deno Edge Functions (scrape, chat)
- `supabase/migrations/` — SQL migration files

## Key Patterns
- Supabase RLS enforces data isolation per owner
- Edge Functions use service_role key for DB writes
- Chat function uses Claude tool_use for lead capture
- Public chat route `/chat/:businessId` requires no auth
- Owner routes under `/dashboard` require auth via AuthGuard

## Environment Variables
- Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (in .env.local)
- Edge Functions: OPENAI_API_KEY, ANTHROPIC_API_KEY (Supabase secrets)
