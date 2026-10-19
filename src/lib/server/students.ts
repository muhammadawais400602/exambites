import "server-only";
import { audit } from "./audit";
import { toId } from "./auth";
import { coursesForTeacher } from "./courses";
import { db } from "./db";
import type { AppUser } from "./session";
import { passwordProblem, setPassword, signOutEverywhere } from "./users";

/**
 * Student records that teachers and the admin manage: school details
 * (registration number, campus, class, section) and the account itself
 * (name, password, disabled). Teachers can only manage students on, or
 * finished with, one of their courses.
 */
export type SchoolInfo = { regNo: string; campus: string; className: string; section: string };

export const SCHOOL_LIMITS: Record<keyof SchoolInfo, number> = { regNo: 40, campus: 80, className: 40, section: 20 };
const SCHOOL_LABELS: Record<keyof SchoolInfo, string> = { regNo: "Reg No", campus: "Campus", className: "Class", section: "Section" };
const SCHOOL_KEYS = Object.keys(SCHOOL_LIMITS) as (keyof SchoolInfo)[];

export type StudentRow = SchoolInfo & {
  id: string;
  name: string;
  email: string;
  image: string | null;
  disabled: boolean;
  /** The teacher's course the student is on now (or finished last), for the progress link. */
  courseId: string;
  courseTitle: string;
  status: "studying" | "completed";
};

const schoolCol = () => db().collection("studentInfo");
const enrollments = () => db().collection("enrollments");

/** Enrollment filter: approved students on, or finished with, one of these courses. */
const onCourses = (ids: string[]) => ({ status: "approved", $or: [{ currentCourseId: { $in: ids } }, { completedCourseIds: { $in: ids } }] });

