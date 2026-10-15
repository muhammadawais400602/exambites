import "server-only";
import { db } from "./db";

export type ReferralCode = {
  code: string;
  maxUses: number;
  uses: number;
  expiresAt: Date | null;
  active: boolean;
  note: string;
  createdAt: Date;
  createdBy: string;
};

export const normaliseCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, "");

/** Filter for a code that can still be used right now. */
function usable(code: string) {
  const now = new Date();
  return {
    code,
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    $expr: { $lt: ["$uses", "$maxUses"] },
  };
}

export async function isCodeUsable(raw: string) {
  const code = normaliseCode(raw);
  if (!code) return false;
  return !!(await db().collection("referralCodes").findOne(usable(code)));
}

/**
 * Takes one use of a code atomically, so two people can't squeeze past the
 * limit at the same moment. Returns false if the code is unknown, inactive,
 * expired or used up.
 */
export async function claimCode(raw: string) {
  const code = normaliseCode(raw);
  const res = await db().collection("referralCodes").findOneAndUpdate(usable(code), { $inc: { uses: 1 } });
  return !!res;
}

/** Gives a use back, e.g. when the sign-up failed after the code was claimed. */
export async function releaseCode(raw: string) {
  await db()
    .collection("referralCodes")
    .updateOne({ code: normaliseCode(raw), uses: { $gt: 0 } }, { $inc: { uses: -1 } });
}
