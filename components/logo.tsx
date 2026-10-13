import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/admin" }) {
  return (
    <Link
      href={href}
      aria-label="Pollards — home"
      className={cn(
        "inline-flex rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {/* The source logo is white; invert it on light backgrounds. */}
      <Image
        src="/assets/icons/logo-full.png"
        alt="Pollards"
        width={232}
        height={68}
        priority
        className="h-8 w-auto invert dark:invert-0"
      />
    </Link>
  );
}
