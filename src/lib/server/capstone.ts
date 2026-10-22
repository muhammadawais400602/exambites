import "server-only";
import { ObjectId } from "mongodb";
import { audit } from "./audit";
import { toId } from "./auth";
import { objectIdOrNull } from "./courses";
import { db } from "./db";
import { issueCertificateIfEarned } from "./certificates";
import { studentPath } from "./learning";
import type { AppUser } from "./session";

/**
 * The capstone: once a student has finished every core course, they hand in
 * one real result: a project they made, or proof they earned money (a
 * screenshot of a payment, an order, a client review…). Teachers approve it
 * or reject it with feedback, like assignments.
 */
export const CAPSTONE_KINDS = { project: "Project", earning: "Proof of earning" } as const;
export type CapstoneKind = keyof typeof CAPSTONE_KINDS;
export type CapstoneStatus = "submitted" | "approved" | "rejected";
export type CapstoneFile = { id: string; name: string; url: string; size: number; type: string };

export const MAX_CAPSTONE_FILES = 5;
export const MAX_CAPSTONE_BYTES = 10 * 1024 * 1024;
/** Screenshots and PDFs only. */
export const CAPSTONE_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

type CapstoneDoc = {
  _id: ObjectId;
  userId: string;
  kind: CapstoneKind;
  title: string;
  description: string;
  link: string;
  files: CapstoneFile[];
  status: CapstoneStatus;
  feedback: string;
  reviewedBy: string | null;
  reviewedByName: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

export type Capstone = Omit<CapstoneDoc, "_id" | "submittedAt" | "reviewedAt"> & { id: string; submittedAt: string; reviewedAt: string | null };

const col = () => db().collection<CapstoneDoc>("capstones");

const toCapstone = (d: CapstoneDoc): Capstone => ({
  id: String(d._id), userId: d.userId, kind: d.kind, title: d.title, description: d.description ?? "", link: d.link ?? "",
  files: d.files ?? [], status: d.status, feedback: d.feedback ?? "", reviewedBy: d.reviewedBy ?? null, reviewedByName: d.reviewedByName ?? null,
  submittedAt: d.submittedAt.toISOString(), reviewedAt: d.reviewedAt ? d.reviewedAt.toISOString() : null,
});

/** Whether the capstone is open: every core (non-bonus) course is finished. */
export async function capstoneProgress(userId: string) {
  const path = await studentPath(userId);
  const core = (path?.courses ?? []).filter((c) => !c.bonus);
  const done = core.filter((c) => c.state === "done").length;
  return { enrolled: !!path, done, total: core.length, unlocked: !!path && core.length > 0 && done === core.length };
}

export async function getCapstone(userId: string) {
  const d = await col().findOne({ userId });
  return d ? toCapstone(d) : null;
}

export async function getCapstoneById(id: string) {
  const _id = objectIdOrNull(id);
  const d = _id ? await col().findOne({ _id }) : null;
  return d ? toCapstone(d) : null;
}

/** Only files the student's own upload token put in their capstone folder. */
export function isCapstoneBlob(url: string, userId: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com") && u.pathname.startsWith(`/capstone/${userId}/`);
  } catch {
    return false;
  }
}

