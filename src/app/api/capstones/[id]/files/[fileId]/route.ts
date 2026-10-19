import { canReviewCapstones, getCapstoneById } from "@/lib/server/capstone";
import { requireApiRole } from "@/lib/server/session";

/** A capstone screenshot: for the student who sent it, teachers and the admin. */
export async function GET(request: Request, ctx: RouteContext<"/api/capstones/[id]/files/[fileId]">) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const { id, fileId } = await ctx.params;
  const cap = await getCapstoneById(id);
  const file = cap?.files.find((f) => f.id === fileId);
  if (!cap || !file || !(cap.userId === user.id || canReviewCapstones(user))) return new Response("Not found", { status: 404 });
  return Response.redirect(file.url, 302);
}
