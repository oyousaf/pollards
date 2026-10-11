import type { Models } from "node-appwrite";

import type { GenderOptions, STATUSES } from "@/constants";

export type Status = (typeof STATUSES)[number];
export type Gender = (typeof GenderOptions)[number];

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

export type PublicUser = { id: string; name: string; email: string; phone: string };

/** Appwrite row shapes (tables were previously "collections"; IDs are unchanged). */
export interface PatientRow extends Models.Row {
  userId: string;
  name: string;
  email: string;
  phone: string;
  primaryPhysician: string;
}

export interface AppointmentRow extends Models.Row {
  userId: string;
  patient: PatientRow | string;
  schedule: string;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string | null;
  cancellationReason: string | null;
}

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
