import { removeAvatar, saveAvatar } from "@/lib/server/profile";
import { requireApiRole } from "@/lib/server/session";

/** Uploads the signed-in person's picture (raw image bytes; the browser resizes it first). */
export async function PUT(request: Request) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const buf = Buffer.from(await request.arrayBuffer());
  const result = await saveAvatar(user.id, buf);
  if (typeof result === "string") return Response.json({ ok: false, error: result }, { status: 422 });
  return Response.json({ ok: true, image: result.image });
}

export async function DELETE(request: Request) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  await removeAvatar(user.id);
  return Response.json({ ok: true });
}
