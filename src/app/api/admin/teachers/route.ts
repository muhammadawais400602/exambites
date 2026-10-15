import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { getAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { siteUrl } from "@/lib/server/email";
import { createUserWithPassword, randomPassword } from "@/lib/server/users";

/**
 * Adds a teacher. They get an email with a link to set their own password;
 * the admin never sees or chooses it. Re-adding a removed teacher restores them.
 */
export async function POST(request: Request) {
  return asAdmin(request, async (admin) => {
    const body = await readJson<{ name: string; email: string }>(request);
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (name.length < 2 || name.length > 80) return reply({ ok: false, error: "Enter the teacher's name." }, 422);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: "Enter a valid email." }, 422);

    const existing = await db().collection("user").findOne({ email });
    if (existing) {
      if (existing.role !== "teacher") return reply({ ok: false, error: "This email belongs to another account." }, 409);
      if (!existing.disabled) return reply({ ok: false, error: "This teacher is already active." }, 409);
      await db().collection("user").updateOne({ _id: existing._id }, { $set: { disabled: false, name, updatedAt: new Date() } });
      await audit(admin, "teacher.restored", `Restored teacher ${name}`, { userId: String(existing._id) });
    } else {
      const user = await createUserWithPassword({ name, email, password: randomPassword(), role: "teacher" });
      await audit(admin, "teacher.added", `Added teacher ${name}`, { userId: user.id });
    }

    await getAuth().api.requestPasswordReset({ body: { email, redirectTo: `${siteUrl()}/reset-password` } });
    return reply({ ok: true });
  });
}
