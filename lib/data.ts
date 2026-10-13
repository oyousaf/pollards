import "server-only";

import { cache } from "react";

import { BOOKING_WINDOW_DAYS, STATUSES } from "@/constants";
import type { AppointmentDTO, PublicUser, RegisteredPatient, Status } from "@/types";

import type { BookedSlot } from "./availability";
import { query } from "./db";
import { requireAdmin } from "./session";

// Data access layer: every read goes through here so authorisation and
// data minimisation (only send the client what it renders) live in one place.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);

export const getUser = cache(async (id: string): Promise<PublicUser | null> => {
  if (!isUuid(id)) return null;
  const { rows } = await query<PublicUser>(
    "SELECT id, name, email, phone FROM patients WHERE id = $1",
    [id]
  );
  return rows[0] ?? null;
});

/** The patient record, but only once registration has been completed. */
export const findPatient = cache(async (id: string): Promise<RegisteredPatient | null> => {
  if (!isUuid(id)) return null;
  const { rows } = await query<RegisteredPatient>(
    `SELECT id, name, primary_physician AS "primaryPhysician"
     FROM patients WHERE id = $1 AND registered_at IS NOT NULL`,
    [id]
  );
  return rows[0] ?? null;
});

const APPOINTMENT_COLUMNS = `
  a.id,
  a.created_at AS "createdAt",
  a.schedule,
  a.status,
  a.primary_physician AS "primaryPhysician",
  a.reason,
  a.note,
  a.cancellation_reason AS "cancellationReason",
  p.name AS "patientName"`;

type AppointmentRow = Omit<AppointmentDTO, "createdAt" | "schedule"> & {
  createdAt: Date;
  schedule: Date;
};

// pg returns timestamptz as Date; client components need plain strings.
const toDTO = (row: AppointmentRow): AppointmentDTO => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  schedule: row.schedule.toISOString(),
});

/** Appointment for the confirmation page — only if it belongs to the signed-in patient. */
export async function getPatientAppointment(appointmentId: string, patientId: string) {
  if (!isUuid(appointmentId) || !isUuid(patientId)) return null;
  const { rows } = await query<AppointmentRow>(
    `SELECT ${APPOINTMENT_COLUMNS}
     FROM appointments a JOIN patients p ON p.id = a.patient_id
     WHERE a.id = $1 AND a.patient_id = $2`,
    [appointmentId, patientId]
  );
  return rows[0] ? toDTO(rows[0]) : null;
}

export async function getAppointmentStats() {
  await requireAdmin();
  const { rows } = await query<{ status: Status; count: string }>(
    "SELECT status, count(*) FROM appointments GROUP BY status"
  );
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const r of rows) byStatus[r.status] = Number(r.count);
  return { total: Object.values(byStatus).reduce((a, b) => a + b, 0), ...byStatus };
}

export async function listRecentAppointments(limit = 250) {
  await requireAdmin();
  const { rows } = await query<AppointmentRow>(
    `SELECT ${APPOINTMENT_COLUMNS}
     FROM appointments a JOIN patients p ON p.id = a.patient_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(toDTO);
}

/**
 * Future slots held by pending or scheduled appointments, so pickers can grey them out.
 * Only times and clinician names are returned — no patient data.
 */
export async function getBookedSlots(): Promise<BookedSlot[]> {
  const { rows } = await query<{ id: string; physician: string; schedule: Date }>(
    `SELECT id, primary_physician AS physician, schedule FROM appointments
     WHERE status IN ('pending', 'scheduled')
       AND schedule > now() AND schedule < now() + make_interval(days => $1)`,
    [BOOKING_WINDOW_DAYS + 1]
  );
  return rows.map((r) => ({ ...r, schedule: r.schedule.toISOString() }));
}
