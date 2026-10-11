import "server-only";

import { Query } from "node-appwrite";
import { cache } from "react";

import { BOOKING_WINDOW_DAYS, SLOT_MINUTES, STATUSES } from "@/constants";
import type { AppointmentDTO, AppointmentRow, PatientRow, PublicUser, Status } from "@/types";

import type { BookedSlot } from "./availability";
import { appwrite } from "./appwrite";
import { env } from "./env";
import { requireAdmin } from "./session";

// Data access layer: every read goes through here so authorisation and
// data minimisation (only send the client what it renders) live in one place.

export const getUser = cache(async (userId: string): Promise<PublicUser | null> => {
  try {
    const user = await appwrite().users.get({ userId });
    return { id: user.$id, name: user.name, email: user.email, phone: user.phone };
  } catch {
    return null;
  }
});

export const findPatient = cache(async (userId: string) => {
  const { APPWRITE_DATABASE_ID, APPWRITE_PATIENT_TABLE_ID } = env();
  const { rows } = await appwrite().tables.listRows<PatientRow>({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_PATIENT_TABLE_ID,
    queries: [Query.equal("userId", [userId]), Query.limit(1)],
  });
  return rows[0] ?? null;
});

function toDTO(row: AppointmentRow): AppointmentDTO {
  return {
    id: row.$id,
    createdAt: row.$createdAt,
    schedule: row.schedule,
    status: row.status,
    primaryPhysician: row.primaryPhysician,
    reason: row.reason,
    note: row.note ?? null,
    cancellationReason: row.cancellationReason ?? null,
    patientName:
      typeof row.patient === "object" && row.patient ? row.patient.name : "Unknown patient",
  };
}

/** Appointment for the confirmation page — only if it belongs to the signed-in patient. */
export async function getPatientAppointment(appointmentId: string, userId: string) {
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  try {
    const row = await appwrite().tables.getRow<AppointmentRow>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_APPOINTMENT_TABLE_ID,
      rowId: appointmentId,
    });
    return row.userId === userId ? toDTO(row) : null;
  } catch {
    return null;
  }
}

export async function getAppointmentStats() {
  await requireAdmin();
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  const { tables } = appwrite();

  // `total` reflects the full count server-side, not just the first page.
  const count = (status?: Status) =>
    tables
      .listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_APPOINTMENT_TABLE_ID,
        queries: [...(status ? [Query.equal("status", [status])] : []), Query.limit(1)],
      })
      .then((r) => r.total);

  const [total, ...byStatus] = await Promise.all([undefined, ...STATUSES].map(count));
  return {
    total,
    ...(Object.fromEntries(STATUSES.map((s, i) => [s, byStatus[i]])) as Record<Status, number>),
  };
}

export async function listRecentAppointments(limit = 250) {
  await requireAdmin();
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  const { rows } = await appwrite().tables.listRows<AppointmentRow>({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_APPOINTMENT_TABLE_ID,
    queries: [Query.select(["*", "patient.*"]), Query.orderDesc("$createdAt"), Query.limit(limit)],
  });
  return rows.map(toDTO);
}

const ACTIVE_STATUSES: Status[] = ["pending", "scheduled"];

/**
 * Future slots held by pending or scheduled appointments, so pickers can grey them out.
 * Only times and clinician names are returned — no patient data.
 */
export async function getBookedSlots(): Promise<BookedSlot[]> {
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  const now = new Date();
  const end = new Date(now.getTime() + (BOOKING_WINDOW_DAYS + 1) * 864e5);
  try {
    const { rows } = await appwrite().tables.listRows<AppointmentRow>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_APPOINTMENT_TABLE_ID,
      queries: [
        Query.select(["$id", "schedule", "primaryPhysician"]),
        Query.equal("status", ACTIVE_STATUSES),
        Query.between("schedule", now.toISOString(), end.toISOString()),
        Query.limit(5000),
      ],
    });
    return rows.map((r) => ({ id: r.$id, physician: r.primaryPhysician, schedule: r.schedule }));
  } catch (error) {
    // Degrade gracefully: nothing greyed out, but isSlotTaken() still rejects clashes on submit.
    console.error("getBookedSlots failed", error);
    return [];
  }
}

/** Server-side double-booking guard (the client greying-out is only a convenience). */
export async function isSlotTaken(physician: string, slot: Date, excludeId?: string) {
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  const end = new Date(slot.getTime() + SLOT_MINUTES * 60_000);
  const { total } = await appwrite().tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_APPOINTMENT_TABLE_ID,
    queries: [
      Query.equal("primaryPhysician", [physician]),
      Query.equal("status", ACTIVE_STATUSES),
      Query.greaterThanEqual("schedule", slot.toISOString()),
      Query.lessThan("schedule", end.toISOString()),
      ...(excludeId ? [Query.notEqual("$id", excludeId)] : []),
      Query.limit(1),
    ],
  });
  return total > 0;
}