/** Saves (or updates) the student's capstone. Editable while waiting or after a rejection; locked once approved. */
export async function saveCapstone(user: AppUser, input: Record<string, unknown>) {
  if (!(await capstoneProgress(user.id)).unlocked) return { ok: false as const, error: "Finish all your courses to open the capstone.", status: 403 };
  const kind = input.kind === "earning" ? "earning" : input.kind === "project" ? "project" : null;
  if (!kind) return { ok: false as const, error: "Choose Project or Proof of earning.", status: 422 };
  const title = String(input.title ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (title.length < 3) return { ok: false as const, error: "Give it a title.", status: 422 };
  const description = String(input.description ?? "").trim().slice(0, 5000);
  let link = String(input.link ?? "").trim().slice(0, 500);
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
  if (link && !/^https?:\/\/[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(link)) return { ok: false as const, error: "That link doesn't look like a web address.", status: 422 };
  const raw = Array.isArray(input.files) ? input.files.slice(0, MAX_CAPSTONE_FILES + 1) : [];
  if (raw.length > MAX_CAPSTONE_FILES) return { ok: false as const, error: `Add up to ${MAX_CAPSTONE_FILES} screenshots.`, status: 422 };
  const files: CapstoneFile[] = [];
  for (const f of raw as Record<string, unknown>[]) {
    const file = { id: String(f.id ?? new ObjectId()), name: String(f.name ?? "Screenshot").slice(0, 120), url: String(f.url ?? ""), size: Number(f.size), type: String(f.type ?? "") };
    if (!isCapstoneBlob(file.url, user.id) || !CAPSTONE_TYPES.includes(file.type) || !(file.size > 0 && file.size <= MAX_CAPSTONE_BYTES)) {
      return { ok: false as const, error: `“${file.name}” couldn't be attached. Upload it again.`, status: 422 };
    }
    files.push(file);
  }
  if (!link && !files.length) return { ok: false as const, error: "Add a link or at least one screenshot.", status: 422 };

  const existing = await col().findOne({ userId: user.id });
  if (existing?.status === "approved") return { ok: false as const, error: "Your capstone is already approved.", status: 409 };
  const now = new Date();
  await col().updateOne(
    { userId: user.id },
    {
      $set: { kind, title, description, link, files, status: "submitted", submittedAt: now },
      $setOnInsert: { feedback: "", reviewedBy: null, reviewedByName: null, reviewedAt: null },
    },
    { upsert: true },
  );
  await audit(user, "capstone.submitted", `${user.name} ${existing ? "updated" : "submitted"} their capstone “${title}”`, {});
  return { ok: true as const };
}

/** Teachers and the admin review capstones (all students: the capstone spans every course). */
export const canReviewCapstones = (user: AppUser) => user.role === "teacher" || user.role === "admin";

export async function reviewCapstone(reviewer: AppUser, id: string, input: { action?: unknown; feedback?: unknown }) {
  const cap = canReviewCapstones(reviewer) ? await getCapstoneById(id) : null;
  if (!cap) return { ok: false as const, error: "Capstone not found.", status: 404 };
  if (input.action !== "approve" && input.action !== "reject") return { ok: false as const, error: "Invalid request.", status: 400 };
  const approve = input.action === "approve";
  const feedback = String(input.feedback ?? "").trim().slice(0, 3000);
  if (!approve && !feedback) return { ok: false as const, error: "Tell the student what to change.", status: 422 };
  await col().updateOne({ _id: toId(id) }, {
    $set: { status: approve ? "approved" : "rejected", feedback, reviewedBy: reviewer.id, reviewedByName: reviewer.name, reviewedAt: new Date() },
  });
  const student = await db().collection("user").findOne({ _id: toId(cap.userId) }, { projection: { name: 1 } });
  await audit(reviewer, approve ? "capstone.approved" : "capstone.rejected", `${reviewer.name} ${approve ? "approved" : "rejected"} ${student?.name ?? "a student"}'s capstone “${cap.title}”`, { capstoneId: id });
  // Every core course is already done (the capstone only opens then), so approval earns the certificate.
  if (approve) await issueCertificateIfEarned(cap.userId, reviewer);
  return { ok: true as const };
}

export type CapstoneRow = Capstone & { studentName: string; studentImage: string | null };

/** Every capstone for reviewers: waiting first (oldest first), then the rest (newest first). */
export async function listCapstones(): Promise<CapstoneRow[]> {
  const docs = await col().find().limit(1000).toArray();
  if (!docs.length) return [];
  const users = await db().collection("user").find({ _id: { $in: docs.map((d) => toId(d.userId)) } }, { projection: { name: 1, image: 1 } }).toArray();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  const rank = { submitted: 0, rejected: 1, approved: 2 } as const;
  return docs
    .map((d) => ({ ...toCapstone(d), studentName: String(byId.get(d.userId)?.name ?? "Deleted user"), studentImage: (byId.get(d.userId)?.image as string | null) ?? null }))
    .sort((a, b) => rank[a.status] - rank[b.status] || (a.status === "submitted" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt)));
}

export async function capstonesWaiting() {
  return col().countDocuments({ status: "submitted" });
}
