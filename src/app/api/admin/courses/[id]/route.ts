import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { courseCol, objectIdOrNull } from "@/lib/server/courses";

/** Edits a course's details or publishes / hides it. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/courses/[id]">) {
  return asAdmin(request, async (admin) => {
    const _id = objectIdOrNull((await ctx.params).id);
    if (!_id) return reply({ ok: false, error: "Course not found." }, 404);
    const body = await readJson<{ title: string; category: string; description: string; published: boolean; bonus: boolean }>(request);
    const set: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const title = String(body.title).trim().slice(0, 80);
      if (title.length < 2) return reply({ ok: false, error: "Enter a course title." }, 422);
      set.title = title;
    }
    if (body.category !== undefined) set.category = String(body.category).trim().slice(0, 40);
    if (body.description !== undefined) set.description = String(body.description).trim().slice(0, 600);
    if (body.published !== undefined) set.published = !!body.published;
    if (body.bonus !== undefined) set.bonus = !!body.bonus;
    const course = await courseCol().findOneAndUpdate({ _id }, { $set: set }, { returnDocument: "after" });
    if (!course) return reply({ ok: false, error: "Course not found." }, 404);
    await audit(admin, "course.updated", `Updated course ${course.title}${body.published !== undefined ? (body.published ? " (published)" : " (hidden)") : ""}`, { courseId: String(_id) });
    return reply({ ok: true });
  });
}
