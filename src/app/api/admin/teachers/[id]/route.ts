import { asAdmin, objectId, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { getAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { siteUrl } from "@/lib/server/email";
import { signOutEverywhere } from "@/lib/server/users";

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

/** Resends the set-password email. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/teachers/[id]">) {
  return asAdmin(request, async () => {
    const teacher = await findTeacher((await ctx.params).id);
    const { action } = await readJson<{ action: "resend" }>(request);
    if (!teacher || action !== "resend") return reply({ ok: false, error: "Invalid request." }, 400);
    if (teacher.disabled) return reply({ ok: false, error: "Restore this teacher first." }, 409);
    await getAuth().api.requestPasswordReset({ body: { email: teacher.email, redirectTo: `${siteUrl()}/reset-password` } });
    return reply({ ok: true });
  });
}
