import { recordWatch } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";

/** Video watching beacons from the lesson player: { event: "start" | "complete", duration }. */
export async function POST(request: Request, ctx: RouteContext<"/api/portal/lessons/[id]/watch">) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  const body = (await request.json().catch(() => ({}))) as { event?: string; duration?: number };
  if (body.event !== "start" && body.event !== "complete") return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = await recordWatch(user, (await ctx.params).id, body.event, Number(body.duration));
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
