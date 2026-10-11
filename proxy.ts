import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE, verifyToken } from "@/lib/tokens";

// Optimistic gate only — pages, data access and server actions re-check the session.
export async function proxy(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const payload = secret ? await verifyToken(token, secret) : null;

  if (payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
