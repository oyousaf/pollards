"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID } from "node-appwrite";

import type { ActionResult, AppointmentRow } from "@/types";

import { appwrite } from "../appwrite";
import { findPatient, isSlotTaken } from "../data";
import { env } from "../env";
import { requireAdmin, getPatientUserId } from "../session";
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

const tableRef = () => {
  const { APPWRITE_DATABASE_ID, APPWRITE_APPOINTMENT_TABLE_ID } = env();
  return { databaseId: APPWRITE_DATABASE_ID, tableId: APPWRITE_APPOINTMENT_TABLE_ID };
};

// ---------- Patient ----------

export async function createAppointment(input: CreateAppointmentInput): Promise<ActionResult> {
  const userId = await getPatientUserId();
  if (!userId) return { ok: false, error: "Your session has expired. Please start again." };

  const parsed = CreateAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isBookableSlot(parsed.data.schedule)) {
    return { ok: false, error: "That time is no longer available. Please pick another slot." };
  }
  if (await isSlotTaken(parsed.data.primaryPhysician, parsed.data.schedule)) {
    return { ok: false, error: SLOT_TAKEN };
  }

  // Resolve the patient server-side — never trust a patient ID from the client.
  const patient = await findPatient(userId);
  if (!patient) redirect(`/patients/${userId}/register`);

  let appointmentId: string;
  try {
    const row = await appwrite().tables.createRow({
      ...tableRef(),
      rowId: ID.unique(),
      data: {
        userId,
        patient: patient.$id,
        primaryPhysician: parsed.data.primaryPhysician,
        schedule: parsed.data.schedule.toISOString(),
        reason: parsed.data.reason,
        note: parsed.data.note || null,
        status: "pending",
      },
    });
    appointmentId = row.$id;
  } catch (error) {
    console.error("createAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin");
  redirect(`/patients/${userId}/new-appointment/success?appointmentId=${appointmentId}`);
}

// ---------- Admin ----------

async function notify(userId: string, content: string) {
  try {
    await appwrite().messaging.createSms({ messageId: ID.unique(), content, users: [userId] });
    return true;
  } catch (error) {
    console.error("SMS notification failed", error);
    return false;
  }
}

export async function scheduleAppointment(
  appointmentId: string,
  input: ScheduleAppointmentInput
): Promise<ActionResult<{ smsSent: boolean }>> {
  await requireAdmin();
  const parsed = ScheduleAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (await isSlotTaken(parsed.data.primaryPhysician, parsed.data.schedule, appointmentId)) {
    return { ok: false, error: "That clinician already has an appointment at this time." };
  }

  try {
    const row = await appwrite().tables.updateRow<AppointmentRow>({
      ...tableRef(),
      rowId: appointmentId,
      data: {
        primaryPhysician: parsed.data.primaryPhysician,
        schedule: parsed.data.schedule.toISOString(),
        status: "scheduled",
        cancellationReason: null,
      },
    });
    const when = formatDateTime(parsed.data.schedule).dateTime;
    const smsSent = await notify(
      row.userId,
      `Pollards Opticians: your appointment is confirmed for ${when} with ${parsed.data.primaryPhysician}. Reply or call us if you need to change it.`
    );
    revalidatePath("/admin");
    return { ok: true, data: { smsSent } };
  } catch (error) {
    console.error("scheduleAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function cancelAppointment(
  appointmentId: string,
  input: CancelAppointmentInput
): Promise<ActionResult<{ smsSent: boolean }>> {
  await requireAdmin();
  const parsed = CancelAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const row = await appwrite().tables.updateRow<AppointmentRow>({
      ...tableRef(),
      rowId: appointmentId,
      data: { status: "cancelled", cancellationReason: parsed.data.cancellationReason },
    });
    const when = formatDateTime(row.schedule).dateTime;
    const smsSent = await notify(
      row.userId,
      `Pollards Opticians: we're sorry, your appointment on ${when} has been cancelled. Reason: ${parsed.data.cancellationReason}. Please rebook online or call us.`
    );
    revalidatePath("/admin");
    return { ok: true, data: { smsSent } };
  } catch (error) {
    console.error("cancelAppointment failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
