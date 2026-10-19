import "server-only";
import { Binary } from "mongodb";
import { toId } from "./auth";
import { db } from "./db";

/**
 * Profiles. The name and picture are public (shown wherever the person
 * appears); everything else here is private: only the person and the admin
 * see it.
 */
export type PrivateProfile = {
  /** School details (students only). */
  regNo: string;
  campus: string;
  className: string;
  section: string;
  city: string;
  bio: string;
  skills: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  website: string;
};

export const PROFILE_LIMITS: Record<keyof PrivateProfile, number> = {
  regNo: 40,
  campus: 80,
  className: 40,
  section: 20,
  city: 60,
  bio: 600,
  skills: 200,
  linkedin: 200,
  instagram: 200,
  facebook: 200,
  website: 200,
};

const EMPTY: PrivateProfile = { regNo: "", campus: "", className: "", section: "", city: "", bio: "", skills: "", linkedin: "", instagram: "", facebook: "", website: "" };

const LABELS: Record<keyof PrivateProfile, string> = {
  regNo: "Registration number", campus: "Campus", className: "Class", section: "Section", city: "City", bio: "About you",
  skills: "Skills", linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", website: "Website",
};

const profiles = () => db().collection("profiles");
const avatars = () => db().collection("avatars");

export async function getProfile(userId: string): Promise<PrivateProfile> {
  const doc = await profiles().findOne({ userId });
  const out = { ...EMPTY };
  for (const k of Object.keys(EMPTY) as (keyof PrivateProfile)[]) out[k] = String(doc?.[k] ?? "");
  return out;
}

/** Keeps known fields, trims them, and checks links look like web addresses. */
export function cleanProfile(input: Record<string, unknown>): PrivateProfile | string {
  const out = { ...EMPTY };
  for (const k of Object.keys(EMPTY) as (keyof PrivateProfile)[]) {
    const v = String(input[k] ?? "").trim();
    if (v.length > PROFILE_LIMITS[k]) return `${LABELS[k]} is too long.`;
    out[k] = v;
  }
  for (const k of ["linkedin", "instagram", "facebook", "website"] as const) {
    if (out[k] && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(out[k])) return `The ${k} link doesn't look like a web address.`;
    if (out[k] && !/^https?:\/\//i.test(out[k])) out[k] = `https://${out[k]}`;
  }
  return out;
}

export async function saveProfile(userId: string, p: PrivateProfile) {
  await profiles().updateOne({ userId }, { $set: { ...p, updatedAt: new Date() } }, { upsert: true });
}

const MAX_AVATAR = 300 * 1024;

/** Recognises the image types we accept from the first bytes, so the label can't lie. */
function sniff(buf: Buffer): string | null {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  return null;
}

export async function saveAvatar(userId: string, buf: Buffer) {
  if (!buf.length || buf.length > MAX_AVATAR) return "Picture is too large. Try a smaller one.";
  const type = sniff(buf);
  if (!type) return "Use a JPG, PNG or WebP picture.";
  const now = new Date();
  await avatars().updateOne({ userId }, { $set: { data: new Binary(buf), type, updatedAt: now } }, { upsert: true });
  const image = `/api/avatars/${userId}?v=${now.getTime()}`;
  await db().collection("user").updateOne({ _id: toId(userId) }, { $set: { image, updatedAt: now } });
  return { image };
}

export async function removeAvatar(userId: string) {
  await avatars().deleteOne({ userId });
  await db().collection("user").updateOne({ _id: toId(userId) }, { $set: { image: null, updatedAt: new Date() } });
}

export async function readAvatar(userId: string) {
  const doc = await avatars().findOne({ userId });
  return doc ? { data: Buffer.from((doc.data as Binary).buffer), type: String(doc.type) } : null;
}
