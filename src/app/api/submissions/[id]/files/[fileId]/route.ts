import { getDownloadUrl } from "@vercel/blob";
import { canReview, getSubmissionById } from "@/lib/server/assignments";
import { requireApiRole } from "@/lib/server/session";

/** A file from a submission: for the student who sent it, the course's teachers and the admin. */
export async function GET(request: Request, ctx: RouteContext<"/api/submissions/[id]/files/[fileId]">) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const { id, fileId } = await ctx.params;
  const sub = await getSubmissionById(id);
  const file = sub?.files.find((f) => f.id === fileId);
  if (!sub || !file || !(sub.userId === user.id || (await canReview(user, sub.courseId)))) return new Response("Not found", { status: 404 });
  const inline = file.type === "application/pdf" || file.type.startsWith("image/");
  return Response.redirect(inline ? file.url : getDownloadUrl(file.url), 302);
}
