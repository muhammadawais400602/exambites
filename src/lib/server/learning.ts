import "server-only";
import { audit } from "./audit";
import { getLesson, listCourses, listLessons, PASS_MARK, progressCol, type Course, type Lesson } from "./courses";
import { db } from "./db";
import type { AppUser } from "./session";

/**
 * How a student moves through the academy: one payment covers every course,
 * but only one course is open at a time. The first core course is mandatory;
 * after each completed course the student picks the next one. Bonus courses
 * open once every core course is done.
 */
export type CourseState = "current" | "done" | "choose" | "locked";
export type LessonState = "done" | "open" | "locked";

export type PathCourse = Course & { state: CourseState };

const enrollments = () => db().collection("enrollments");

export async function studentPath(userId: string) {
  const enrollment = await enrollments().findOne({ userId, status: "approved" });
  if (!enrollment) return null;
  const courses = await listCourses({ publishedOnly: true });
  const completed: string[] = enrollment.completedCourseIds ?? [];
  let current: string | null = enrollment.currentCourseId ?? null;
  const core = courses.filter((c) => !c.bonus);

  if (!current && completed.length === 0 && core[0]) {
    current = core[0].id;
    await enrollments().updateOne({ _id: enrollment._id, currentCourseId: null }, { $set: { currentCourseId: current } });
  }
  const coreDone = core.every((c) => completed.includes(c.id));
  const path: PathCourse[] = courses.map((c) => {
    const state: CourseState = completed.includes(c.id)
      ? "done"
      : c.id === current
        ? "current"
        : current
          ? "locked"
          : c.bonus && !coreDone
            ? "locked"
            : "choose";
    return { ...c, state };
  });
  return { courses: path, currentId: current, completed };
}

/** Lessons of a course with the student's progress: each opens once the one before is passed. */
export async function lessonsWithProgress(userId: string, courseId: string) {
  const [lessons, passed] = await Promise.all([
    listLessons(courseId, { publishedOnly: true }),
    progressCol()
      .find({ userId, courseId, passed: true }, { projection: { lessonId: 1 } })
      .toArray()
      .then((rows) => new Set(rows.map((r) => String(r.lessonId)))),
  ]);
  let open = true;
  return lessons.map((l) => {
    const done = passed.has(l.id);
    const state: LessonState = done ? "done" : open ? "open" : "locked";
    if (!done) open = false;
    return { ...l, state };
  });
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

/** The quiz as students see it: no correct answers. */
export function publicQuestions(lesson: Lesson) {
  return lesson.questions.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

export type SubmitResult =
  | { ok: true; score: number; passed: boolean; wrong: string[]; courseCompleted: boolean; nextLessonId: string | null }
  | { ok: false; error: string; status: number };

/** Marks a quiz (or a lesson without one) and moves the student on when they pass. */
export async function submitLesson(user: AppUser, lessonId: string, answers: Record<string, number>): Promise<SubmitResult> {
  const found = await lessonForStudent(user.id, lessonId);
  if (!found) return { ok: false, error: "This lesson isn't open for you yet.", status: 403 };
  const { course, lesson, lessons, index } = found;

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
    const allDone = lessons.every((l) => l.id === lesson.id || l.state === "done");
    if (allDone && course.state === "current") {
      const done = await enrollments().updateOne(
        { userId: user.id, status: "approved", currentCourseId: course.id },
        { $set: { currentCourseId: null }, $addToSet: { completedCourseIds: course.id } },
      );
      if (done.modifiedCount) {
        courseCompleted = true;
        await audit(user, "student.course_completed", `${user.name} completed ${course.title}`, { courseId: course.id });
      }
    }
  }
  return { ok: true, score, passed, wrong, courseCompleted, nextLessonId: passed ? (lessons[index + 1]?.id ?? null) : null };
}

/** Starts the course the student picked after finishing their last one. */
export async function chooseNextCourse(user: AppUser, courseId: string) {
  const path = await studentPath(user.id);
  const course = path?.courses.find((c) => c.id === courseId);
  if (!course || course.state !== "choose") return { ok: false as const, error: "You can't start this course right now." };
  const res = await enrollments().updateOne(
    { userId: user.id, status: "approved", currentCourseId: null },
    { $set: { currentCourseId: course.id } },
  );
  if (!res.modifiedCount) return { ok: false as const, error: "Finish your current course first." };
  await audit(user, "student.course_started", `${user.name} started ${course.title}`, { courseId: course.id });
  return { ok: true as const, slug: course.slug };
}

