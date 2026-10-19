import "server-only";
import { audit } from "./audit";
import { getCourse, getLesson, listCourses, listLessons, PASS_MARK, progressCol, type Course, type Lesson } from "./courses";
import { db } from "./db";
import { videoEmbedUrl } from "./bunny";
import type { AppUser } from "./session";

/**
 * How a student moves through the academy: one payment covers every course,
 * but only one course is open at a time, in the order the admin sets.
 * Finishing a course opens the next one automatically. Bonus courses come
 * after every core course.
 */
export type CourseState = "current" | "done" | "locked";
export type LessonState = "done" | "open" | "locked";

export type PathCourse = Course & { state: CourseState };

const enrollments = () => db().collection("enrollments");

/** The course a student should be on next: the first unfinished core course, then bonus ones. */
function nextCourse(courses: Course[], completed: string[]) {
  const open = (c: Course) => !completed.includes(c.id);
  return courses.find((c) => !c.bonus && open(c)) ?? courses.find((c) => c.bonus && open(c)) ?? null;
}

export async function studentPath(userId: string) {
  const enrollment = await enrollments().findOne({ userId, status: "approved" });
  if (!enrollment) return null;
  const courses = await listCourses({ publishedOnly: true });
  const completed: string[] = enrollment.completedCourseIds ?? [];
  let current: string | null = enrollment.currentCourseId ?? null;
  // A course that was hidden or deleted can't stay current.
  if (current && !courses.some((c) => c.id === current)) current = null;

  if (!current) {
    const next = nextCourse(courses, completed);
    if (next) {
      current = next.id;
      await enrollments().updateOne({ _id: enrollment._id }, { $set: { currentCourseId: current } });
    }
  }
  const path: PathCourse[] = courses.map((c) => ({
    ...c,
    state: completed.includes(c.id) ? "done" : c.id === current ? "current" : "locked",
  }));
  return { courses: path, currentId: current, completed };
}

/**
 * Lessons of a course with the student's progress. A lesson is done once its
 * quiz is passed (or it's marked watched) and, when its assignment is
 * required, the assignment is submitted. Each opens once the one before is done.
 */
export async function lessonsWithProgress(userId: string, courseId: string) {
  const [lessons, passed, submitted] = await Promise.all([
    listLessons(courseId, { publishedOnly: true }),
    progressCol()
      .find({ userId, courseId, passed: true }, { projection: { lessonId: 1 } })
      .toArray()
      .then((rows) => new Set(rows.map((r) => String(r.lessonId)))),
    db()
      .collection("submissions")
      .find({ userId, courseId }, { projection: { lessonId: 1 } })
      .toArray()
      .then((rows) => new Set(rows.map((r) => String(r.lessonId)))),
  ]);
  let open = true;
  return lessons.map((l) => {
    const quizPassed = passed.has(l.id);
    const assignmentDone = !l.assignment?.required || submitted.has(l.id);
    const done = quizPassed && assignmentDone;
    const state: LessonState = done ? "done" : open ? "open" : "locked";
    if (!done) open = false;
    return { ...l, state, quizPassed, submitted: submitted.has(l.id) };
  });
}

/** Marks the course complete when every lesson is done and opens the next one; returns true if it just happened. */
export async function completeCourseIfDone(user: AppUser, courseId: string) {
  const lessons = await lessonsWithProgress(user.id, courseId);
  if (!lessons.length || !lessons.every((l) => l.state === "done")) return false;
  const enrollment = await enrollments().findOne({ userId: user.id, status: "approved", currentCourseId: courseId });
  if (!enrollment) return false;
  const completed = [...new Set([...(enrollment.completedCourseIds ?? []), courseId])];
  const next = nextCourse(await listCourses({ publishedOnly: true }), completed);
  const res = await enrollments().updateOne(
    { _id: enrollment._id, currentCourseId: courseId },
    { $set: { currentCourseId: next?.id ?? null, completedCourseIds: completed } },
  );
  if (!res.modifiedCount) return false;
  const course = await getCourse(courseId);
  await audit(user, "student.course_completed", `${user.name} completed ${course?.title ?? "a course"}${next ? `; ${next.title} is open` : ""}`, { courseId, nextCourseId: next?.id ?? null });
  return true;
}

/** Everything a student needs to open one lesson, or null when it isn't theirs to open yet. */
export async function lessonForStudent(userId: string, lessonId: string) {
  const lesson = await getLesson(lessonId);
  if (!lesson || !lesson.published) return null;
  const path = await studentPath(userId);
  const course = path?.courses.find((c) => c.id === lesson.courseId);
  if (!course || (course.state !== "current" && course.state !== "done")) return null;
  const lessons = await lessonsWithProgress(userId, course.id);
  const index = lessons.findIndex((l) => l.id === lesson.id);
  if (index < 0 || lessons[index].state === "locked") return null;
  return { course, lesson: lessons[index], lessons, index };
}

