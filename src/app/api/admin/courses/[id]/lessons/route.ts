import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { getCourse, lessonCol, objectIdOrNull } from "@/lib/server/courses";

/** Adds a lesson at the end of the course, hidden until the admin publishes it. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/courses/[id]/lessons">) {
  return asAdmin(request, async (admin) => {
    const course = await getCourse((await ctx.params).id);
    if (!course) return reply({ ok: false, error: "Course not found." }, 404);
    const { title: raw } = await readJson<{ title: string }>(request);
    const title = String(raw ?? "").trim().slice(0, 120);
    if (title.length < 2) return reply({ ok: false, error: "Enter a lesson title." }, 422);
    const last = await lessonCol().find({ courseId: course.id }).sort({ order: -1 }).limit(1).next();
    const now = new Date();
    const { insertedId } = await lessonCol().insertOne({
      courseId: course.id, order: (last?.order ?? 0) + 1, title, summary: "", videoId: "", notes: "", questions: [], published: false, createdAt: now, updatedAt: now,
    } as never);
    await audit(admin, "lesson.created", `Added lesson “${title}” to ${course.title}`, { courseId: course.id, lessonId: String(insertedId) });
    return reply({ ok: true, id: String(insertedId) });
  });
}

/** Saves a new lesson order: `ids` lists every lesson of the course, first to last. */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/courses/[id]/lessons">) {
  return asAdmin(request, async () => {
    const course = await getCourse((await ctx.params).id);
    if (!course) return reply({ ok: false, error: "Course not found." }, 404);
    const { ids } = await readJson<{ ids: string[] }>(request);
    const oids = Array.isArray(ids) ? ids.map((id) => objectIdOrNull(String(id))) : [];
    if (!oids.length || oids.some((id) => !id)) return reply({ ok: false, error: "Invalid order." }, 422);
    await lessonCol().bulkWrite(
      oids.map((_id, i) => ({ updateOne: { filter: { _id: _id!, courseId: course.id }, update: { $set: { order: i + 1 } } } })),
    );
    return reply({ ok: true });
  });
}
