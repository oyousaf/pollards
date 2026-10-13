"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FormField, SelectField, TextareaField } from "@/components/forms/fields";
import { SlotPicker } from "@/components/forms/slot-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Doctors } from "@/constants";
import { cancelAppointment, scheduleAppointment } from "@/lib/actions/appointment";
import { takenSlotKeys, type BookedSlot } from "@/lib/availability";
import { formatDateTime } from "@/lib/utils";
import {
  CancelAppointmentSchema,
  ScheduleAppointmentSchema,
  type ScheduleAppointmentInput,
} from "@/lib/validation";
import type { AppointmentDTO } from "@/types";

type DialogProps = {
  appointment: AppointmentDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function reportResult(result: Awaited<ReturnType<typeof scheduleAppointment>>, success: string) {
  if (!result.ok) return (toast.error(result.error), false);
  if (result.data.notified)
    toast.success(success, { description: "The patient has been notified." });
  else
    toast.warning(success, {
      description: "We couldn't email the patient — please call them.",
    });
  return true;
}

export function ScheduleDialog({
  appointment,
  open,
  onOpenChange,
  booked,
}: DialogProps & { booked: BookedSlot[] }) {
  const [pending, startTransition] = useTransition();
  const requested = new Date(appointment.schedule);
  const form = useForm<ScheduleAppointmentInput>({
    resolver: zodResolver(ScheduleAppointmentSchema),
    defaultValues: {
      primaryPhysician: appointment.primaryPhysician,
      schedule: requested > new Date() ? requested : undefined,
    },
  });
  const physician = useWatch({ control: form.control, name: "primaryPhysician" });
  // Exclude this appointment so its own current slot stays selectable.
  const taken = useMemo(
    () => takenSlotKeys(booked, physician, appointment.id),
    [booked, physician, appointment.id]
  );

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await scheduleAppointment(appointment.id, values);
      if (reportResult(result, "Appointment confirmed")) onOpenChange(false);
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm appointment</DialogTitle>
          <DialogDescription>
            {appointment.patientName} requested {formatDateTime(appointment.schedule).dateTime}.
            Adjust if needed, then confirm.
          </DialogDescription>
        </DialogHeader>
        <form id="schedule-form" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <SelectField
              control={form.control}
              name="primaryPhysician"
              label="Optometrist"
              options={Doctors.map((d) => ({ value: d.name, label: d.name }))}
            />
            <FormField control={form.control} name="schedule" label="Date and time">
              {(field, { invalid, id }) => (
                <SlotPicker
                  taken={taken}
                  id={id}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={invalid}
                />
              )}
            </FormField>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="lg">
              Close
            </Button>
          </DialogClose>
          <Button type="submit" form="schedule-form" size="lg" disabled={pending}>
            {pending && <Spinner />} Confirm &amp; notify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CancelDialog({ appointment, open, onOpenChange }: DialogProps) {
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(CancelAppointmentSchema),
    defaultValues: { cancellationReason: "" },
  });

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await cancelAppointment(appointment.id, values);
      if (reportResult(result, "Appointment cancelled")) onOpenChange(false);
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel appointment</DialogTitle>
          <DialogDescription>
            {appointment.patientName} · {formatDateTime(appointment.schedule).dateTime}. The patient
            will be notified with your reason.
          </DialogDescription>
        </DialogHeader>
        <form id="cancel-form" onSubmit={onSubmit} noValidate>
          <TextareaField
            control={form.control}
            name="cancellationReason"
            label="Reason"
            placeholder="e.g. Optometrist unavailable — please rebook"
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="lg">
              Keep appointment
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="cancel-form"
            variant="destructive"
            size="lg"
            disabled={pending}
          >
            {pending && <Spinner />} Cancel &amp; notify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
