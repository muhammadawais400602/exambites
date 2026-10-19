import { reviewCapstone } from "@/lib/server/capstone";
import { requireApiRole } from "@/lib/server/session";

/** A teacher (or the admin) reviews a capstone: { action: "approve" | "reject", feedback }. */
export async function POST(request: Request, ctx: RouteContext<"/api/capstones/[id]">) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const result = await reviewCapstone(user, (await ctx.params).id, body);
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