/** A lesson needs watching first when it has a video students can actually play. */
export const needsWatching = (lesson: Lesson) => !!videoEmbedUrl(lesson.videoId);

export async function hasWatched(userId: string, lessonId: string) {
  const p = await progressCol().findOne({ userId, lessonId }, { projection: { watchedAt: 1, passed: 1 } });
  return !!(p?.watchedAt || p?.passed);
}

/**
 * Records video watching. "start" notes when playback began and how long the
 * video is; "complete" (sent once the browser has seen most of it played)
 * only counts if at least half the video's length has passed since then,
 * so skipping to the end or calling this directly doesn't unlock the quiz.
 */
export async function recordWatch(user: AppUser, lessonId: string, event: "start" | "complete", duration: number) {
  const found = await lessonForStudent(user.id, lessonId);
  if (!found || !needsWatching(found.lesson)) return { ok: false as const, error: "Not available.", status: 404 };
  const now = new Date();
  if (event === "start") {
    const seconds = Math.min(Math.max(Math.round(duration) || 0, 1), 6 * 60 * 60);
    await progressCol().updateOne(
      { userId: user.id, lessonId },
      { $min: { watchStartedAt: now }, $set: { watchDuration: seconds, courseId: found.course.id, updatedAt: now }, $setOnInsert: { createdAt: now, attempts: 0 } },
      { upsert: true },
    );
    return { ok: true as const };
  }
  const p = await progressCol().findOne({ userId: user.id, lessonId });
  if (p?.watchedAt) return { ok: true as const };
  const started = p?.watchStartedAt as Date | undefined;
  const length = Number(p?.watchDuration ?? 0);
  if (!started || !length) return { ok: false as const, error: "Play the video first.", status: 409 };
  const elapsed = (now.getTime() - started.getTime()) / 1000;
  if (elapsed < length * 0.5) return { ok: false as const, error: "Keep watching: the quiz opens after the video.", status: 409 };
  await progressCol().updateOne({ userId: user.id, lessonId }, { $set: { watchedAt: now, updatedAt: now } });
  return { ok: true as const };
}

/** The quiz as students see it: no correct answers. */
export function publicQuestions(lesson: Lesson) {
  return lesson.questions.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

export type SubmitResult =
  | { ok: true; score: number; passed: boolean; wrong: string[]; courseCompleted: boolean; assignmentPending: boolean; nextLessonId: string | null }
  | { ok: false; error: string; status: number };

/** Marks a quiz (or a lesson without one) and moves the student on when they pass. */
export async function submitLesson(user: AppUser, lessonId: string, answers: Record<string, number>): Promise<SubmitResult> {
  const found = await lessonForStudent(user.id, lessonId);
  if (!found) return { ok: false, error: "This lesson isn't open for you yet.", status: 403 };
  const { course, lesson, lessons, index } = found;
  if (!lesson.quizPassed && needsWatching(lesson) && !(await hasWatched(user.id, lesson.id))) {
    return { ok: false, error: "Watch the video first. The quiz opens when you've seen it.", status: 409 };
  }

  const wrong = lesson.questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.id);
  const total = lesson.questions.length;
  const score = total === 0 ? 100 : Math.round(((total - wrong.length) / total) * 100);
  const passed = score >= PASS_MARK;

  await progressCol().updateOne(
    { userId: user.id, lessonId },
    {
      $inc: { attempts: 1 },
      $max: { bestScore: score },
      $set: { lastScore: score, courseId: course.id, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  let courseCompleted = false;
  if (passed) {
    const first = await progressCol().updateOne(
      { userId: user.id, lessonId, passed: { $ne: true } },
      { $set: { passed: true, passedAt: new Date() } },
    );
    if (first.modifiedCount) {
      await audit(user, "student.lesson_passed", `${user.name} passed “${lesson.title}” (${score}%)`, { lessonId, courseId: course.id });
    }
    if (course.state === "current") courseCompleted = await completeCourseIfDone(user, course.id);
  }
  const assignmentPending = passed && !!lesson.assignment?.required && !lesson.submitted;
  return {
    ok: true, score, passed, wrong, courseCompleted, assignmentPending,
    nextLessonId: passed && !assignmentPending ? (lessons[index + 1]?.id ?? null) : null,
  };
}

/** Lessons done / total per course the student has reached (for course cards). */
export async function pathProgress(userId: string, courses: PathCourse[]) {
  const reached = courses.filter((c) => c.state !== "locked");
  const rows = await Promise.all(reached.map((c) => lessonsWithProgress(userId, c.id)));
  return new Map(reached.map((c, i) => [c.id, { done: rows[i].filter((l) => l.state === "done").length, total: rows[i].length }]));
}
