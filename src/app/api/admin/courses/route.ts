import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { courseCol, ensureCourses, objectIdOrNull, slugify } from "@/lib/server/courses";

/** Creates a course (unpublished until the admin adds lessons and publishes it). */
export async function POST(request: Request) {
  return asAdmin(request, async (admin) => {
    await ensureCourses();
    const body = await readJson<{ title: string; category: string; bonus: boolean }>(request);
    const title = String(body.title ?? "").trim().slice(0, 80);
    const category = String(body.category ?? "").trim().slice(0, 40);
    if (title.length < 2) return reply({ ok: false, error: "Enter a course title." }, 422);
    const slug = slugify(title);
    if (!slug) return reply({ ok: false, error: "Use letters or numbers in the title." }, 422);
    const last = await courseCol().find().sort({ order: -1 }).limit(1).next();
    try {
      const { insertedId } = await courseCol().insertOne({
        slug, title, category, description: "", order: (last?.order ?? 0) + 1, bonus: !!body.bonus, published: false, createdAt: new Date(),
      } as never);
      await audit(admin, "course.created", `Created course ${title}`, { courseId: String(insertedId) });
      return reply({ ok: true, id: String(insertedId) });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return reply({ ok: false, error: "A course with this title already exists." }, 409);
      throw err;
    }
  });
}

/** Saves the order students take courses in: `ids` lists every course, first to last. */
export async function PUT(request: Request) {
  return asAdmin(request, async (admin) => {
    const { ids } = await readJson<{ ids: string[] }>(request);
    const oids = Array.isArray(ids) ? ids.map((id) => objectIdOrNull(String(id))) : [];
    if (!oids.length || oids.some((id) => !id)) return reply({ ok: false, error: "Invalid order." }, 422);
    await courseCol().bulkWrite(oids.map((_id, i) => ({ updateOne: { filter: { _id: _id! }, update: { $set: { order: i + 1 } } } })));
    await audit(admin, "course.updated", "Changed the course order");
    return reply({ ok: true });
  });
}
