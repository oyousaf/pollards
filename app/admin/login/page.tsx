import { ShieldIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PasskeyForm } from "@/components/admin/passkey-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="bg-aurora flex min-h-dvh flex-col">
      <header className="flex items-center justify-between p-5 sm:px-10">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" className="grid flex-1 place-items-center px-5 pb-20">
        <div className="w-full max-w-sm animate-fade-up rounded-3xl border bg-card p-8 shadow-xl shadow-primary/5">
          <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-primary/10 text-brand">
            <ShieldIcon className="size-6" aria-hidden />
          </div>
          <h1 className="font-display text-3xl tracking-tight">Staff access</h1>
          <p className="mt-1 mb-8 text-sm text-muted-foreground">
            Enter the 4-digit passcode to open the appointments dashboard.
          </p>
          <PasskeyForm />
        </div>
        <Link
          href="/"
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to booking
        </Link>
      </main>
    </div>
  );
}
