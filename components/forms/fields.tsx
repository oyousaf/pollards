"use client";

import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import PhoneInput from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

/** Wraps a react-hook-form Controller in an accessible shadcn Field with label + error. */
export function FormField<T extends FieldValues, TName extends FieldPath<T> = FieldPath<T>>({
  control,
  name,
  label,
  description,
  className,
  children,
}: Omit<BaseProps<T>, "name"> & {
  name: TName;
  children: (
    field: ControllerRenderProps<T, TName>,
    state: { invalid: boolean; id: string }
  ) => React.ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${name}`;
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            {children(field, { invalid: fieldState.invalid, id })}
            {description && !fieldState.invalid && (
              <FieldDescription>{description}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

const control = "h-11 rounded-lg md:text-sm";

export function TextField<T extends FieldValues>({
  icon,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  readOnly,
  ...props
}: BaseProps<T> & {
  icon?: React.ReactNode;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  readOnly?: boolean;
}) {
  return (
    <FormField {...props}>
      {(field, { invalid, id }) =>
        icon ? (
          <InputGroup className="h-11">
            <InputGroupAddon>{icon}</InputGroupAddon>
            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={id}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              inputMode={inputMode}
              readOnly={readOnly}
              aria-invalid={invalid}
            />
          </InputGroup>
        ) : (
          <Input
            {...field}
            value={field.value ?? ""}
            id={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            readOnly={readOnly}
            aria-invalid={invalid}
            className={control}
          />
        )
      }
    </FormField>
  );
}

export function TextareaField<T extends FieldValues>({
  placeholder,
  rows = 3,
  ...props
}: BaseProps<T> & { placeholder?: string; rows?: number }) {
  return (
    <FormField {...props}>
      {(field, { invalid, id }) => (
        <Textarea
          {...field}
          value={field.value ?? ""}
          id={id}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={invalid}
          className="min-h-24 resize-y rounded-lg md:text-sm"
        />
      )}
    </FormField>
  );
}

export function PhoneField<T extends FieldValues>({
  placeholder,
  ...props
}: BaseProps<T> & { placeholder?: string }) {
  return (
    <FormField {...props}>
      {(field, { invalid, id }) => (
        <PhoneInput
          id={id}
          name={field.name}
          defaultCountry="GB"
          international
          countryCallingCodeEditable={false}
          placeholder={placeholder}
          value={field.value || undefined}
          onChange={(value) => field.onChange(value ?? "")}
          onBlur={field.onBlur}
          autoComplete="tel"
          aria-invalid={invalid}
        />
      )}
    </FormField>
  );
}

export function SelectField<T extends FieldValues>({
  placeholder,
  options,
  ...props
}: BaseProps<T> & {
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: React.ReactNode }>;
}) {
  return (
    <FormField {...props}>
      {(field, { invalid, id }) => (
        <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
          <SelectTrigger id={id} aria-invalid={invalid} className="h-11! w-full rounded-lg">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}

export function CheckboxField<T extends FieldValues>({
  control: formControl,
  name,
  label,
  description,
}: BaseProps<T>) {
  return (
    <Controller
      control={formControl}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
          <Checkbox
            id={`field-${name}`}
            name={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-invalid={fieldState.invalid}
            className="size-5"
          />
          <FieldContent>
            <FieldLabel htmlFor={`field-${name}`} className="font-normal">
              {label}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}

/** Date-of-birth style picker: popover calendar with month/year dropdowns. */
export function DateField<T extends FieldValues>({
  placeholder = "Pick a date",
  fromYear = 1920,
  ...props
}: BaseProps<T> & { placeholder?: string; fromYear?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FormField {...props}>
      {(field, { invalid, id }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              aria-invalid={invalid}
              className={cn(
                "h-11 w-full justify-start rounded-lg px-3 font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="text-muted-foreground" />
              {field.value ? format(field.value, "d MMMM yyyy", { locale: enGB }) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={enGB}
              captionLayout="dropdown"
              selected={field.value}
              defaultMonth={field.value ?? new Date(1990, 0)}
              startMonth={new Date(fromYear, 0)}
              endMonth={new Date()}
              disabled={{ after: new Date() }}
              onSelect={(date) => {
                field.onChange(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </FormField>
  );
}
