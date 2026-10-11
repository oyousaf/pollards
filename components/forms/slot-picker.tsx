"use client";

import { enGB } from "date-fns/locale";
import { CalendarX2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { slotKey } from "@/lib/availability";
import { bookingWindow, isClosedDay, londonParts, slotsForDay } from "@/lib/slots";
import { cn, formatDateTime } from "@/lib/utils";

const dayFromInstant = (date: Date) => {
  const p = londonParts(date);
  return new Date(p.year, p.month, p.day);
};

/**
 * Calendar + time-slot grid. Emits the exact UTC instant of the chosen London slot.
 * Slots in `taken` (see lib/availability) are shown greyed out and can't be picked.
 */
export function SlotPicker({
  id,
  value,
  onChange,
  invalid,
  taken,
  className,
}: {
  id?: string;
  value?: Date;
  onChange: (value: Date | undefined) => void;
  invalid?: boolean;
  taken?: ReadonlySet<number>;
  className?: string;
}) {
  const { start, end } = useMemo(() => bookingWindow(), []);
  const [day, setDay] = useState<Date | undefined>(() =>
    value ? dayFromInstant(value) : undefined
  );
  const slots = useMemo(() => (day ? slotsForDay(day) : []), [day]);
  const isTaken = (slot: Date) => taken?.has(slotKey(slot)) ?? false;
  const anyTaken = slots.some(isTaken);
  const allTaken = slots.length > 0 && slots.every(isTaken);

  return (
    <div
      id={id}
      aria-invalid={invalid}
      className={cn(
        "grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[auto_1fr]",
        invalid && "border-destructive",
        className
      )}
    >
      <Calendar
        mode="single"
        locale={enGB}
        weekStartsOn={1}
        selected={day}
        onSelect={(d) => {
          setDay(d);
          onChange(undefined);
        }}
        startMonth={start}
        endMonth={end}
        disabled={[{ before: start }, { after: end }, isClosedDay]}
        className="mx-auto bg-transparent p-3 [--cell-size:--spacing(9)]"
      />

      <div className="border-t p-4 sm:border-t-0 sm:border-l">
        {!day ? (
          <EmptySlots text="Choose a day to see available times." />
        ) : slots.length === 0 || allTaken ? (
          <EmptySlots
            text={
              allTaken
                ? "Fully booked on this day. Please pick another."
                : "No times left on this day. Please pick another."
            }
          />
        ) : (
          <>
            <p className="mb-3 text-sm font-medium">{formatDateTime(slots[0]).dateOnly}</p>
            <ToggleGroup
              type="single"
              spacing={2}
              value={value?.toISOString() ?? ""}
              onValueChange={(iso) => onChange(iso ? new Date(iso) : undefined)}
              aria-label="Available times"
              className="grid! w-full grid-cols-3 gap-2 lg:grid-cols-4"
            >
              {slots.map((slot) => {
                const time = formatDateTime(slot).timeOnly;
                const booked = isTaken(slot);
                return (
                  <ToggleGroupItem
                    key={slot.toISOString()}
                    value={slot.toISOString()}
                    variant="outline"
                    disabled={booked}
                    aria-label={booked ? `${time}, already booked` : time}
                    title={booked ? "Already booked" : undefined}
                    className="h-10 w-full rounded-lg! tabular-nums disabled:bg-muted disabled:line-through disabled:opacity-60 data-[state=on]:border-primary data-[state=on]:bg-primary! data-[state=on]:text-primary-foreground!"
                  >
                    {time}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {anyTaken && (
              <p className="mt-3 text-xs text-muted-foreground">
                Greyed-out times are already booked with this clinician.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptySlots({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <CalendarX2Icon className="size-6" aria-hidden />
      {text}
    </div>
  );
}
