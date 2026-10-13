"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/types";

import { findPatient, isUuid } from "../data";
import { isUniqueViolation, query } from "../db";
import { notifyPatient } from "../notify";
import { getPatientUserId, requireAdmin } from "../session";
import { isBookableSlot } from "../slots";
import { formatDateTime } from "../utils";
import {
  CancelAppointmentSchema,
  CreateAppointmentSchema,
  ScheduleAppointmentSchema,
  type CancelAppointmentInput,
  type CreateAppointmentInput,
  type ScheduleAppointmentInput,
} from "../validation";

const GENERIC_ERROR = "Something went wrong on our side. Please try again in a moment.";
const SLOT_TAKEN = "Sorry, that time has just been booked. Please choose another slot.";
const NOT_FOUND = "That appointment no longer exists.";

// ---------- Patient ----------

export async function createAppointment(input: CreateAppointmentInput): Promise<ActionResult> {
  const patientId = await getPatientUserId();
  if (!patientId) return { ok: false, error: "Your session has expired. Please start again." };

  const parsed = CreateAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isBookableSlot(parsed.data.schedule)) {
    return { ok: false, error: "That time is no longer available. Please pick another slot." };
  }

  // Resolve the patient server-side — never trust a patient ID from the client.
  if (!(await findPatient(patientId))) redirect(`/patients/${patientId}/register`);

  let appointmentId: string;
  try {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO appointments (patient_id, primary_physician, schedule, reason, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        patientId,
        parsed.data.primaryPhysician,
        parsed.data.schedule,
        parsed.data.reason,
        parsed.data.note || null,
      ]
    );
    appointmentId = rows[0].id;
  } catch (error) {
    // The appointments_active_slot unique index rejects double bookings, even under races.
    if (isUniqueViolation(error)) return { ok: false, error: SLOT_TAKEN };
    console.error("createAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin");
  redirect(`/patients/${patientId}/new-appointment/success?appointmentId=${appointmentId}`);
}

// ---------- Admin ----------

type UpdatedRow = { schedule: Date; name: string; email: string; phone: string };

const RETURNING_PATIENT = `
  RETURNING a.schedule,
    (SELECT name FROM patients WHERE id = a.patient_id),
    (SELECT email FROM patients WHERE id = a.patient_id),
    (SELECT phone FROM patients WHERE id = a.patient_id)`;

export async function scheduleAppointment(
  appointmentId: string,
  input: ScheduleAppointmentInput
): Promise<ActionResult<{ notified: boolean }>> {
  await requireAdmin();
  const parsed = ScheduleAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isUuid(appointmentId)) return { ok: false, error: NOT_FOUND };

  let row: UpdatedRow | undefined;
  try {
    ({
      rows: [row],
    } = await query<UpdatedRow>(
      `UPDATE appointments a SET
         primary_physician = $2, schedule = $3, status = 'scheduled',
         cancellation_reason = NULL, updated_at = now()
       WHERE a.id = $1 ${RETURNING_PATIENT}`,
      [appointmentId, parsed.data.primaryPhysician, parsed.data.schedule]
    ));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That clinician already has an appointment at this time." };
    }
    console.error("scheduleAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!row) return { ok: false, error: NOT_FOUND };

  const when = formatDateTime(row.schedule).dateTime;
  const notified = await notifyPatient(
    row,
    "Your Pollards appointment is confirmed",
    `Your appointment is confirmed for ${when} with ${parsed.data.primaryPhysician}. Please call us if you need to change it.`
  );
  revalidatePath("/admin");
  return { ok: true, data: { notified } };
}

export async function cancelAppointment(
  appointmentId: string,
  input: CancelAppointmentInput
): Promise<ActionResult<{ notified: boolean }>> {
  await requireAdmin();
  const parsed = CancelAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isUuid(appointmentId)) return { ok: false, error: NOT_FOUND };

  let row: UpdatedRow | undefined;
  try {
    ({
      rows: [row],
    } = await query<UpdatedRow>(
      `UPDATE appointments a SET
         status = 'cancelled', cancellation_reason = $2, updated_at = now()
       WHERE a.id = $1 ${RETURNING_PATIENT}`,
      [appointmentId, parsed.data.cancellationReason]
    ));
  } catch (error) {
    console.error("cancelAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!row) return { ok: false, error: NOT_FOUND };

  const when = formatDateTime(row.schedule).dateTime;
  const notified = await notifyPatient(
    row,
    "Your Pollards appointment has been cancelled",
    `We're sorry, your appointment on ${when} has been cancelled. Reason: ${parsed.data.cancellationReason}. Please rebook online or call us.`
  );
  revalidatePath("/admin");
  return { ok: true, data: { notified } };
}
