"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pollards-analytics-consent";
type Consent = "granted" | "denied" | null;

/**
 * Google Analytics only loads after explicit opt-in (UK GDPR / PECR).
 * Set NEXT_PUBLIC_GA_ID to enable.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState<Consent>("denied");

  useEffect(() => {
    // Read persisted choice after hydration to avoid an SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent((localStorage.getItem(STORAGE_KEY) as Consent) ?? null);
  }, []);

  if (!gaId) return null;

  const choose = (value: Exclude<Consent, null>) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  if (consent === "granted") return <GoogleAnalytics gaId={gaId} />;
  if (consent === "denied") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg animate-fade-up rounded-2xl border bg-popover/95 p-4 text-sm shadow-xl backdrop-blur sm:p-5"
    >
      <p className="text-popover-foreground">
        We&apos;d like to use analytics cookies to understand how our booking site is used. No
        health information is ever shared.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="lg" onClick={() => choose("denied")}>
          Decline
        </Button>
        <Button size="lg" onClick={() => choose("granted")}>
          Accept
        </Button>
      </div>
    </div>
  );
}
