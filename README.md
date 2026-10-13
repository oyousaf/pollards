# Pollards Opticians

Online booking for Pollards Opticians, an independent optician in Wakefield. Patients book
eye examinations, contact lens fittings and keratoconus reviews in under a minute; staff
confirm, reschedule or cancel them from a live dashboard.

**Live:** [pollards.vercel.app](https://pollards.vercel.app)

## For patients

- **Passwordless sign-in.** Name, email and mobile, then a 6-digit code by email — no
  account or password to remember.
- **Guided registration.** A four-step wizard (about you, health, identification, consent)
  with progress tracking, inline validation and an optional ID document upload.
- **Real-time availability.** Pick an optometrist, a day and a 30-minute slot. Times already
  taken with that clinician are greyed out, and opening hours, notice periods and UK
  daylight-saving changes are handled automatically.
- **Confirmation and calendar.** A summary page with an "Add to calendar" download, and an
  email as soon as the practice confirms.

## For staff

- **Protected dashboard** behind a 4-digit passcode.
- **At-a-glance stats** for all, pending, scheduled and cancelled appointments.
- **Searchable, sortable appointment list** with status filters and pagination.
- **Confirm, reschedule or cancel** in a dialog; the patient is notified automatically by
  email (and by SMS when enabled).

## Design

- Light and dark themes following the system setting, with a manual toggle.
- Pollards purple with a teal accent taken from the practice's own interior; deep violet in
  dark mode.
- Instrument Serif headlines with Geist for interface text.
- Responsive from phone to desktop, keyboard accessible, and respectful of reduced-motion
  preferences.

## Under the hood

| Area      | Choice                                                            |
| --------- | ----------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, React Compiler), React 19 |
| UI        | Tailwind CSS 4, shadcn/ui on Radix, Lucide icons                  |
| Forms     | react-hook-form with Zod 4 schemas shared by client and server    |
| Data      | PostgreSQL with versioned SQL migrations                          |
| Messaging | Resend for email; Twilio for optional SMS                         |
| Hosting   | Self-hosted on a VPS with PM2, served through Vercel              |
| Quality   | Vitest unit tests, Playwright end-to-end tests, GitHub Actions CI |

## Privacy and security

- Patient data is only ever handled server-side; the browser receives just what each screen
  displays, and medical history never leaves the server.
- Patients can only open their own records, and every staff action re-checks the session.
- Double booking is impossible at the database level, even if two people book the same
  slot at the same moment.
- Sign-in codes are stored only as hashes, expire after 15 minutes, work once and lock after
  repeated wrong attempts; staff and sign-in endpoints are rate-limited.
- ID documents are stored privately on the server, never publicly accessible.
- Analytics load only after cookie consent.
