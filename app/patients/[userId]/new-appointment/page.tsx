import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppointmentForm } from "@/components/forms/appointment-form";
import { PageIntro, PatientShell } from "@/components/patient-shell";
import { findPatient, getBookedSlots } from "@/lib/data";
import { requirePatient } from "@/lib/session";

export const metadata: Metadata = { title: "Book an appointment", robots: { index: false } };

export default async function NewAppointmentPage({
  params,
}: PageProps<"/patients/[userId]/new-appointment">) {
  const { userId } = await params;
  await requirePatient(userId);

  const [patient, booked] = await Promise.all([findPatient(userId), getBookedSlots()]);
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <PatientShell width="lg">
      <PageIntro
        eyebrow="Book an appointment"
        title={<>Hi {patient.name.split(" ")[0]}, when suits you?</>}
        description="Pick your optometrist and a time. We'll let you know as soon as it's confirmed."
      />
      <AppointmentForm defaultPhysician={patient.primaryPhysician ?? undefined} booked={booked} />
    </PatientShell>
  );
}
