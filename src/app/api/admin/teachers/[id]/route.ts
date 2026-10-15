import { asAdmin, objectId, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { inviteStaff, passwordProblem, setPassword, signOutEverywhere } from "@/lib/server/users";

async function findTeacher(id: string) {
  const _id = objectId(id);
  return _id ? db().collection("user").findOne({ _id, role: "teacher" }) : null;
}

/** Removes a teacher: blocks login and ends their sessions. Their past answers stay. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/teachers/[id]">) {
  return asAdmin(request, async (admin) => {
    const teacher = await findTeacher((await ctx.params).id);
    if (!teacher) return reply({ ok: false, error: "Teacher not found." }, 404);
    await db().collection("user").updateOne({ _id: teacher._id }, { $set: { disabled: true, updatedAt: new Date() } });
    await signOutEverywhere(String(teacher._id));
    await audit(admin, "teacher.removed", `Removed teacher ${teacher.name}`, { userId: String(teacher._id) });
    return reply({ ok: true });
  });
}

/** `resend`: makes a fresh set-password link and emails it. `password`: sets the password directly. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/teachers/[id]">) {
  return asAdmin(request, async (admin) => {
    const teacher = await findTeacher((await ctx.params).id);
    const { action, password } = await readJson<{ action: "resend" | "password"; password: string }>(request);
    if (!teacher || (action !== "resend" && action !== "password")) return reply({ ok: false, error: "Invalid request." }, 400);
    if (teacher.disabled) return reply({ ok: false, error: "Restore this teacher first." }, 409);
    if (action === "password") {
      const problem = passwordProblem(String(password ?? ""));
      if (problem) return reply({ ok: false, error: problem }, 422);
      await setPassword(String(teacher._id), String(password));
      await audit(admin, "teacher.password_set", `Set a new password for ${teacher.name}`, { userId: String(teacher._id) });
      return reply({ ok: true });
    }
    const { link, emailed } = await inviteStaff({ id: String(teacher._id), name: String(teacher.name), email: String(teacher.email) });
    return reply({ ok: true, link, emailed });
  });
}
