"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Doctors } from "@/constants";
import { initials } from "@/lib/utils";

/** Selectable optometrist cards (keyboard-navigable radio group). */
export function DoctorPicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  return (
    <RadioGroup
      id={id}
      value={value ?? ""}
      onValueChange={onChange}
      aria-invalid={invalid}
      className="grid-cols-1 sm:grid-cols-2"
    >
      {Doctors.map((doctor) => {
        const itemId = `doctor-${doctor.name.replace(/\W+/g, "-")}`;
        return (
          <FieldLabel key={doctor.name} htmlFor={itemId} className="rounded-xl!">
            <Field orientation="horizontal" className="items-center! gap-3">
              <Avatar className="size-9">
                <AvatarImage src={doctor.image} alt="" />
                <AvatarFallback>{initials(doctor.name)}</AvatarFallback>
              </Avatar>
              <FieldTitle className="flex-1 truncate">{doctor.name}</FieldTitle>
              <RadioGroupItem value={doctor.name} id={itemId} aria-label={doctor.name} />
            </Field>
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
}
