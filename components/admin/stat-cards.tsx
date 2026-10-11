import { CalendarDaysIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getAppointmentStats } from "@/lib/data";
import { cn } from "@/lib/utils";

import { statusMeta } from "./status-badge";

const tile = "relative overflow-hidden rounded-2xl border bg-card p-5";

export async function StatCards() {
  const stats = await getAppointmentStats();
  const items = [
    {
      label: "All appointments",
      value: stats.total,
      icon: CalendarDaysIcon,
      tone: "bg-primary/10 text-brand",
    },
    {
      label: "Pending review",
      value: stats.pending,
      icon: statusMeta.pending.icon,
      tone: statusMeta.pending.className,
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: statusMeta.scheduled.icon,
      tone: statusMeta.scheduled.className,
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: statusMeta.cancelled.icon,
      tone: statusMeta.cancelled.className,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }, i) => (
        <div
          key={label}
          className={cn(tile, "animate-fade-up")}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className={cn("mb-4 grid size-9 place-items-center rounded-xl", tone)}>
            <Icon className="size-4.5" aria-hidden />
          </span>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {value.toLocaleString("en-GB")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={tile}>
          <Skeleton className="mb-4 size-9 rounded-xl" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}
