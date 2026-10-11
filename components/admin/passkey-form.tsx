"use client";

import { LockKeyholeIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { adminLogin } from "@/lib/actions/admin";

export function PasskeyForm() {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (value = passkey) => {
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await adminLogin({ passkey: value });
      if (result && !result.ok) {
        setError(result.error);
        setPasskey("");
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      <Field data-invalid={!!error} className="items-center">
        <FieldLabel htmlFor="passkey" className="sr-only">
          Passkey
        </FieldLabel>
        <InputOTP
          id="passkey"
          maxLength={4}
          value={passkey}
          onChange={setPasskey}
          onComplete={submit}
          autoFocus
          inputMode="numeric"
          pattern="^[0-9]+$"
          aria-invalid={!!error}
          containerClassName="justify-center"
        >
          <InputOTPGroup className="gap-3 *:data-[slot=input-otp-slot]:size-14 *:data-[slot=input-otp-slot]:rounded-xl *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && <FieldError className="text-center">{error}</FieldError>}
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={pending || passkey.length < 4}
        className="h-11 w-full rounded-xl"
      >
        {pending ? <Spinner /> : <LockKeyholeIcon data-icon="inline-start" />}
        {pending ? "Checking…" : "Unlock dashboard"}
      </Button>
    </form>
  );
}
