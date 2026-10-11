"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { GenderOptions, IdentificationTypes } from "@/constants";
import { registerPatient } from "@/lib/actions/patient";
import { cn } from "@/lib/utils";
import { PatientFormSchema, type PatientFormInput } from "@/lib/validation";
import type { PublicUser } from "@/types";

import { DoctorPicker } from "./doctor-picker";
import {
  CheckboxField,
  DateField,
  FormField,
  PhoneField,
  SelectField,
  TextareaField,
  TextField,
} from "./fields";
import { FileUploader } from "./file-uploader";

const STEPS: { title: string; description: string; fields: FieldPath<PatientFormInput>[] }[] = [
  {
    title: "About you",
    description: "Your contact details and a few basics.",
    fields: ["name", "email", "phone", "birthDate", "gender", "address", "occupation"],
  },
  {
    title: "Health",
    description: "Helps your optometrist prepare for your visit.",
    fields: [
      "emergencyContactName",
      "emergencyContactNumber",
      "primaryPhysician",
      "insuranceProvider",
      "insurancePolicyNumber",
      "allergies",
      "currentMedication",
      "familyMedicalHistory",
      "pastMedicalHistory",
    ],
  },
  {
    title: "Identification",
    description: "Optional, but speeds up your first visit.",
    fields: ["identificationType", "identificationNumber", "identificationDocument"],
  },
  {
    title: "Consent",
    description: "Please review and confirm.",
    fields: ["treatmentConsent", "disclosureConsent", "privacyConsent"],
  },
];

const row = "grid gap-5 sm:grid-cols-2";

