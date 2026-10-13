import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE, verifyToken } from "@/lib/tokens";

// Optimistic gate only — pages, data access and server actions re-check the session.
export async function proxy(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const payload = secret ? await verifyToken(token, secret) : null;

  if (payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", publicBase(request)));
  }
  return NextResponse.next();
}

/**
 * Behind the Vercel → VPS proxy, request.url carries the VPS hostname. Redirect to the
 * public site instead — but only when the forwarded host is that site, so a spoofed
 * X-Forwarded-Host can't send visitors anywhere else.
 */
function publicBase(request: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site && request.headers.get("x-forwarded-host") === new URL(site).host) return site;
  return request.url;
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
