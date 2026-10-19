import { saveCapstone } from "@/lib/server/capstone";
import { requireApiRole } from "@/lib/server/session";

/** A student hands in (or updates) their capstone: { kind, title, description, link, files }. */
export async function POST(request: Request) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const result = await saveCapstone(user, body);
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
