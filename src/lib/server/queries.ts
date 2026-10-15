import "server-only";
import { db, ensureIndexes } from "./db";

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export type EnrollmentRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  reference: string;
  amount: number;
  referralCode: string | null;
  method: string;
  source: string;
  status: EnrollmentStatus;
  note: string;
  createdAt: string;
  decidedAt: string | null;
};

export type TeacherRow = { id: string; name: string; email: string; disabled: boolean; createdAt: string };

export type ReferralRow = {
  code: string;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  active: boolean;
  expired: boolean;
  note: string;
  createdAt: string;
};

export type AuditRow = { id: string; actorName: string; actorRole: string | null; action: string; summary: string; createdAt: string };

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : d ? String(d) : null);

/** The student's own enrollment, if they have one. */
export async function getEnrollment(userId: string) {
  const e = await db().collection("enrollments").findOne({ userId });
  if (!e) return null;
  return {
    reference: String(e.reference),
    amount: Number(e.amount),
    method: String(e.method),
    status: e.status as EnrollmentStatus,
    note: String(e.note ?? ""),
    createdAt: iso(e.createdAt)!,
  };
}

export async function listEnrollments(status?: EnrollmentStatus): Promise<EnrollmentRow[]> {
  await ensureIndexes();
  const rows = await db()
    .collection("enrollments")
    .aggregate([
      { $match: status ? { status } : {} },
      { $sort: { createdAt: -1 } },
      { $limit: 500 },
      { $lookup: { from: "user", let: { uid: { $toObjectId: "$userId" } }, pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$uid"] } } }], as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();
  return rows.map((r) => ({
    id: String(r._id),
    userId: String(r.userId),
    name: String(r.u?.name ?? "Deleted user"),
    email: String(r.u?.email ?? ""),
    phone: String(r.u?.phone ?? ""),
    reference: String(r.reference),
    amount: Number(r.amount),
    referralCode: r.referralCode ?? null,
    method: String(r.method),
    source: String(r.source ?? ""),
    status: r.status,
    note: String(r.note ?? ""),
    createdAt: iso(r.createdAt)!,
    decidedAt: iso(r.decidedAt),
  }));
}

export async function listTeachers(): Promise<TeacherRow[]> {
  const rows = await db().collection("user").find({ role: "teacher" }).sort({ createdAt: -1 }).toArray();
  return rows.map((t) => ({
    id: String(t._id),
    name: String(t.name),
    email: String(t.email),
    disabled: !!t.disabled,
    createdAt: iso(t.createdAt)!,
  }));
}

export async function listReferralCodes(): Promise<ReferralRow[]> {
  const rows = await db().collection("referralCodes").find().sort({ createdAt: -1 }).toArray();
  const now = new Date();
  return rows.map((c) => ({
    code: String(c.code),
    maxUses: Number(c.maxUses),
    uses: Number(c.uses),
    expiresAt: iso(c.expiresAt),
    active: !!c.active,
    expired: c.expiresAt instanceof Date && c.expiresAt < now,
    note: String(c.note ?? ""),
    createdAt: iso(c.createdAt)!,
  }));
}

export async function listAudit(limit = 100): Promise<AuditRow[]> {
  const rows = await db().collection("auditLogs").find().sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((a) => ({
    id: String(a._id),
    actorName: String(a.actorName),
    actorRole: a.actorRole ?? null,
    action: String(a.action),
    summary: String(a.summary),
    createdAt: iso(a.createdAt)!,
  }));
}

export async function adminStats() {
  await ensureIndexes();
  const [pending, approved, teachers, codes] = await Promise.all([
    db().collection("enrollments").countDocuments({ status: "pending" }),
    db().collection("enrollments").countDocuments({ status: "approved" }),
    db().collection("user").countDocuments({ role: "teacher", disabled: { $ne: true } }),
    db().collection("referralCodes").countDocuments({ active: true }),
  ]);
  return { pending, approved, teachers, codes };
}
