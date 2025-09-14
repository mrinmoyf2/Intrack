Here’s a complete README you can drop into your repo. It covers setup, commands, design notes, and what’s done vs skipped.

---

# Buyer Lead Intake (Next.js + Postgres + Prisma + Clerk + Zod)

A mini app to capture, list, and manage buyer leads with validation, search/filter, CSV import/export, and basic ownership/security.

Tech stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Postgres (Neon/local) with Prisma (migrations)
- Clerk for auth
- Zod for validation (shared client/server)
- CSV import/export

Live (optional)
- If deployed: add your Vercel URL here.

Repository
- Add your GitHub repo URL here.

---

Setup

1) Requirements
- Node 18+ (or 20+ recommended)
- pnpm (or npm/yarn)
- Postgres DB (Neon, Supabase, or Docker local)

2) Clone and install
```bash
git clone https://github.com/<your-username>/buyer-intake.git
cd buyer-intake
pnpm install
```

3) Environment variables
Create .env.local with:
```bash
# Postgres (Neon/local)
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"

# Clerk (from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-publishable-key>"
CLERK_SECRET_KEY="<your-secret-key>"
CLERK_SIGN_IN_URL="/sign-in"
CLERK_SIGN_UP_URL="/sign-up"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
Notes:
- If you’re using Neon, set sslmode=require in DATABASE_URL.
- For local Docker Postgres, remove ssl params:
  DATABASE_URL="postgresql://admin:admin@localhost:5432/buyerdb"

4) Prisma: generate + migrate
If you ever migrated from SQLite, be sure prisma/migrations and prisma/migration_lock.toml are clean for Postgres history.
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
# Optional data wipe (dev only)
# pnpm prisma migrate reset
```

5) Run locally
```bash
pnpm dev
```
- App: http://localhost:3000
- Sign-in: http://localhost:3000/sign-in

6) Optional: Seed (if you add a seed script)
Add a prisma/seed.ts and run:
```bash
pnpm prisma db seed
```

7) shadcn/ui components
If you add new shadcn components later:
```bash
pnpm dlx shadcn-ui@latest add input button select textarea label sheet popover command progress badge
```

---

Scripts

- Dev: pnpm dev
- Build: pnpm build
- Start: pnpm start
- Prisma migrate: pnpm prisma migrate dev --name <name>
- Prisma generate: pnpm prisma generate
- Prisma studio: pnpm prisma studio
- Tests (Vitest): pnpm test

---

How to use

- Sign In via Clerk at /sign-in (dev instance OK).
- Create new lead at /buyers/new
- List/search/filter at /buyers with SSR pagination, filters in URL, debounced search.
- View/Edit at /buyers/[id] with optimistic concurrency (updatedAt).
- CSV:
  - Export: “Export CSV” from /buyers (respects filters/search/sort).
  - Import: “Import CSV” sheet/button. Max 200 rows. Shows validation errors (row + message). Inserts valid rows in a single transaction.

CSV format (headers)
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status

- tags can be comma-separated in import (e.g., hot, nr)

---

Design notes

1) Validation (Zod)
- Shared schemas in src/lib/schema.ts
  - buyerBaseSchema + buyerCreateSchema + buyerUpdateSchema + csvRowSchema
  - Client-side validation in BuyerForm using buyerCreateSchema
  - Server-side re-validation in server actions (defense in depth)
- Rules:
  - fullName 2–80
  - phone 10–15 digits
  - email optional (valid if provided)
  - bhk required if propertyType ∈ {Apartment, Villa}
  - budgetMax ≥ budgetMin if both present
  - notes ≤ 1000
  - tags are an array (optional in base schema); CSV normalizes via transform

2) Data model (Prisma)
- Postgres with Prisma migrations
- tables: User, Buyer, BuyerHistory, enums
- tags: String[] (Postgres text array)
- BuyerHistory stores diffs after updates
- updatedAt managed by Prisma (@updatedAt)

3) Auth and ownership (Clerk)
- Middleware protects /buyers routes (public routes: /, /sign-in, /sign-up)
- Anyone signed in can read all buyers
- Only owner (ownerId = current user id) can edit/delete; optional admin override via session claims
- Ownership checks in server actions (can’t be bypassed by client)

4) SSR vs client
- /buyers list is SSR, with:
  - true pagination (page=1..N)
  - sort (default updatedAt desc)
  - filters in URL (city, propertyType, status, timeline)
  - debounced search by fullName|phone|email (search param q)
- /buyers/new and /buyers/[id] forms are client components using server actions
- CSV import page/sheet is client with server route handler for POST

5) Concurrency control
- Edit form includes hidden updatedAt (epoch ms)
- Server compares client epoch vs DB updatedAt epoch; if mismatch, returns stale error “Record changed, please refresh”
- Prevents overwriting concurrent changes

6) Rate limiting
- Simple in-memory limiter per user for create/update in server actions
- For production, consider moving to Upstash Redis

