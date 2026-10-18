import "server-only";
import { ObjectId } from "mongodb";
import { audit } from "./audit";
import { toId } from "./auth";
import { getCourse, getLesson, objectIdOrNull } from "./courses";
import { db } from "./db";
import { completeCourseIfDone, lessonForStudent } from "./learning";
import type { AppUser } from "./session";
import { FILE_TYPES } from "@/lib/files";

/** Assignment submissions: students hand in work on a lesson, teachers of that course grade it. */
export const MAX_SUBMISSION_FILES = 5;
export const MAX_SUBMISSION_BYTES = 50 * 1024 * 1024;
export const MAX_SCORE = 100;

export type SubmissionFile = { id: string; name: string; url: string; size: number; type: string };
export type SubmissionStatus = "submitted" | "graded" | "returned";

type SubmissionDoc = {
  _id: ObjectId;
  lessonId: string;
  courseId: string;
  userId: string;
  text: string;
  link: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  score: number | null;
  feedback: string;
  gradedBy: string | null;
  gradedByName: string | null;
  submittedAt: Date;
  gradedAt: Date | null;
  updatedAt: Date;
};

export type Submission = Omit<SubmissionDoc, "_id" | "submittedAt" | "gradedAt" | "updatedAt"> & {
  id: string;
  submittedAt: string;
  gradedAt: string | null;
};

const col = () => db().collection<SubmissionDoc>("submissions");

const toSubmission = (d: SubmissionDoc): Submission => ({
  id: String(d._id), lessonId: d.lessonId, courseId: d.courseId, userId: d.userId,
  text: d.text ?? "", link: d.link ?? "", files: d.files ?? [], status: d.status,
  score: d.score ?? null, feedback: d.feedback ?? "", gradedBy: d.gradedBy ?? null, gradedByName: d.gradedByName ?? null,
  submittedAt: d.submittedAt.toISOString(), gradedAt: d.gradedAt ? d.gradedAt.toISOString() : null,
});

export async function getSubmission(userId: string, lessonId: string) {
  const d = await col().findOne({ userId, lessonId });
  return d ? toSubmission(d) : null;
}

export async function getSubmissionById(id: string) {
  const _id = objectIdOrNull(id);
  const d = _id ? await col().findOne({ _id }) : null;
  return d ? toSubmission(d) : null;
}

/** Only files the student's own upload token put in their folder for this lesson. */
export function isStudentBlob(url: string, lessonId: string, userId: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com") && u.pathname.startsWith(`/submissions/${lessonId}/${userId}/`);
  } catch {
    return false;
  }
}

