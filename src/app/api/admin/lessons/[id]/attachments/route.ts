import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { getLesson, lessonCol, objectIdOrNull } from "@/lib/server/courses";
import { FILE_TYPES, MAX_FILE_BYTES, MAX_FILES_PER_LESSON } from "@/lib/files";

/** Only files our upload token put under this lesson's folder in Vercel Blob. */
function isOurBlob(url: string, lessonId: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com") && u.pathname.startsWith(`/lessons/${lessonId}/`);
  } catch {
    return false;
  }
}

/** Registers an uploaded file on the lesson. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/lessons/[id]/attachments">) {
  return asAdmin(request, async (admin) => {
    const lesson = await getLesson((await ctx.params).id);
    if (!lesson) return reply({ ok: false, error: "Lesson not found." }, 404);
    const body = await readJson<{ url: string; name: string; size: number; type: string }>(request);
    const url = String(body.url ?? "");
    const type = String(body.type ?? "");
    const size = Number(body.size);
    const name = String(body.name ?? "").trim().slice(0, 120) || "File";
    if (!isOurBlob(url, lesson.id)) return reply({ ok: false, error: "Upload not recognised." }, 422);
    if (!FILE_TYPES[type] || !Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) return reply({ ok: false, error: "That file type or size isn't allowed." }, 422);
    if (lesson.attachments.length >= MAX_FILES_PER_LESSON) return reply({ ok: false, error: `A lesson can have up to ${MAX_FILES_PER_LESSON} files.` }, 422);
    const file = { id: randomUUID(), name, url, size, type, uploadedAt: new Date() };
    await lessonCol().updateOne({ _id: objectIdOrNull(lesson.id)! }, { $push: { attachments: file }, $set: { updatedAt: new Date() } });
    await audit(admin, "lesson.updated", `Added file “${name}” to “${lesson.title}”`, { lessonId: lesson.id });
    return reply({ ok: true, id: file.id });
  });
}

/** Removes a file from the lesson and from storage (?file=<id>). */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/lessons/[id]/attachments">) {
  return asAdmin(request, async (admin) => {
    const lesson = await getLesson((await ctx.params).id);
    const fileId = new URL(request.url).searchParams.get("file") ?? "";
    const file = lesson?.attachments.find((a) => a.id === fileId);
    if (!lesson || !file) return reply({ ok: false, error: "File not found." }, 404);
    await lessonCol().updateOne({ _id: objectIdOrNull(lesson.id)! }, { $pull: { attachments: { id: fileId } }, $set: { updatedAt: new Date() } });
    await del(file.url).catch((err) => console.error("[files] blob delete failed", err));
    await audit(admin, "lesson.updated", `Removed file “${file.name}” from “${lesson.title}”`, { lessonId: lesson.id });
    return reply({ ok: true });
  });
}
