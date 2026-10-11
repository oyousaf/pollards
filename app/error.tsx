"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-aurora grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
          <TriangleAlertIcon className="size-7" aria-hidden />
        </div>
        <h1 className="font-display text-4xl tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          Sorry about that. Please try again, or call the practice if the problem continues.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <Button size="lg" onClick={reset}>
            <RotateCcwIcon data-icon="inline-start" /> Try again
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
