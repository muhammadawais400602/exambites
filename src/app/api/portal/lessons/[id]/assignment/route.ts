import { saveSubmission } from "@/lib/server/assignments";
import { requireApiRole } from "@/lib/server/session";

/** A student hands in (or updates) the lesson's assignment: { text, link, files }. */
export async function POST(request: Request, ctx: RouteContext<"/api/portal/lessons/[id]/assignment">) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await saveSubmission(user, (await ctx.params).id, body);
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
