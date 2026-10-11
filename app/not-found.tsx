import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="bg-aurora grid min-h-dvh place-items-center px-5">
      <div className="text-center">
        <p className="font-display text-8xl text-brand">404</p>
        <h1 className="mt-2 text-xl font-semibold">This page is out of focus</h1>
        <p className="mt-1 text-muted-foreground">
          We couldn&apos;t find what you were looking for.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/">Book an appointment</Link>
        </Button>
      </div>
    </main>
  );
}
