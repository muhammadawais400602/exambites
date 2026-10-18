import { randomUUID } from "node:crypto";
import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { lessonCol, objectIdOrNull, type Question } from "@/lib/server/courses";
import { parseVideo, storeVideo } from "@/lib/video";

function cleanQuestions(raw: unknown): Question[] | string {
  if (!Array.isArray(raw)) return [];
  if (raw.length > 50) return "A lesson can have up to 50 questions.";
  const out: Question[] = [];
  for (const [i, q] of raw.entries()) {
    const prompt = String(q?.prompt ?? "").trim().slice(0, 500);
    const options = (Array.isArray(q?.options) ? q.options : []).map((o: unknown) => String(o ?? "").trim().slice(0, 200)).filter(Boolean);
    const answer = Number(q?.answer);
    if (!prompt) return `Question ${i + 1} needs text.`;
    if (options.length < 2 || options.length > 6) return `Question ${i + 1} needs 2 to 6 answers.`;
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return `Pick the correct answer for question ${i + 1}.`;
    out.push({ id: typeof q?.id === "string" && q.id ? q.id.slice(0, 40) : randomUUID(), prompt, options, answer });
  }
  return out;
}

/** Saves a lesson: text, video (YouTube link or Bunny id), notes, quiz and whether students can see it. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/lessons/[id]">) {
  return asAdmin(request, async (admin) => {
    const _id = objectIdOrNull((await ctx.params).id);
    if (!_id) return reply({ ok: false, error: "Lesson not found." }, 404);
    const body = await readJson<{ title: string; summary: string; videoId: string; notes: string; questions: unknown; published: boolean; assignment: { instructions?: string; required?: boolean } | null }>(request);
    const instructions = String(body.assignment?.instructions ?? "").trim().slice(0, 5000);
    const assignment = instructions ? { instructions, required: !!body.assignment?.required } : null;
    const title = String(body.title ?? "").trim().slice(0, 120);
    if (title.length < 2) return reply({ ok: false, error: "Enter a lesson title." }, 422);
    const rawVideo = String(body.videoId ?? "").trim();
    const video = parseVideo(rawVideo);
    if (rawVideo && !video) return reply({ ok: false, error: "Paste a YouTube link (e.g. https://youtu.be/…) or a Bunny video ID." }, 422);
    const videoId = video ? storeVideo(video) : "";
    const questions = cleanQuestions(body.questions);
    if (typeof questions === "string") return reply({ ok: false, error: questions }, 422);
    const lesson = await lessonCol().findOneAndUpdate(
      { _id },
      {
        $set: {
          title,
          summary: String(body.summary ?? "").trim().slice(0, 300),
          videoId,
          notes: String(body.notes ?? "").slice(0, 20000),
          questions,
          assignment,
          published: !!body.published,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    if (!lesson) return reply({ ok: false, error: "Lesson not found." }, 404);
    await audit(admin, "lesson.updated", `Saved lesson “${title}”${lesson.published ? "" : " (hidden)"}`, { lessonId: String(_id), courseId: lesson.courseId });
    return reply({ ok: true });
  });
}

/** Deletes a lesson. Student progress on it stays in the records. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/lessons/[id]">) {
  return asAdmin(request, async (admin) => {
    const _id = objectIdOrNull((await ctx.params).id);
    const lesson = _id ? await lessonCol().findOneAndDelete({ _id }) : null;
    if (!lesson) return reply({ ok: false, error: "Lesson not found." }, 404);
    await audit(admin, "lesson.deleted", `Deleted lesson “${lesson.title}”`, { lessonId: String(_id), courseId: lesson.courseId });
    return reply({ ok: true, courseId: lesson.courseId });
  });
}
