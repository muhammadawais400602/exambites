import { chooseNextCourse } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";

/** Starts the course the student picked next ({ courseId }). */
export async function POST(request: Request) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  const { courseId } = (await request.json().catch(() => ({}))) as { courseId?: string };
  const result = await chooseNextCourse(user, String(courseId ?? ""));
  return Response.json(result, { status: result.ok ? 200 : 409 });
}
