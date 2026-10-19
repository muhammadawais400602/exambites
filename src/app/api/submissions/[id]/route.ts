import { reviewSubmission } from "@/lib/server/assignments";
import { requireApiRole } from "@/lib/server/session";

/** Teacher (or admin) reviews a submission: { action: "approve" | "reject", feedback }. */
export async function POST(request: Request, ctx: RouteContext<"/api/submissions/[id]">) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await reviewSubmission(user, (await ctx.params).id, body);
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
