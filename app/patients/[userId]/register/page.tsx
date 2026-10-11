import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { PageIntro, PatientShell } from "@/components/patient-shell";
import { findPatient, getUser } from "@/lib/data";
import { requirePatient } from "@/lib/session";

export const metadata: Metadata = { title: "Register", robots: { index: false } };

export default async function RegisterPage({ params }: PageProps<"/patients/[userId]/register">) {
  const { userId } = await params;
  await requirePatient(userId);

  const [user, patient] = await Promise.all([getUser(userId), findPatient(userId)]);
  if (!user) redirect("/");
  if (patient) redirect(`/patients/${userId}/new-appointment`);

  return (
    <PatientShell width="lg">
      <PageIntro
        eyebrow="New patient"
        title={<>Welcome, {user.name.split(" ")[0]} 👋</>}
        description="A few details so we can look after your eyes properly. It takes about two minutes."
      />
      <RegisterForm user={user} />
    </PatientShell>
  );
}