/** Every student a teacher looks after, with school details and course status. */
export async function teacherStudents(teacherId: string): Promise<StudentRow[]> {
  const courses = await coursesForTeacher(teacherId);
  if (!courses.length) return [];
  const ids = courses.map((c) => c.id);
  const rows = await enrollments().find(onCourses(ids), { projection: { userId: 1, currentCourseId: 1, completedCourseIds: 1 } }).toArray();
  if (!rows.length) return [];
  const userIds = rows.map((e) => String(e.userId));
  const [users, info] = await Promise.all([
    db().collection("user").find({ _id: { $in: userIds.map(toId) }, role: "student" }, { projection: { name: 1, email: 1, image: 1, disabled: 1 } }).toArray(),
    schoolCol().find({ userId: { $in: userIds } }).toArray(),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const infoById = new Map(info.map((i) => [String(i.userId), i]));
  const titles = new Map(courses.map((c) => [c.id, c.title]));
  return rows.flatMap((e) => {
    const uid = String(e.userId);
    const u = userById.get(uid);
    if (!u) return [];
    const current = ids.includes(String(e.currentCourseId)) ? String(e.currentCourseId) : null;
    // Last of the teacher's courses they finished (courses are in path order).
    const finished = ids.filter((id) => (e.completedCourseIds ?? []).includes(id)).at(-1) ?? ids[0];
    const courseId = current ?? finished;
    const i = infoById.get(uid);
    return [{
      id: uid,
      name: String(u.name),
      email: String(u.email),
      image: (u.image as string | null) ?? null,
      disabled: !!u.disabled,
      regNo: String(i?.regNo ?? ""),
      campus: String(i?.campus ?? ""),
      className: String(i?.className ?? ""),
      section: String(i?.section ?? ""),
      courseId,
      courseTitle: titles.get(courseId) ?? "",
      status: current ? "studying" : "completed",
    } satisfies StudentRow];
  });
}

export async function getSchoolInfo(userId: string): Promise<SchoolInfo> {
  const i = await schoolCol().findOne({ userId });
  return { regNo: String(i?.regNo ?? ""), campus: String(i?.campus ?? ""), className: String(i?.className ?? ""), section: String(i?.section ?? "") };
}

/** One student's record for a single-student page (course fields left empty). */
export async function studentRecord(userId: string): Promise<StudentRow | null> {
  const u = await db().collection("user").findOne({ _id: toId(userId), role: "student" }, { projection: { name: 1, email: 1, image: 1, disabled: 1 } });
  if (!u) return null;
  const e = await enrollments().findOne({ userId }, { projection: { currentCourseId: 1 } });
  return {
    id: userId, name: String(u.name), email: String(u.email), image: (u.image as string | null) ?? null, disabled: !!u.disabled,
    ...(await getSchoolInfo(userId)),
    courseId: "", courseTitle: "", status: e?.currentCourseId ? "studying" : "completed",
  };
}

/** The student, if this teacher or admin may manage them. */
export async function manageableStudent(actor: AppUser, studentId: string) {
  const _id = toId(studentId);
  if (!_id) return null;
  const student = await db().collection("user").findOne({ _id, role: "student" }, { projection: { name: 1, email: 1, disabled: 1 } });
  if (!student) return null;
  if (actor.role === "admin") return student;
  if (actor.role !== "teacher") return null;
  const courses = await coursesForTeacher(actor.id);
  if (!courses.length) return null;
  const ok = await enrollments().countDocuments({ userId: studentId, ...onCourses(courses.map((c) => c.id)) }, { limit: 1 });
  return ok ? student : null;
}

/** Name and/or school details. Only the fields sent are changed. */
export async function updateStudent(actor: AppUser, studentId: string, input: Record<string, unknown>) {
  const student = await manageableStudent(actor, studentId);
  if (!student) return { ok: false as const, error: "Student not found.", status: 404 };
  const set: Record<string, string> = {};
  for (const k of SCHOOL_KEYS) {
    if (input[k] === undefined) continue;
    const v = String(input[k]).trim().replace(/\s+/g, " ");
    if (v.length > SCHOOL_LIMITS[k]) return { ok: false as const, error: `${SCHOOL_LABELS[k]} is too long.`, status: 422 };
    set[k] = v;
  }
  let name: string | null = null;
  if (input.name !== undefined) {
    name = String(input.name).trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 60) return { ok: false as const, error: "Enter a name (2–60 characters).", status: 422 };
  }
  if (Object.keys(set).length) {
    await schoolCol().updateOne(
      { userId: studentId },
      { $set: { ...set, updatedAt: new Date(), updatedBy: actor.id }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
  if (name) await db().collection("user").updateOne({ _id: student._id }, { $set: { name, updatedAt: new Date() } });
  const changed = [...(name ? ["name"] : []), ...Object.keys(set).map((k) => SCHOOL_LABELS[k as keyof SchoolInfo])];
  if (changed.length) await audit(actor, "student.updated", `${actor.name} updated ${name ?? student.name}'s ${changed.join(", ")}`, { userId: studentId });
  return { ok: true as const };
}

export async function resetStudentPassword(actor: AppUser, studentId: string, password: string) {
  const student = await manageableStudent(actor, studentId);
  if (!student) return { ok: false as const, error: "Student not found.", status: 404 };
  const problem = passwordProblem(password);
  if (problem) return { ok: false as const, error: problem, status: 422 };
  await setPassword(studentId, password);
  await audit(actor, "student.password_set", `${actor.name} set a new password for ${student.name}`, { userId: studentId });
  return { ok: true as const };
}

/** Blocks (or restores) a student's login. Blocking also ends their sessions. */
export async function setStudentDisabled(actor: AppUser, studentId: string, disabled: boolean) {
  const student = await manageableStudent(actor, studentId);
  if (!student) return { ok: false as const, error: "Student not found.", status: 404 };
  await db().collection("user").updateOne({ _id: student._id }, { $set: { disabled, updatedAt: new Date() } });
  if (disabled) await signOutEverywhere(studentId);
  await audit(actor, disabled ? "student.disabled" : "student.restored", `${actor.name} ${disabled ? "disabled" : "restored"} ${student.name}'s account`, { userId: studentId });
  return { ok: true as const };
}
