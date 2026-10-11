import { CalendarPlusIcon, CheckIcon, Clock3Icon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PatientShell } from "@/components/patient-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SLOT_MINUTES, doctorByName } from "@/constants";
import { getPatientAppointment } from "@/lib/data";
import { requirePatient } from "@/lib/session";
import { formatDateTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Request received", robots: { index: false } };

function icsHref(start: Date, physician: string) {
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pollards Opticians//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-${physician.replace(/\W/g, "")}@pollards.info`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Eye appointment (awaiting confirmation) – Pollards Opticians`,
    `DESCRIPTION:With ${physician}. We'll text you to confirm.`,
    "LOCATION:Pollards Opticians\, Wakefield",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export default async function SuccessPage({
  params,
  searchParams,
}: PageProps<"/patients/[userId]/new-appointment/success">) {
  const { userId } = await params;
  const { appointmentId } = await searchParams;
  await requirePatient(userId);

  const appointment =
    typeof appointmentId === "string" ? await getPatientAppointment(appointmentId, userId) : null;
  if (!appointment) redirect(`/patients/${userId}/new-appointment`);

  const doctor = doctorByName(appointment.primaryPhysician);
  const when = formatDateTime(appointment.schedule);

  return (
    <PatientShell>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8 grid size-20 animate-pop place-items-center rounded-full bg-success-soft text-success">
          <span className="absolute inset-0 animate-ping rounded-full bg-success/20 [animation-iteration-count:2]" />
          <CheckIcon className="size-9" strokeWidth={2.5} aria-hidden />
        </div>
        <h1 className="animate-fade-up font-display text-4xl tracking-tight sm:text-5xl">
          Request <em className="text-brand">received</em>
        </h1>
        <p className="mt-3 max-w-md animate-fade-up text-pretty text-muted-foreground [animation-delay:80ms]">
          Thanks, we&apos;ll check availability and text you to confirm shortly.
        </p>
      </div>

      <div className="mt-10 animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-sm [animation-delay:160ms]">
        <div className="flex items-center gap-4 p-5">
          <Avatar className="size-12">
            <AvatarImage src={doctor?.image} alt="" />
            <AvatarFallback>{initials(appointment.primaryPhysician)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Your optometrist</p>
            <p className="truncate font-medium">{appointment.primaryPhysician}</p>
          </div>
        </div>
        <dl className="grid gap-4 border-t bg-muted/40 p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium">{when.dateOnly}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              <Clock3Icon className="size-4 text-muted-foreground" aria-hidden />
              {when.timeOnly}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="font-medium">{appointment.reason}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid animate-fade-up gap-3 [animation-delay:240ms] sm:grid-cols-2">
        <Button asChild variant="outline" size="lg" className="h-11 rounded-xl">
          <a
            href={icsHref(new Date(appointment.schedule), appointment.primaryPhysician)}
            download="pollards-appointment.ics"
          >
            <CalendarPlusIcon data-icon="inline-start" /> Add to calendar
          </a>
        </Button>
        <Button asChild size="lg" className="h-11 rounded-xl">
          <Link href={`/patients/${userId}/new-appointment`}>
            <PlusIcon data-icon="inline-start" /> Book another
          </Link>
        </Button>
      </div>
    </PatientShell>
  );
}