export function RegisterForm({ user }: { user: PublicUser }) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    resolver: zodResolver(PatientFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: "",
      occupation: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      primaryPhysician: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      allergies: "",
      currentMedication: "",
      familyMedicalHistory: "",
      pastMedicalHistory: "",
      identificationType: "Passport",
      identificationNumber: "",
      identificationDocument: [],
      treatmentConsent: false,
      disclosureConsent: false,
      privacyConsent: false,
    },
  });

  const isLast = step === STEPS.length - 1;

  const goTo = (next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = async () => {
    const valid = await form.trigger(STEPS[step].fields, { shouldFocus: true });
    if (valid) goTo(step + 1);
  };

  const onSubmit = () =>
    form.handleSubmit(
      ({ identificationDocument, ...values }) =>
        startTransition(async () => {
          const data = new FormData();
          data.set("data", JSON.stringify(values));
          if (identificationDocument?.[0])
            data.set("identificationDocument", identificationDocument[0]);
          const result = await registerPatient(data);
          if (result && !result.ok) toast.error(result.error);
        }),
      (errors) => {
        // Jump back to the first step containing an error.
        const index = STEPS.findIndex((s) => s.fields.some((f) => f in errors));
        if (index >= 0 && index !== step) goTo(index);
      }
    )();

  return (
    <div ref={topRef} className="scroll-mt-6">
      <Stepper step={step} onStepClick={(i) => i < step && goTo(i)} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) onSubmit();
          else next();
        }}
        noValidate
        className="mt-8"
      >
        <div key={step} className="animate-fade-up">
          <div className="mb-6">
            <h2 className="font-display text-3xl tracking-tight">{STEPS[step].title}</h2>
            <p className="text-muted-foreground">{STEPS[step].description}</p>
          </div>

          {step === 0 && (
            <FieldGroup>
              <TextField
                control={form.control}
                name="name"
                label="Full name"
                autoComplete="name"
                icon={<UserIcon />}
              />
              <div className={row}>
                <TextField
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  icon={<MailIcon />}
                />
                <PhoneField control={form.control} name="phone" label="Mobile number" />
              </div>
              <div className={row}>
                <DateField control={form.control} name="birthDate" label="Date of birth" />
                <FormField control={form.control} name="gender" label="Gender">
                  {(field, { invalid, id }) => (
                    <RadioGroup
                      id={id}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      aria-invalid={invalid}
                      className="grid h-11 grid-cols-3 gap-2"
                    >
                      {GenderOptions.map((option) => (
                        <FieldLabel
                          key={option}
                          htmlFor={`gender-${option}`}
                          className="rounded-lg!"
                        >
                          <Field
                            orientation="horizontal"
                            className="h-full justify-center gap-2 py-0! *:w-auto!"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`gender-${option}`}
                              className="sr-only"
                            />
                            <span className="text-sm">{option}</span>
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  )}
                </FormField>
              </div>
              <TextField
                control={form.control}
                name="address"
                label="Home address"
                placeholder="12 Westgate, Wakefield WF1 1XX"
                autoComplete="street-address"
              />
              <TextField
                control={form.control}
                name="occupation"
                label="Occupation"
                placeholder="e.g. Teacher"
                autoComplete="organization-title"
                description="Some occupations affect which lenses we recommend."
              />
            </FieldGroup>
          )}

          {step === 1 && (
            <FieldGroup>
              <div className={row}>
                <TextField
                  control={form.control}
                  name="emergencyContactName"
                  label="Emergency contact"
                  placeholder="Their full name"
                />
                <PhoneField
                  control={form.control}
                  name="emergencyContactNumber"
                  label="Their phone number"
                />
              </div>
              <FormField
                control={form.control}
                name="primaryPhysician"
                label="Preferred optometrist"
              >
                {(field, { invalid, id }) => (
                  <DoctorPicker
                    id={id}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={invalid}
                  />
                )}
              </FormField>
              <div className={row}>
                <TextField
                  control={form.control}
                  name="insuranceProvider"
                  label="Healthcare provider"
                  placeholder="NHS, Bupa, Vision Express…"
                />
                <TextField
                  control={form.control}
                  name="insurancePolicyNumber"
                  label="NHS or policy number"
                  placeholder="485 777 3456"
                />
              </div>
              <div className={row}>
                <TextareaField
                  control={form.control}
                  name="allergies"
                  label="Allergies"
                  placeholder="e.g. Penicillin, pollen"
                />
                <TextareaField
                  control={form.control}
                  name="currentMedication"
                  label="Current medication"
                  placeholder="e.g. Levothyroxine 50mcg"
                />
              </div>
              <div className={row}>
                <TextareaField
                  control={form.control}
                  name="familyMedicalHistory"
                  label="Family eye history"
                  placeholder="e.g. Mother has glaucoma"
                />
                <TextareaField
                  control={form.control}
                  name="pastMedicalHistory"
                  label="Your medical history"
                  placeholder="e.g. Type 2 diabetes"
                />
              </div>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <div className={row}>
                <SelectField
                  control={form.control}
                  name="identificationType"
                  label="Document type"
                  options={IdentificationTypes.map((t) => ({ value: t, label: t }))}
                />
                <TextField
                  control={form.control}
                  name="identificationNumber"
                  label="Document number"
                  placeholder="123456789"
                />
              </div>
              <FormField
                control={form.control}
                name="identificationDocument"
                label="Scan or photo of document"
              >
                {(field, { invalid, id }) => (
                  <FileUploader
                    id={id}
                    files={field.value}
                    onChange={field.onChange}
                    invalid={invalid}
                  />
                )}
              </FormField>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LockIcon className="size-4" aria-hidden />
                Stored securely and only visible to Pollards staff.
              </p>
            </FieldGroup>
          )}

          {step === 3 && (
            <FieldSet>
              <FieldLegend className="sr-only">Consent and privacy</FieldLegend>
              <FieldGroup className="gap-4 rounded-2xl border bg-card p-5">
                <CheckboxField
                  control={form.control}
                  name="treatmentConsent"
                  label="I consent to receive eye care and treatment from Pollards Opticians."
                />
                <CheckboxField
                  control={form.control}
                  name="disclosureConsent"
                  label="I consent to my health information being used and shared for my treatment."
                />
                <CheckboxField
                  control={form.control}
                  name="privacyConsent"
                  label="I have read and agree to the privacy policy."
                />
              </FieldGroup>
            </FieldSet>
          )}
        </div>

        <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-3 border-t bg-background/85 py-4 backdrop-blur">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || pending}
            className={cn("h-11", step === 0 && "invisible")}
          >
            <ArrowLeftIcon data-icon="inline-start" /> Back
          </Button>
          <Button type="submit" size="lg" disabled={pending} className="h-11 min-w-36 rounded-xl">
            {pending && <Spinner />}
            {isLast ? (pending ? "Saving…" : "Complete registration") : "Continue"}
            {!isLast && <ArrowRightIcon data-icon="inline-end" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Stepper({ step, onStepClick }: { step: number; onStepClick: (index: number) => void }) {
  return (
    <nav aria-label="Registration progress">
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => onStepClick(i)}
                disabled={!done}
                aria-current={current ? "step" : undefined}
                className="group w-full text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full bg-muted transition-colors duration-500",
                    (done || current) && "bg-primary"
                  )}
                />
                <span
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm",
                    current && "text-foreground",
                    done && "group-hover:text-foreground"
                  )}
                >
                  {done && <CheckIcon className="size-3.5 text-brand" aria-hidden />}
                  <span className="truncate">{s.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