/** Saves (or updates) a student's work. Locked once graded, unless the teacher asks for a resubmission. */
export async function saveSubmission(user: AppUser, lessonId: string, input: { text?: unknown; link?: unknown; files?: unknown }) {
  const found = await lessonForStudent(user.id, lessonId);
  if (!found?.lesson.assignment) return { ok: false as const, error: "This lesson has no assignment open for you.", status: 404 };
  const text = String(input.text ?? "").trim().slice(0, 5000);
  let link = String(input.link ?? "").trim().slice(0, 500);
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
  if (link && !/^https?:\/\/[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(link)) return { ok: false as const, error: "That link doesn't look like a web address.", status: 422 };
  const raw = Array.isArray(input.files) ? input.files.slice(0, MAX_SUBMISSION_FILES + 1) : [];
  if (raw.length > MAX_SUBMISSION_FILES) return { ok: false as const, error: `Attach up to ${MAX_SUBMISSION_FILES} files.`, status: 422 };
  const files: SubmissionFile[] = [];
  for (const f of raw as Record<string, unknown>[]) {
    const file = { id: String(f.id ?? new ObjectId()), name: String(f.name ?? "File").slice(0, 120), url: String(f.url ?? ""), size: Number(f.size), type: String(f.type ?? "") };
    if (!isStudentBlob(file.url, lessonId, user.id) || !FILE_TYPES[file.type] || !(file.size > 0 && file.size <= MAX_SUBMISSION_BYTES)) {
      return { ok: false as const, error: `“${file.name}” couldn't be attached. Upload it again.`, status: 422 };
    }
    files.push(file);
  }
  if (!text && !link && !files.length) return { ok: false as const, error: "Add your answer, a link or a file.", status: 422 };

  const existing = await col().findOne({ userId: user.id, lessonId });
  if (existing?.status === "graded") return { ok: false as const, error: "This assignment is already graded.", status: 409 };
  const now = new Date();
  await col().updateOne(
    { userId: user.id, lessonId },
    {
      $set: { text, link, files, status: "submitted", courseId: found.course.id, submittedAt: now, updatedAt: now },
      $setOnInsert: { score: null, feedback: "", gradedBy: null, gradedByName: null, gradedAt: null },
    },
    { upsert: true },
  );
  await audit(user, "student.assignment_submitted", `${user.name} ${existing ? "updated" : "submitted"} the assignment for “${found.lesson.title}”`, { lessonId, courseId: found.course.id });
  const courseCompleted = !existing && found.course.state === "current" ? await completeCourseIfDone(user, found.course.id) : false;
  return { ok: true as const, courseCompleted, nextLessonId: found.lessons[found.index + 1]?.id ?? null };
}

/** Can this user grade (and see) work for this course? Assigned teachers and the admin. */
export async function canReview(user: AppUser, courseId: string) {
  if (user.role === "admin") return true;
  if (user.role !== "teacher") return false;
  return !!(await getCourse(courseId))?.teacherIds?.includes(user.id);
}

export async function gradeSubmission(reviewer: AppUser, id: string, input: { action?: unknown; score?: unknown; feedback?: unknown }) {
  const sub = await getSubmissionById(id);
  if (!sub || !(await canReview(reviewer, sub.courseId))) return { ok: false as const, error: "Submission not found.", status: 404 };
  const feedback = String(input.feedback ?? "").trim().slice(0, 3000);
  const now = new Date();
  const lesson = await getLesson(sub.lessonId);
  const student = await db().collection("user").findOne({ _id: toId(sub.userId) }, { projection: { name: 1 } });
  if (input.action === "return") {
    if (!feedback) return { ok: false as const, error: "Tell the student what to change.", status: 422 };
    await col().updateOne({ _id: toId(id) }, { $set: { status: "returned", score: null, feedback, gradedBy: reviewer.id, gradedByName: reviewer.name, gradedAt: now, updatedAt: now } });
    await audit(reviewer, "assignment.returned", `${reviewer.name} asked ${student?.name ?? "a student"} to redo “${lesson?.title ?? "an assignment"}”`, { submissionId: id });
    return { ok: true as const };
  }
  const score = Number(input.score);
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return { ok: false as const, error: `Give a whole-number score from 0 to ${MAX_SCORE}.`, status: 422 };
  await col().updateOne({ _id: toId(id) }, { $set: { status: "graded", score, feedback, gradedBy: reviewer.id, gradedByName: reviewer.name, gradedAt: now, updatedAt: now } });
  await audit(reviewer, "assignment.graded", `${reviewer.name} graded ${student?.name ?? "a student"}'s “${lesson?.title ?? "assignment"}”: ${score}/${MAX_SCORE}`, { submissionId: id });
  return { ok: true as const };
}

export type ReviewRow = Submission & { studentName: string; studentImage: string | null; lessonTitle: string; lessonOrder: number };

/** A course's submissions for teachers: waiting ones first (oldest first), then the rest. */
export async function courseSubmissions(courseId: string): Promise<ReviewRow[]> {
  const docs = await col().find({ courseId }).toArray();
  if (!docs.length) return [];
  const [users, lessons] = await Promise.all([
    db().collection("user").find({ _id: { $in: [...new Set(docs.map((d) => d.userId))].map(toId) } }, { projection: { name: 1, image: 1 } }).toArray(),
    db().collection("lessons").find({ courseId }, { projection: { title: 1, order: 1 } }).toArray(),
  ]);
  const u = new Map(users.map((x) => [String(x._id), x]));
  const l = new Map(lessons.map((x) => [String(x._id), x]));
  const rank = { submitted: 0, returned: 1, graded: 2 } as const;
  return docs
    .map((d) => ({
      ...toSubmission(d),
      studentName: String(u.get(d.userId)?.name ?? "Deleted user"),
      studentImage: (u.get(d.userId)?.image as string | null) ?? null,
      lessonTitle: String(l.get(d.lessonId)?.title ?? "Deleted lesson"),
      lessonOrder: Number(l.get(d.lessonId)?.order ?? 0),
    }))
    .sort((a, b) => rank[a.status] - rank[b.status] || (a.status === "submitted" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt)));
}

export async function waitingCount(courseId: string) {
  return col().countDocuments({ courseId, status: "submitted" });
}

/** A student's submissions in a course, by lesson (for progress views). */
export async function studentSubmissions(userId: string, courseId: string) {
  const docs = await col().find({ userId, courseId }).toArray();
  return new Map(docs.map((d) => [d.lessonId, toSubmission(d)]));
}
