import Image from "next/image";

import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

// Swap this file to change the photo used across the patient journey.
const HERO_IMAGE = {
  src: "/assets/images/onboarding-img.webp",
  alt: "An optometrist examining a patient with a slit lamp at Pollards",
};

/**
 * Split layout for the patient journey: form column + sticky photo panel, held together
 * in one centred max-w-7xl frame so wide screens get a single composed block rather than
 * pieces pinned to opposite edges. The photo collapses away below `lg`.
 */
export function PatientShell({
  children,
  footer,
  width = "md",
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg";
}) {
  return (
    <div className="bg-aurora min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
        <div className="flex min-w-0 flex-1 flex-col px-5 sm:px-10">
          <header className="flex items-center justify-between py-5">
            <Logo />
            <ThemeToggle />
          </header>

          <main
            id="main"
            className={cn(
              "mx-auto flex w-full flex-1 flex-col justify-center pb-10",
              width === "md" ? "max-w-xl" : "max-w-3xl"
            )}
          >
            {children}
          </main>

          <footer className="flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Pollards</p>
            {footer}
          </footer>
        </div>

        <aside className="sticky top-0 hidden h-dvh w-[45%] shrink-0 py-4 pr-4 lg:block">
          <div className="relative size-full overflow-hidden rounded-3xl">
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              priority
              sizes="(min-width: 1280px) 576px, (min-width: 1024px) 45vw, 0px"
              className="object-cover"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="mb-8 animate-fade-up space-y-3">
      {eyebrow && (
        <p className="text-sm font-medium tracking-wide text-brand uppercase">{eyebrow}</p>
      )}
      <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
      {description && <p className="text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}
