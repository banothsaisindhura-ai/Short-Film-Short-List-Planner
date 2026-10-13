# Short Film Shot List Planner 🎬

Cinematic dashboard for student / indie filmmakers: projects, AI shot lists (Gemini), schedule, assistant, CSV/PDF exports. **100% local** — all data persists in your browser via localStorage. No account, no server, no Supabase needed.

## Quickstart

```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in with any display name — everything is stored locally.

## Optional: Gemini AI

Copy `.env.example` → `.env.local` and add:

```
GEMINI_API_KEY=
```

- Get a key at https://aistudio.google.com (default model `gemini-2.0-flash`, override with `GEMINI_MODEL`).
- Without the key, the AI Generator and Assistant return clearly-labeled demo output and still work end-to-end.

## Features

- Dashboard: project/shot stats, progress chart, upcoming sessions, quick actions
- Projects: create/edit/delete, search + genre filter, status, progress bars
- Shot List: table & card views, 19 shot fields, search/filter/sort, quick status + date updates, duplicate, bulk status, add/edit modal, CSV + print/PDF
- AI Generator: synopsis → structured shot list (Zod-validated JSON), editable preview, regenerate, approve without overwriting
- Schedule: shots grouped by date/location, location-grouping recommendation (marked as estimate), auto-assign dates, CSV/print
- AI Assistant: asks questions using real saved project/shot context (labeled AI estimates)
- Settings: profile, local data management

## Test checklist

1. Enter any name on login → dashboard loads.
2. Create + edit project → appears on dashboard.
3. Add/edit/duplicate/delete shots; status + date update; refresh persists.
4. AI Generator (shots page) → preview → edit → approve saves without overwriting.
5. Assistant answers with project context.
6. CSV export + Print/PDF work; schedule auto-assign by location.
7. Search/filters work; mobile + desktop layout OK.
8. Missing Gemini key shows demo fallback message.

## Deploy (Vercel)

1. Push to GitHub. 2. Vercel → New Project → import → add `GEMINI_API_KEY` env var (optional). 3. Deploy (`npm run build`).

## Milestones

- [x] 1. Requirements + architecture (local-first)
- [x] 2. Next.js + Tailwind UI
- [x] 3. localStorage persistence + demo seeding
- [x] 4. Gemini shot generation + assistant (server routes, Zod validation)
- [x] 5. Exports, schedule, responsive polish
- [x] 6. Local build verification
- [ ] 7. Vercel deploy (requires user account)
