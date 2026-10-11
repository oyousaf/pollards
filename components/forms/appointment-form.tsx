"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CalendarClockIcon } from "lucide-react";
import { useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AppointmentReasons } from "@/constants";
import { createAppointment } from "@/lib/actions/appointment";
import { slotKey, takenSlotKeys, type BookedSlot } from "@/lib/availability";
import { formatDateTime } from "@/lib/utils";
import { CreateAppointmentSchema } from "@/lib/validation";

import { DoctorPicker } from "./doctor-picker";
import { FormField, TextareaField } from "./fields";
import { SlotPicker } from "./slot-picker";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${n}`} className="space-y-4">
      <h2
        id={`section-${n}`}
        className="flex items-center gap-3 text-lg font-semibold tracking-tight"
      >
        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-sm text-brand">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AppointmentForm({
  defaultPhysician,
  booked,
}: {
  defaultPhysician?: string;
  booked: BookedSlot[];
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(CreateAppointmentSchema),
    defaultValues: { primaryPhysician: defaultPhysician ?? "", reason: "", note: "" },
  });
  const [schedule, physician] = useWatch({
    control: form.control,
    name: ["schedule", "primaryPhysician"],
  });
  const taken = useMemo(() => takenSlotKeys(booked, physician), [booked, physician]);

  // Switching clinician can make the chosen time unavailable — clear it rather than submit a clash.
  const changePhysician = (name: string) => {
    form.setValue("primaryPhysician", name, { shouldValidate: true });
    const current = form.getValues("schedule");
    if (current && takenSlotKeys(booked, name).has(slotKey(current))) {
      form.resetField("schedule");
      toast.info("That time isn't available with this clinician — please pick another.");
    }
  };

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await createAppointment(values);
      if (result && !result.ok) toast.error(result.error);
    })
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="animate-fade-up space-y-10 [animation-delay:80ms]"
    >
      <Section n={1} title="Choose your optometrist">
        <FormField control={form.control} name="primaryPhysician">
          {(field, { invalid, id }) => (
            <DoctorPicker
              id={id}
              value={field.value}
              onChange={changePhysician}
              invalid={invalid}
            />
          )}
        </FormField>
      </Section>

      <Section n={2} title="Pick a date and time">
        <FormField control={form.control} name="schedule">
          {(field, { invalid, id }) => (
            <SlotPicker
              id={id}
              value={field.value}
              onChange={field.onChange}
              invalid={invalid}
              taken={taken}
            />
          )}
        </FormField>
      </Section>

      <Section n={3} title="Tell us why you're visiting">
        <FieldGroup>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Common reasons">
            {AppointmentReasons.map((reason) => (
              <Badge
                key={reason}
                asChild
                variant="outline"
                className="h-8 cursor-pointer px-3 text-sm hover:bg-muted"
              >
                <button
                  type="button"
                  onClick={() => form.setValue("reason", reason, { shouldValidate: true })}
                >
                  {reason}
                </button>
              </Badge>
            ))}
          </div>
          <TextareaField
            control={form.control}
            name="reason"
            label="Reason for appointment"
            placeholder="e.g. Annual eye test, blurry vision when reading"
          />
          <TextareaField
            control={form.control}
            name="note"
            label="Anything else? (optional)"
            placeholder="e.g. I prefer afternoons, or I need step-free access"
            rows={2}
          />
        </FieldGroup>
      </Section>

      <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border bg-popover/90 p-3 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:pl-5">
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <CalendarClockIcon className="size-4 shrink-0" aria-hidden />
          {schedule ? (
            <span>
              <span className="font-medium text-foreground">
                {formatDateTime(schedule).dateTime}
              </span>
              {physician && <> · {physician}</>}
            </span>
          ) : (
            "No time selected yet"
          )}
        </p>
        <Button type="submit" size="lg" disabled={pending} className="h-11 rounded-xl px-5">
          {pending && <Spinner />}
          {pending ? "Booking…" : "Request appointment"}
          {!pending && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
      </div>
    </form>
  );
}
