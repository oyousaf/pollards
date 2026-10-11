import { LogOutIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AppointmentsTable } from "@/components/admin/appointments-table";
import { StatCards, StatCardsSkeleton } from "@/components/admin/stat-cards";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminLogout } from "@/lib/actions/admin";
import { getBookedSlots, listRecentAppointments } from "@/lib/data";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

async function RecentAppointments() {
  const [data, booked] = await Promise.all([listRecentAppointments(), getBookedSlots()]);
  return <AppointmentsTable data={data} booked={booked} />;
}

export default async function AdminPage() {
  await requireAdmin();

  const greeting = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(new Date());

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={adminLogout}>
              <Button type="submit" variant="ghost" size="lg">
                <LogOutIcon data-icon="inline-start" /> Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="animate-fade-up">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-4xl tracking-tight">Appointments</h1>
        </div>

        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-2xl" />}>
          <RecentAppointments />
        </Suspense>
      </main>
    </div>
  );
}
