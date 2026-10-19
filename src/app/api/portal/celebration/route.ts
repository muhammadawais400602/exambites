import { clearCelebration } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";

/** The student has seen the "course complete" popup; don't show it again. */
export async function POST(request: Request) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  await clearCelebration(user.id);
  return Response.json({ ok: true });
}
