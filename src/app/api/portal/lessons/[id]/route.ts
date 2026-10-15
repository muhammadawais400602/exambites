import { submitLesson } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";

/** Submits a lesson's quiz answers ({ answers: { [questionId]: optionIndex } }). */
export async function POST(request: Request, ctx: RouteContext<"/api/portal/lessons/[id]">) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  const body = (await request.json().catch(() => ({}))) as { answers?: Record<string, unknown> };
  const answers: Record<string, number> = {};
  for (const [k, v] of Object.entries(body.answers ?? {}).slice(0, 60)) answers[k] = Number(v);
  const result = await submitLesson(user, (await ctx.params).id, answers);
  if (!result.ok) return Response.json(result, { status: result.status });
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
