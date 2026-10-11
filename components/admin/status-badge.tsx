import { CircleCheckIcon, CircleXIcon, HourglassIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Status } from "@/types";

export const statusMeta = {
  scheduled: {
    label: "Scheduled",
    icon: CircleCheckIcon,
    className: "bg-success-soft text-success",
  },
  pending: { label: "Pending", icon: HourglassIcon, className: "bg-warning-soft text-warning" },
  cancelled: { label: "Cancelled", icon: CircleXIcon, className: "bg-danger-soft text-danger" },
} satisfies Record<Status, { label: string; icon: React.ElementType; className: string }>;

export function StatusBadge({ status }: { status: Status }) {
  const { label, icon: Icon, className } = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
