"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, MailCheckIcon, MailIcon, UserIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { resendCode, startBooking, verifyCode } from "@/lib/actions/patient";
import { UserSchema } from "@/lib/validation";

import { PhoneField, TextField } from "./fields";

const RESEND_SECONDS = 30;

/** Step 1 of the patient journey: details, then a one-time code sent by email. */
export function PatientForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return sentTo ? (
    <CodeStep email={sentTo} onBack={() => setSentTo(null)} />
  ) : (
    <DetailsStep onSent={setSentTo} />
  );
}

function DetailsStep({ onSent }: { onSent: (maskedEmail: string) => void }) {
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await startBooking(values);
      if (result.ok) onSent(result.data.email);
      else toast.error(result.error);
    })
  );

  return (
    <form onSubmit={onSubmit} noValidate className="animate-fade-up [animation-delay:80ms]">
      <FieldGroup>
        <TextField
          control={form.control}
          name="name"
          label="Full name"
          placeholder="Jane Smith"
          autoComplete="name"
          icon={<UserIcon />}
        />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          inputMode="email"
          icon={<MailIcon />}
          description="We'll email you a 6-digit code to confirm it's you."
        />
        <PhoneField
          control={form.control}
          name="phone"
          label="Mobile number"
          placeholder="07700 900123"
          description="We'll only use this about your appointments."
        />
        <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-xl text-base">
          {pending && <Spinner />}
          {pending ? "Sending code…" : "Get started"}
          {!pending && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
      </FieldGroup>
    </form>
  );
}

function CodeStep({ email, onBack }: { email: string; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [pending, startTransition] = useTransition();
  const [resending, startResend] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = (value = code) => {
    if (pending || value.length < 6) return;
    startTransition(async () => {
      setError(null);
      const result = await verifyCode({ code: value });
      if (result && !result.ok) {
        setError(result.error);
        setCode("");
      }
    });
  };

  const resend = () =>
    startResend(async () => {
      const result = await resendCode();
      if (result.ok) {
        toast.success("New code sent", { description: `Check ${email}` });
        setCooldown(RESEND_SECONDS);
        setError(null);
      } else toast.error(result.error);
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      className="animate-fade-up space-y-6"
    >
      <div className="flex items-start gap-4 rounded-2xl border bg-card p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <MailCheckIcon className="size-5" aria-hidden />
        </span>
        <div className="text-sm">
          <p className="font-medium">Check your inbox</p>
          <p className="text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            It expires in 15 minutes.
          </p>
        </div>
      </div>

      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="otp-code">Verification code</FieldLabel>
        <InputOTP
          id="otp-code"
          maxLength={6}
          value={code}
          onChange={setCode}
          onComplete={verify}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="^[0-9]+$"
          aria-invalid={!!error}
        >
          <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-lg">
            {[0, 1, 2].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-lg">
            {[3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && <FieldError>{error}</FieldError>}
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={pending || code.length < 6}
        className="h-12 w-full rounded-xl text-base"
      >
        {pending && <Spinner />}
        {pending ? "Verifying…" : "Verify and continue"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
          <ArrowLeftIcon data-icon="inline-start" /> Change details
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="tabular-nums"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
        </Button>
      </div>
    </form>
  );
}
