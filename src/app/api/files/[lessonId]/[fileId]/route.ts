import { getDownloadUrl } from "@vercel/blob";
import { audit } from "@/lib/server/audit";
import { getCourse, getLesson } from "@/lib/server/courses";
import { lessonForStudent } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";

/**
 * Downloads a lesson file. Students only get files of lessons they've
 * unlocked; teachers only of their courses; the admin any. Each student
 * download is logged. The storage address is never shown on the page.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/files/[lessonId]/[fileId]">) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const { lessonId, fileId } = await ctx.params;
  const lesson = await getLesson(lessonId);
  const file = lesson?.attachments.find((a) => a.id === fileId);
  if (!lesson || !file) return new Response("Not found", { status: 404 });

  let allowed = user.role === "admin";
  if (user.role === "teacher") allowed = !!(await getCourse(lesson.courseId))?.teacherIds?.includes(user.id);
  if (user.role === "student") {
    allowed = !!(await lessonForStudent(user.id, lesson.id));
    if (allowed) await audit(user, "student.file_downloaded", `${user.name} downloaded “${file.name}”`, { lessonId: lesson.id, fileId });
  }
  if (!allowed) return new Response("Not found", { status: 404 });

  // PDFs and images open in the browser; Office files download.
  const inline = file.type === "application/pdf" || file.type.startsWith("image/");
  return Response.redirect(inline ? file.url : getDownloadUrl(file.url), 302);
}