7) CSV import/export
- Import validates each row using csvRowSchema; shows error table (row + message)
- Inserts valid rows in a single transaction (createMany)
- Export returns CSV of current filtered list (respects search/filters/sort)

8) Accessibility
- Labels tied to inputs (htmlFor/id)
- Errors rendered with role="alert"
- Keyboard navigable selects (shadcn/ui)
- Focus moves to first error field client-side

9) Styling/UI
- Tailwind + shadcn/ui
- Consistent form inputs, combobox filters, and table UI
- Sticky headers, responsive containers, mobile-safe sheets

---

What’s done vs skipped

Done
- Next.js App Router + TypeScript
- Postgres + Prisma with migrations
- Clerk auth with middleware-protected routes
- Zod validation on client + server
- Create/List/Edit with SSR pagination and filters
- Debounced search by name/phone/email
- Sort by updatedAt desc default
- Concurrency check with updatedAt
- Ownership checks in server actions
- History (last 5 changes) displayed on /buyers/[id]
- CSV import (max 200 rows), row-level errors, transactional insert
- CSV export of current filtered list
- Simple rate limiting on create/update
- Basic test (Vitest) for CSV row schema
- A11y basics and error handling
- Production-ready inputs/combobox/table styling via shadcn/ui

Skipped or limited (and why)
- Admin role UI: Role support is plumbed via session claims (isAdmin) but no dedicated admin interface. Time-boxed.
- Full-text search (Postgres tsv/trigram): Debounced contains search implemented. FTS would need migrations, indexes, and query changes; out of scope for time.
- File upload/attachment: Not included due to time; straightforward with S3/Supabase Storage + a single URL column.
- Optimistic UI/rollback: Concurrency safe approach chosen; optimistic UX would require additional client/store logic.
- Tag chips with typeahead: Kept simple text input (comma separated). Can be added later using a Combobox with multi-select.
- Upstash-based rate limiting: In-memory limiter is fine for demo/dev. For production, move to Redis backed limiter.

---

Development notes and gotchas

- Prisma provider mismatch (SQLite → Postgres):
  - If you switch providers, delete prisma/migrations and prisma/migration_lock.toml, then run migrate dev to create a fresh Postgres migration history.
- Enum mappings:
  - UI uses strings like "1" | "2" | "Studio" and timelines like "0-3m".
  - Server maps to Prisma enums (ONE/TWO/STUDIO, ZERO_THREE_MONTHS, etc.). Keep mappings in actions.ts in sync with schema.
- Clerk middleware:
  - Use publicRoutes for "/", "/sign-in(.*)", "/sign-up(.*)"; everything else is protected.
  - This prevents data rendering before redirect in unauthenticated contexts.
- Zod + transforms:
  - Accept empty strings from FormData and convert to undefined where appropriate before validation.
  - buyerUpdateSchema uses safeExtend because buyerCreateSchema has refinements (Zod rule).
- Shadcn Select:
  - Do not use SelectItem with value="" — it throws. Use placeholder and keep controlled value "" without rendering an empty item. Mirror to hidden input for FormData.

---

Folder structure (high-level)

- app/
  - buyers/
    - page.tsx (SSR list)
    - new/page.tsx (create)
    - [id]/page.tsx (view/edit + history)
    - export/route.ts (CSV export)
    - import/page.tsx (CSV import UI or ImportSheet trigger)
    - actions.ts (server actions)
  - (auth)/sign-in/[[...sign-in]]/page.tsx
  - (auth)/sign-up/[[...sign-up]]/page.tsx
  - layout.tsx
  - page.tsx
- components/
  - BuyerForm.tsx
  - BuyersTable.tsx
  - Filters.tsx
  - ImportSheet.tsx
  - ui/* (shadcn)
- lib/
  - db.ts (Prisma client)
  - schema.ts (Zod schemas)
  - ownership.ts
  - ratelimit.ts
  - csv.ts
  - utils.ts (cn, etc.)
- prisma/
  - schema.prisma
  - migrations/
- tests/
  - csv-validate.test.ts

---

Testing

- Unit example: CSV row validator
```bash
pnpm test
```

---

Deployment (Vercel)

- Create project on Vercel and set env vars:
  - DATABASE_URL (Neon / Supabase URL)
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - CLERK_SIGN_IN_URL=/sign-in
  - CLERK_SIGN_UP_URL=/sign-up
  - NEXT_PUBLIC_APP_URL=https://<your-domain>
- Run migrations against the production DB:
  - Option A: Temporarily set DATABASE_URL to prod locally, run pnpm prisma migrate deploy
  - Option B: Use Prisma Data Proxy / remote migrations if set up
- Redeploy. Verify /buyers redirects to sign-in when logged out and loads correctly when logged in.

---

Roadmap (future enhancements)
- Status quick actions in the table (dropdown to update status inline)
- Tag chips with typeahead and multi-select
- Full-text search on fullName,email,notes with Postgres tsvector
- Upstash Redis rate limiting for production
- Activity feed with better diff rendering

---

License
- Add your license here (MIT recommended).