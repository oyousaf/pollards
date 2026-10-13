import type { STATUSES } from "@/constants";

export type Status = (typeof STATUSES)[number];

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

/** Contact details captured at sign-in, before registration is complete. */
export type PublicUser = { id: string; name: string; email: string; phone: string };

/** A patient who has completed registration. */
export type RegisteredPatient = { id: string; name: string; primaryPhysician: string | null };

/** Minimal, serialisable appointment shape sent to client components. */
export type AppointmentDTO = {
  id: string;
  createdAt: string;
  schedule: string;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string | null;
  cancellationReason: string | null;
  patientName: string;
};
