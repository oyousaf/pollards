# Pollards Opticians — Online Booking

Appointment booking and practice dashboard for Pollards Opticians, Wakefield.

**Stack:** Next.js 16 (App Router, Turbopack, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · react-hook-form + Zod 4 · Appwrite (TablesDB, Storage, Messaging/SMS)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Appwrite + secrets
npm run dev
```

| Script              | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server                 |
| `npm run build`     | Production build           |
| `npm run lint`      | ESLint (flat config)       |
| `npm run typecheck` | TypeScript, no emit        |
| `npm run format`    | Prettier + Tailwind sorter |
| `npm test`          | Unit tests (Vitest)        |
| `npm run test:e2e`  | End-to-end (Playwright)    |
| `npm run test:all`  | Everything CI runs         |

## How it works

**Patient flow:** `/` (name, email, mobile) → 6-digit code emailed via Appwrite → `/patients/[userId]/register` (4-step wizard, first visit only) → `/patients/[userId]/new-appointment` (optometrist, calendar slot, reason) → confirmation page with "Add to calendar".

The email code proves the patient owns the address; a signed, httpOnly cookie then ties the browser to their record, so patient URLs can't be opened by guessing IDs. Times already held by a pending or scheduled appointment are greyed out per clinician, and the server re-checks for clashes on every booking and reschedule.

**Staff:** `/admin` → 4-digit passcode login (`/admin/login`) → dashboard with live counts, search, status filters, sorting, pagination, and confirm/reschedule/cancel dialogs that SMS the patient.

### Security model

- All Appwrite access is server-only (`lib/appwrite.ts`, `server-only` guarded); the API key never reaches the browser.
- `proxy.ts` gives an optimistic redirect for `/admin`; every admin page, data read (`lib/data.ts`) and server action re-checks the session.
- The passcode is compared server-side in constant time, rate-limited per IP **and** globally (4 digits is only 10,000 combinations).
- Every server action re-validates its input with the same Zod schemas the forms use. Bookings must be real future slots within opening hours (`lib/slots.ts`).
- Only the fields the dashboard renders are sent to the client; medical history never leaves the server.
- Google Analytics loads only after cookie consent.

### Configuration

- Opening hours, slot length and booking window: `constants/index.ts`
- Clinicians: `constants/index.ts` → `Doctors` (**replace the placeholder list with real staff before launch**)
- Theme tokens (light/dark, brand purple + teal): `app/globals.css`

### Appwrite setup

- **Auth → Settings → enable "Email OTP"**, and make sure an SMTP provider is configured (Appwrite Cloud has one by default). Customise the "OTP session" email template with the practice name.
- The API key needs these scopes: `users.read`, `users.write`, `sessions.write`, `rows.read`, `rows.write`, `files.write`, `messages.write`.

## Tests

- **Unit** (`tests/unit`): slot maths including BST/GMT changes, availability, validation, rate limiting, signed tokens.
- **End-to-end** (`tests/e2e`): runs the real production build against an in-memory Appwrite mock (`tests/e2e/mock-appwrite.mjs`) — email-code sign-in, booking, greyed-out slots, the server-side double-booking guard, admin login, and confirm-with-SMS. No secrets or network needed.
- First run locally: `npx playwright install chromium`. CI (`.github/workflows/ci.yml`) runs lint, types, unit and e2e tests on every push and PR.
