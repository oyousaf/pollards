import { describe, expect, it } from "vitest";

import { OtpSchema, PasskeySchema, PatientSchema, UserSchema } from "@/lib/validation";

describe("UserSchema", () => {
  it("normalises name and email", () => {
    const result = UserSchema.parse({
      name: "  Jane Smith ",
      email: " Jane@Example.COM ",
      phone: "+447700900123",
    });
    expect(result).toEqual({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+447700900123",
    });
  });

  it("rejects a phone number without a country code", () => {
    const result = UserSchema.safeParse({ name: "Jane", email: "j@x.com", phone: "07700900123" });
    expect(result.success).toBe(false);
  });
});

describe("PasskeySchema", () => {
  it.each(["1234", "0000"])("accepts %s", (passkey) => {
    expect(PasskeySchema.safeParse({ passkey }).success).toBe(true);
  });

  it.each(["123", "12345", "12a4", ""])("rejects %j", (passkey) => {
    expect(PasskeySchema.safeParse({ passkey }).success).toBe(false);
  });
});

describe("OtpSchema", () => {
  it("requires exactly six digits", () => {
    expect(OtpSchema.safeParse({ code: "123456" }).success).toBe(true);
    expect(OtpSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(OtpSchema.safeParse({ code: "12345a" }).success).toBe(false);
  });
});

describe("PatientSchema", () => {
  const valid = {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+447700900123",
    birthDate: new Date("1990-05-01"),
    gender: "Female",
    address: "12 Westgate, Wakefield",
    occupation: "Teacher",
    emergencyContactName: "John Smith",
    emergencyContactNumber: "+447700900456",
    primaryPhysician: "Keith Barton",
    insuranceProvider: "NHS",
    insurancePolicyNumber: "4857773456",
    treatmentConsent: true,
    disclosureConsent: true,
    privacyConsent: true,
  };

  it("accepts a complete registration", () => {
    expect(PatientSchema.safeParse(valid).success).toBe(true);
  });

  it("requires every consent", () => {
    const result = PatientSchema.safeParse({ ...valid, privacyConsent: false });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["privacyConsent"]);
  });

  it("rejects a future date of birth", () => {
    const tomorrow = new Date(Date.now() + 864e5);
    expect(PatientSchema.safeParse({ ...valid, birthDate: tomorrow }).success).toBe(false);
  });
});
