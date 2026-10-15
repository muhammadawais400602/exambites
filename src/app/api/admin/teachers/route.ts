import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { createUserWithPassword, inviteStaff, randomPassword } from "@/lib/server/users";

/**
 * Adds a teacher. They get a link to set their own password (emailed, and
 * shown to the admin to share); the admin never sees or chooses the
 * password. Re-adding a removed teacher restores them.
 */
export async function POST(request: Request) {
  return asAdmin(request, async (admin) => {
    const body = await readJson<{ name: string; email: string }>(request);
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (name.length < 2 || name.length > 80) return reply({ ok: false, error: "Enter the teacher's name." }, 422);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: "Enter a valid email." }, 422);

    const existing = await db().collection("user").findOne({ email });
    let userId: string;
    if (existing) {
      if (existing.role !== "teacher") return reply({ ok: false, error: "This email belongs to another account." }, 409);
      if (!existing.disabled) return reply({ ok: false, error: "This teacher is already active." }, 409);
      await db().collection("user").updateOne({ _id: existing._id }, { $set: { disabled: false, name, updatedAt: new Date() } });
      userId = String(existing._id);
      await audit(admin, "teacher.restored", `Restored teacher ${name}`, { userId: String(existing._id) });
    } else {
      const user = await createUserWithPassword({ name, email, password: randomPassword(), role: "teacher" });
      userId = user.id;
      await audit(admin, "teacher.added", `Added teacher ${name}`, { userId: user.id });
    }

    const { link, emailed } = await inviteStaff({ id: userId, name, email });
    return reply({ ok: true, link, emailed });
  });
}
