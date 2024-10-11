import type { Metadata } from "next";
import "./globals.css";
import { Poppins as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pollards",
  description:
    "No matter the situation, never let your emotions overpower your intelligence.",
  icons: {
    icon: "/assets/icons/favicon.ico",
  },
  themeColor: "#9F34B5",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  keywords:
    "Pollards Opticians, Pollards, Wakefield, Keratoconus, Pollards Opticians Wakefield, Pollards Wakefield, Opticians Wakefield, Opticians in Wakefield, Wakefield Opticians, Eye care, Vision, Vision correction",
  authors: [{ name: "Pollards, oyousaf" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-gb">
      <body
        className={cn(
          "min-h-screen bg-dark-300 font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
