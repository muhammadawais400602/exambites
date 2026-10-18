import "server-only";
import { toId } from "./auth";
import { listLessons, progressCol } from "./courses";
import { db } from "./db";

/** What teachers and the admin see about students' progress. */

export type RosterRow = {
  userId: string;
  name: string;
  image: string | null;
  status: "current" | "done";
  passed: number;
  total: number;
  avgScore: number | null;
  lastActive: string | null;
};

type ProgressDoc = { lessonId: string; passed?: boolean; bestScore?: number; lastScore?: number; attempts?: number; updatedAt?: Date; passedAt?: Date };

/** Students who are on this course now or have finished it, with how far they got. */
export async function courseRoster(courseId: string): Promise<RosterRow[]> {
  const enrollments = await db()
    .collection("enrollments")
    .find({ status: "approved", $or: [{ currentCourseId: courseId }, { completedCourseIds: courseId }] })
    .toArray();
  if (!enrollments.length) return [];
  const userIds = enrollments.map((e) => String(e.userId));
  const [users, lessons, progress] = await Promise.all([
    db().collection("user").find({ _id: { $in: userIds.map(toId) } }, { projection: { name: 1, image: 1 } }).toArray(),
    listLessons(courseId, { publishedOnly: true }),
    progressCol().find<ProgressDoc & { userId: string }>({ courseId, userId: { $in: userIds } }).toArray(),
  ]);
  const lessonIds = new Set(lessons.map((l) => l.id));
  // Lessons without a quiz record 100% when marked watched; keep them out of the average.
  const quizIds = new Set(lessons.filter((l) => l.questions.length).map((l) => l.id));
  const byUser = new Map(users.map((u) => [String(u._id), u]));
  return enrollments
    .map((e) => {
      const uid = String(e.userId);
      const rows = progress.filter((p) => p.userId === uid && lessonIds.has(p.lessonId));
      const scored = rows.filter((p) => quizIds.has(p.lessonId) && typeof p.bestScore === "number");
      const last = rows.reduce<Date | null>((m, p) => (p.updatedAt && (!m || p.updatedAt > m) ? p.updatedAt : m), null);
      return {
        userId: uid,
        name: String(byUser.get(uid)?.name ?? "Deleted user"),
        image: (byUser.get(uid)?.image as string | null | undefined) ?? null,
        status: (e.currentCourseId === courseId ? "current" : "done") as RosterRow["status"],
        passed: rows.filter((p) => p.passed).length,
        total: lessons.length,
        avgScore: scored.length ? Math.round(scored.reduce((s, p) => s + (p.bestScore ?? 0), 0) / scored.length) : null,
        lastActive: last ? last.toISOString() : null,
      };
    })
    .sort((a, b) => (b.lastActive ?? "").localeCompare(a.lastActive ?? ""));
}

export type LessonProgress = {
  id: string;
  order: number;
  title: string;
  questions: number;
  passed: boolean;
  bestScore: number | null;
  lastScore: number | null;
  attempts: number;
  lastAttempt: string | null;
};

/** One student's lesson-by-lesson record in a course. */
export async function studentCourseProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
  const [lessons, progress] = await Promise.all([
    listLessons(courseId, { publishedOnly: true }),
    progressCol().find<ProgressDoc>({ userId, courseId }).toArray(),
  ]);
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  return lessons.map((l) => {
    const p = byLesson.get(l.id);
    return {
      id: l.id,
      order: l.order,
      title: l.title,
      questions: l.questions.length,
      passed: !!p?.passed,
      bestScore: p?.bestScore ?? null,
      lastScore: p?.lastScore ?? null,
      attempts: p?.attempts ?? 0,
      lastAttempt: p?.updatedAt ? p.updatedAt.toISOString() : null,
    };
  });
}

export async function studentBasics(userId: string) {
  const user = await db().collection("user").findOne({ _id: toId(userId) }, { projection: { name: 1, email: 1, phone: 1, role: 1, image: 1 } });
  return user && user.role === "student" ? { id: userId, name: String(user.name), email: String(user.email), phone: String(user.phone ?? ""), image: (user.image as string | null) ?? null } : null;
}
