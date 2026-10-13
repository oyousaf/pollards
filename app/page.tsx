import { CalendarCheckIcon, Clock3Icon, MailCheckIcon } from "lucide-react";
import Link from "next/link";

import { PatientForm } from "@/components/forms/patient-form";
import { PageIntro, PatientShell } from "@/components/patient-shell";

const perks = [
  { icon: Clock3Icon, label: "Book in under a minute" },
  { icon: CalendarCheckIcon, label: "Choose your optometrist" },
  { icon: MailCheckIcon, label: "Email confirmation" },
];

export default function Home() {
  return (
    <PatientShell
      footer={
        <Link href="/admin" className="underline-offset-4 hover:text-foreground hover:underline">
          Staff login
        </Link>
      }
    >
      <PageIntro
        title={
          <>
            Visionaries see <em className="text-brand">beyond</em> the boundaries of eyesight.
          </>
        }
        description="Eye examinations, contact lens fittings and specialist keratoconus care. Tell us who you are and we'll get you booked in."
      />

      <PatientForm />

      <ul className="mt-8 grid animate-fade-up gap-3 text-sm text-muted-foreground [animation-delay:160ms] sm:grid-cols-3">
        {perks.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </PatientShell>
  );
}
