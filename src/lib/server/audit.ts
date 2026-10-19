import "server-only";
import { db } from "./db";
import type { AppUser } from "./session";

export type AuditAction =
  | "admin.setup"
  | "enrollment.created"
  | "enrollment.approved"
  | "enrollment.rejected"
  | "teacher.added"
  | "teacher.removed"
  | "teacher.restored"
  | "teacher.password_set"
  | "referral.created"
  | "referral.updated"
  | "referral.deleted"
  | "course.created"
  | "course.updated"
  | "lesson.created"
  | "lesson.updated"
  | "lesson.deleted"
  | "student.lesson_passed"
  | "student.course_completed"
  | "student.course_started"
  | "student.file_downloaded"
  | "student.assignment_submitted"
  | "student.updated"
  | "student.password_set"
  | "student.disabled"
  | "student.restored"
  | "assignment.graded"
  | "assignment.returned"
  | "assignment.approved"
  | "assignment.rejected"
  | "capstone.submitted"
  | "capstone.approved"
  | "capstone.rejected";

/** Records who did what. Shown to the admin as the activity log. */
export async function audit(
  actor: Pick<AppUser, "id" | "name" | "role"> | null,
  action: AuditAction,
  summary: string,
  meta: Record<string, unknown> = {},
) {
  await db()
    .collection("auditLogs")
    .insertOne({
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? "System",
      actorRole: actor?.role ?? null,
      action,
      summary,
      meta,
      createdAt: new Date(),
    });
}
