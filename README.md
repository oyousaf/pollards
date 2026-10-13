# Pollards Opticians — Online Booking

Appointment booking and practice dashboard for Pollards Opticians, Wakefield.

**Stack:** Next.js 16 (App Router, Turbopack, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · react-hook-form + Zod 4 · PostgreSQL (`pg`) · Resend (email) · optional Twilio (SMS) · PM2 on a VPS

## Getting started

```bash
npm install
cp .env.example .env         # point DATABASE_URL at a local Postgres
npm run db:migrate
npm run dev
```

For local work without a Resend key, set `MAIL_OUTBOX_DIR=./tmp/outbox`: sign-in codes and
notifications are written there as JSON files instead of being sent.

| Script               | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Dev server                                  |
| `npm run build`      | Production build                            |
| `npm run db:migrate` | Apply `db/migrations/*.sql` (checksum-safe) |
| `npm run lint`       | ESLint (flat config)                        |
| `npm run typecheck`  | TypeScript, no emit                         |
| `npm run format`     | Prettier + Tailwind sorter                  |
| `npm test`           | Unit tests (Vitest)                         |
| `npm run test:e2e`   | End-to-end (Playwright)                     |
| `npm run test:all`   | Everything CI runs                          |

Deployment: see [docs/deploy-vps.md](docs/deploy-vps.md).

## How it works

**Patient flow:** `/` (name, email, mobile) → 6-digit code emailed → `/patients/[id]/register` (4-step wizard, first visit only) → `/patients/[id]/new-appointment` (optometrist, calendar slot, reason) → confirmation page with "Add to calendar".

The email code proves the patient owns the address; a signed, httpOnly cookie then ties the browser to their record, so patient URLs can't be opened by guessing IDs. Times already held by a pending or scheduled appointment are greyed out per clinician, and a partial unique index in Postgres guarantees no double booking even when two people submit at once.

**Staff:** `/admin` → 4-digit passcode login (`/admin/login`) → dashboard with live counts, search, status filters, sorting, pagination, and confirm/reschedule/cancel dialogs that notify the patient by email (and SMS when Twilio is configured).

### Security model

- All database access is server-only (`lib/db.ts`, `lib/data.ts`, `server-only` guarded) and fully parameterised.
- `proxy.ts` gives an optimistic redirect for `/admin`; every admin page, data read and server action re-checks the session.
- The passcode is compared server-side in constant time, rate-limited per IP **and** globally (4 digits is only 10,000 combinations).
- Sign-in codes are stored only as keyed hashes, expire after 15 minutes, work once, and lock after 5 wrong attempts.
- Every server action re-validates its input with the same Zod schemas the forms use. Bookings must be real future slots within opening hours (`lib/slots.ts`).
- ID documents are stored outside the web root (`UPLOAD_DIR`) with owner-only permissions and are never served publicly.
- Only the fields the dashboard renders are sent to the client; medical history never leaves the server.
- Google Analytics loads only after cookie consent.

### Configuration

- Opening hours, slot length and booking window: `constants/index.ts`
- Clinicians: `constants/index.ts` → `Doctors` (**replace the placeholder list with real staff before launch**)
- Theme tokens (light/dark, brand purple + teal): `app/globals.css`
- Schema: `db/migrations/` — add a new numbered file for changes; never edit an applied one.

## Tests

- **Unit** (`tests/unit`): slot maths including BST/GMT changes, availability, validation, rate limiting, signed tokens, and sign-in codes against real Postgres (PGlite, in-process).
- **End-to-end** (`tests/e2e`): runs the real production build against an in-memory Postgres ([PGlite](https://pglite.dev) over the wire protocol, `tests/e2e/test-db.mjs`) with email/SMS captured in a file outbox — sign-in codes, registration with ID upload, booking, greyed-out slots, the database-level double-booking guard, admin confirm/cancel with notifications. No Postgres install, Docker, secrets or network needed.
- First run locally: `npx playwright install chromium`. CI (`.github/workflows/ci.yml`) runs lint, types, unit and e2e tests on every push and PR.
