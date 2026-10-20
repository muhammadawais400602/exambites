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

export type GrowthMonth = {
  /** "2026-10" */
  key: string;
  /** "Oct 2026" */
  label: string;
  /** Students whose payment was approved this month. */
  students: number;
  /** All approved students by the end of the month. */
  totalStudents: number;
  /** Rs received (approved payments) this month. */
  earnings: number;
};

const TZ = "Asia/Karachi";

/**
 * Month-by-month growth for the last `months` months (current month last, so
 * far), counted by when the payment was approved, in Pakistan time.
 */
export async function monthlyGrowth(months = 12): Promise<{ months: GrowthMonth[]; totalEarnings: number; totalStudents: number }> {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  const keys = Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (months - 1 - i), 1));
    return { key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) };
  });
  const rows = await db()
    .collection("enrollments")
    .aggregate<{ _id: string; students: number; earnings: number }>([
      { $match: { status: "approved" } },
      { $project: { amount: 1, month: { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$decidedAt", "$createdAt"] }, timezone: TZ } } } },
      { $group: { _id: "$month", students: { $sum: 1 }, earnings: { $sum: { $ifNull: ["$amount", 0] } } } },
    ])
    .toArray();
  const byMonth = new Map(rows.map((r) => [r._id, r]));
  let total = rows.filter((r) => r._id < keys[0].key).reduce((s, r) => s + r.students, 0);
  const list = keys.map(({ key, label }) => {
    const r = byMonth.get(key);
    total += r?.students ?? 0;
    return { key, label, students: r?.students ?? 0, totalStudents: total, earnings: r?.earnings ?? 0 };
  });
  return {
    months: list,
    totalStudents: rows.reduce((s, r) => s + r.students, 0),
    totalEarnings: rows.reduce((s, r) => s + r.earnings, 0),
  };
}
