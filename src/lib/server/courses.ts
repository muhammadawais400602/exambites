import "server-only";
import { ObjectId } from "mongodb";
import { courses as catalogue } from "@/content/courses";
import { db } from "./db";

/** Share of quiz questions a student must get right to pass a lesson. */
export const PASS_MARK = 80;

export type Question = { id: string; prompt: string; options: string[]; answer: number };

export type CourseDoc = {
  _id: ObjectId;
  slug: string;
  title: string;
  category: string;
  description: string;
  order: number;
  bonus: boolean;
  published: boolean;
  /** Teachers assigned to this course: they see its students' progress. */
  teacherIds?: string[];
  createdAt: Date;
};

export type LessonDoc = {
  _id: ObjectId;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  /** Bunny Stream video GUID, empty until the video is uploaded. */
  videoId: string;
  notes: string;
  questions: Question[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Course = Omit<CourseDoc, "_id" | "createdAt"> & { id: string };
export type Lesson = Omit<LessonDoc, "_id" | "createdAt" | "updatedAt"> & { id: string };

const courseCol = () => db().collection<CourseDoc>("courses");
const lessonCol = () => db().collection<LessonDoc>("lessons");
const progressCol = () => db().collection("progress");

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const toCourse = (d: CourseDoc): Course => ({
  id: String(d._id), slug: d.slug, title: d.title, category: d.category, description: d.description ?? "",
  order: d.order, bonus: !!d.bonus, published: !!d.published, teacherIds: d.teacherIds ?? [],
});
const toLesson = (d: LessonDoc): Lesson => ({
  id: String(d._id), courseId: d.courseId, order: d.order, title: d.title, summary: d.summary ?? "",
  videoId: d.videoId ?? "", notes: d.notes ?? "", questions: d.questions ?? [], published: !!d.published,
});

let seeded: Promise<void> | null = null;

/** Creates the six catalogue courses the first time, and the indexes. */
export function ensureCourses() {
  seeded ??= (async () => {
    await Promise.all([
      courseCol().createIndex({ slug: 1 }, { unique: true }),
      lessonCol().createIndex({ courseId: 1, order: 1 }),
      progressCol().createIndex({ userId: 1, lessonId: 1 }, { unique: true }),
      progressCol().createIndex({ userId: 1, courseId: 1 }),
    ]);
    if ((await courseCol().estimatedDocumentCount()) > 0) return;
    const now = new Date();
    await courseCol()
      .insertMany(
        catalogue.map((c, i) => ({
          _id: new ObjectId(),
          slug: slugify(c.title),
          title: c.title,
          category: c.category,
          description: c.body,
          order: i + 1,
          bonus: !!c.bonus,
          published: true,
          createdAt: now,
        })),
        { ordered: false },
      )
      .catch((err) => {
        // Another server instance seeded at the same moment.
        if ((err as { code?: number }).code !== 11000) throw err;
      });
  })().catch((err) => {
    seeded = null;
    throw err;
  });
  return seeded;
}

export function objectIdOrNull(id: string) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id ? new ObjectId(id) : null;
}

export async function listCourses({ publishedOnly = false } = {}) {
  await ensureCourses();
  const docs = await courseCol().find(publishedOnly ? { published: true } : {}).sort({ order: 1 }).toArray();
  return docs.map(toCourse);
}

export async function getCourse(idOrSlug: string) {
  await ensureCourses();
  const _id = objectIdOrNull(idOrSlug);
  const doc = await courseCol().findOne(_id ? { _id } : { slug: idOrSlug });
  return doc ? toCourse(doc) : null;
}

export async function listLessons(courseId: string, { publishedOnly = false } = {}) {
  const docs = await lessonCol()
    .find({ courseId, ...(publishedOnly ? { published: true } : {}) })
    .sort({ order: 1 })
    .toArray();
  return docs.map(toLesson);
}

export async function coursesForTeacher(teacherId: string) {
  await ensureCourses();
  const docs = await courseCol().find({ teacherIds: teacherId }).sort({ order: 1 }).toArray();
  return docs.map(toCourse);
}

export async function getLesson(id: string) {
  const _id = objectIdOrNull(id);
  const doc = _id ? await lessonCol().findOne({ _id }) : null;
  return doc ? toLesson(doc) : null;
}

export async function lessonCounts() {
  const rows = await lessonCol()
    .aggregate<{ _id: string; total: number; published: number }>([
      { $group: { _id: "$courseId", total: { $sum: 1 }, published: { $sum: { $cond: ["$published", 1, 0] } } } },
    ])
    .toArray();
  return new Map(rows.map((r) => [r._id, r]));
}

export { courseCol, lessonCol, progressCol };
