import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@/components/analytics";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pollards.info";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pollards Opticians — Book an eye appointment in Wakefield",
    template: "%s · Pollards Opticians",
  },
  description:
    "Book an eye examination, contact lens fitting or keratoconus review with Pollards Opticians in Wakefield. Quick online booking with SMS confirmation.",
  keywords: [
    "Pollards Opticians",
    "Opticians Wakefield",
    "Eye test Wakefield",
    "Keratoconus",
    "Contact lens fitting",
    "Eye care",
  ],
  authors: [{ name: "Pollards Opticians" }],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Pollards Opticians",
    images: ["/assets/images/onboarding-img.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#1e0b32" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" suppressHydrationWarning className={cn(geist.variable, instrument.variable)}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
