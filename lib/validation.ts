import { z } from "zod";

import { GenderOptions } from "@/constants";

// Shared by client forms (via zodResolver) and server actions (re-validation).

const name = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(60, "Please keep this under 60 characters");

// Trim/lowercase first: z.email() validates before its own transforms run.
const emailField = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const phone = z.e164("Enter a valid phone number, including country code");

export const UserSchema = z.object({
  name,
  email: emailField,
  phone,
});
export type UserInput = z.infer<typeof UserSchema>;

const consent = (message: string) => z.boolean().refine((value) => value === true, { message });

export const PatientSchema = z.object({
  name,
  email: emailField,
  phone,
  birthDate: z
    .date({ error: "Please choose your date of birth" })
    .max(new Date(), "Date of birth can't be in the future"),
  gender: z.enum(GenderOptions, { error: "Please choose one" }),
  address: z.string().trim().min(5, "Please enter your full address").max(500),
  occupation: z.string().trim().min(2, "Please enter your occupation").max(100),
  emergencyContactName: name,
  emergencyContactNumber: phone,
  primaryPhysician: z.string().min(2, "Please choose an optometrist"),
  insuranceProvider: z.string().trim().min(2, "Enter your provider, or NHS").max(60),
  insurancePolicyNumber: z.string().trim().min(2, "Enter your policy or NHS number").max(60),
  allergies: z.string().trim().max(1000).optional(),
  currentMedication: z.string().trim().max(1000).optional(),
  familyMedicalHistory: z.string().trim().max(1000).optional(),
  pastMedicalHistory: z.string().trim().max(1000).optional(),
  identificationType: z.string().optional(),
  identificationNumber: z.string().trim().max(60).optional(),
  treatmentConsent: consent("You must consent to treatment to continue"),
  disclosureConsent: consent("You must consent to disclosure to continue"),
  privacyConsent: consent("You must accept the privacy policy to continue"),
});
export type PatientInput = z.infer<typeof PatientSchema>;

export const PatientFormSchema = PatientSchema.extend({
  identificationDocument: z.array(z.instanceof(File)).max(1).optional(),
});
export type PatientFormInput = z.infer<typeof PatientFormSchema>;

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Please choose an optometrist"),
  schedule: z.date({ error: "Please choose a date and time" }),
  reason: z
    .string()
    .trim()
    .min(2, "Tell us briefly why you're booking")
    .max(500, "Please keep this under 500 characters"),
  note: z.string().trim().max(500).optional(),
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Please choose an optometrist"),
  schedule: z.date({ error: "Please choose a date and time" }),
});
export type ScheduleAppointmentInput = z.infer<typeof ScheduleAppointmentSchema>;

export const CancelAppointmentSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(2, "Please give a short reason")
    .max(500, "Please keep this under 500 characters"),
});
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;

export const PasskeySchema = z.object({
  passkey: z.string().regex(/^\d{4}$/, "Enter the 4-digit passcode"),
});

export const OtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});
