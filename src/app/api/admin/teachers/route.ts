import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { createUserWithPassword, inviteStaff, passwordProblem, randomPassword, setPassword } from "@/lib/server/users";

/**
 * Adds a teacher. With a password, the admin sets it and shares it; without
 * one, the teacher gets a link to set their own (emailed, and shown to the
 * admin to share). Re-adding a removed teacher restores them.
 */
export async function POST(request: Request) {
  return asAdmin(request, async (admin) => {
    const body = await readJson<{ name: string; email: string; password: string }>(request);
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (name.length < 2 || name.length > 80) return reply({ ok: false, error: "Enter the teacher's name." }, 422);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: "Enter a valid email." }, 422);
    const problem = password ? passwordProblem(password) : null;
    if (problem) return reply({ ok: false, error: problem }, 422);

    const existing = await db().collection("user").findOne({ email });
    let userId: string;
    if (existing) {
      if (existing.role !== "teacher") return reply({ ok: false, error: "This email belongs to another account." }, 409);
      if (!existing.disabled) return reply({ ok: false, error: "This teacher is already active." }, 409);
      await db().collection("user").updateOne({ _id: existing._id }, { $set: { disabled: false, name, updatedAt: new Date() } });
      userId = String(existing._id);
      if (password) await setPassword(userId, password);
      await audit(admin, "teacher.restored", `Restored teacher ${name}`, { userId: String(existing._id) });
    } else {
      const user = await createUserWithPassword({ name, email, password: password || randomPassword(), role: "teacher" });
      userId = user.id;
      await audit(admin, "teacher.added", `Added teacher ${name}`, { userId: user.id });
    }

    if (password) return reply({ ok: true });
    const { link, emailed } = await inviteStaff({ id: userId, name, email });
    return reply({ ok: true, link, emailed });
  });
}
