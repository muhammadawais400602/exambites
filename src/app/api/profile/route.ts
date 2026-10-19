import { toId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { cleanProfile, saveProfile } from "@/lib/server/profile";
import { requireApiRole } from "@/lib/server/session";

/** Saves the signed-in person's own profile: public name, plus private details. */
export async function PATCH(request: Request) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) return Response.json({ ok: false, error: "Enter your name (2–60 characters)." }, { status: 422 });
  const profile = cleanProfile(body);
  if (typeof profile === "string") return Response.json({ ok: false, error: profile }, { status: 422 });
  // School details belong to students only.
  if (user.role !== "student") Object.assign(profile, { regNo: "", campus: "", className: "", section: "" });

  const set: Record<string, unknown> = { name, updatedAt: new Date() };
  if (user.role === "student" && body.phone !== undefined) {
    const digits = String(body.phone).replace(/\D/g, "").replace(/^(92|0)/, "");
    if (!/^3\d{9}$/.test(digits)) return Response.json({ ok: false, error: "Enter a valid mobile number, e.g. 3001234567." }, { status: 422 });
    set.phone = `+92${digits}`;
  }
  await db().collection("user").updateOne({ _id: toId(user.id) }, { $set: set });
  await saveProfile(user.id, profile);
  return Response.json({ ok: true });
}
