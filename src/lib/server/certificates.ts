import "server-only";
import { ObjectId } from "mongodb";
import QRCode from "qrcode";
import { audit } from "./audit";
import { toId } from "./auth";
import { getCapstone } from "./capstone";
import { db } from "./db";
import { studentPath } from "./learning";
import { siteUrl } from "./email";

/**
 * Certificates: issued once a student has finished every core course and a
 * teacher approved their capstone. Each has a random, hard-to-guess code; the
 * QR code on it opens /verify/<code>, which anyone can use to check it.
 * The details are a snapshot taken at issue time.
 */
export const PROGRAM = "AI Skills Program";

type CertificateDoc = {
  _id: ObjectId;
  code: string;
  userId: string;
  name: string;
  program: string;
  courses: string[];
  capstoneTitle: string;
  capstoneKind: string;
  issuedAt: Date;
  revoked: boolean;
};

export type Certificate = Omit<CertificateDoc, "_id" | "issuedAt"> & { id: string; issuedAt: string };

const col = () => db().collection<CertificateDoc>("certificates");
let indexed: Promise<unknown> | null = null;
const ensureIndexes = () =>
  (indexed ??= Promise.all([col().createIndex({ code: 1 }, { unique: true }), col().createIndex({ userId: 1 }, { unique: true })]).catch((e) => {
    indexed = null;
    throw e;
  }));

const toCert = (d: CertificateDoc): Certificate => ({ ...d, id: String(d._id), issuedAt: d.issuedAt.toISOString() });

/** No look-alike characters (0/O, 1/I/L). */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function newCode(year: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `SOT-${String(year).slice(-2)}-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/** Codes are typed or scanned: ignore case, spaces and missing dashes. */
export function normaliseCode(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = raw.match(/^SOT(\d{2})([A-Z0-9]{4})([A-Z0-9]{4})$/);
  return m ? `SOT-${m[1]}-${m[2]}-${m[3]}` : null;
}

export async function certificateFor(userId: string) {
  await ensureIndexes();
  const d = await col().findOne({ userId });
  return d ? toCert(d) : null;
}

export async function certificateByCode(input: string) {
  const code = normaliseCode(input);
  if (!code) return null;
  await ensureIndexes();
  const d = await col().findOne({ code });
  return d ? toCert(d) : null;
}

/**
 * Issues the student's certificate if they've earned it (every core course
 * done, capstone approved) and don't have one yet. Safe to call repeatedly.
 */
export async function issueCertificateIfEarned(userId: string, by?: { id: string; name: string; role: "admin" | "teacher" | "student" }) {
  const existing = await certificateFor(userId);
  if (existing) return existing;
  const [path, capstone, user] = await Promise.all([
    studentPath(userId),
    getCapstone(userId),
    db().collection("user").findOne({ _id: toId(userId), role: "student" }, { projection: { name: 1 } }),
  ]);
  const core = (path?.courses ?? []).filter((c) => !c.bonus);
  if (!user || !core.length || core.some((c) => c.state !== "done") || capstone?.status !== "approved") return null;
  const now = new Date();
  for (let attempt = 0; attempt < 5; attempt++) {
    const doc: CertificateDoc = {
      _id: new ObjectId(), code: newCode(now.getFullYear()), userId, name: String(user.name), program: PROGRAM,
      courses: core.map((c) => c.title), capstoneTitle: capstone.title, capstoneKind: capstone.kind, issuedAt: now, revoked: false,
    };
    try {
      await col().insertOne(doc);
      await audit(by ?? null, "certificate.issued", `Certificate ${doc.code} issued to ${doc.name}`, { userId, code: doc.code });
      return toCert(doc);
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
      // Same student issued at the same moment, or (very rarely) a code clash: check and retry.
      const again = await certificateFor(userId);
      if (again) return again;
    }
  }
  return null;
}

export const verifyUrl = (code: string) => `${siteUrl()}/verify/${code}`;

/** The QR code for a certificate, as an SVG string. */
export function certificateQr(code: string) {
  return QRCode.toString(verifyUrl(code), { type: "svg", errorCorrectionLevel: "M", margin: 0, color: { dark: "#120d08", light: "#00000000" } });
}

/** Admin: withdraw (or restore) a certificate; the verify page then says it's not valid. */
export async function setCertificateRevoked(admin: { id: string; name: string; role: "admin" }, code: string, revoked: boolean) {
  const res = await col().updateOne({ code }, { $set: { revoked } });
  if (res.modifiedCount) await audit(admin, revoked ? "certificate.revoked" : "certificate.restored", `Certificate ${code} ${revoked ? "revoked" : "restored"}`, { code });
  return res.matchedCount > 0;
}
