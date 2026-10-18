import { readAvatar } from "@/lib/server/profile";
import { requireApiRole } from "@/lib/server/session";

/** Serves a profile picture to signed-in members. The ?v= in the URL changes on every upload, so it caches well. */
export async function GET(request: Request, ctx: RouteContext<"/api/avatars/[id]">) {
  const viewer = await requireApiRole(request, "any");
  if (viewer instanceof Response) return new Response(null, { status: viewer.status });
  const avatar = await readAvatar((await ctx.params).id);
  if (!avatar) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(avatar.data), {
    headers: { "Content-Type": avatar.type, "Cache-Control": "private, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
