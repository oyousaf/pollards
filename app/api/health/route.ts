import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness + database check for uptime monitoring and post-deploy smoke tests. */
export async function GET() {
  try {
    await query("SELECT 1");
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("health check failed", error);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
