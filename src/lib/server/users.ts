import "server-only";
import type { Role } from "@/lib/roles";
import { randomBytes } from "node:crypto";
import { getAuth } from "./auth";
import { sendEmail, siteUrl } from "./email";

export class EmailTakenError extends Error {}

/**
 * Creates a user with an email + password login. Public sign-up is disabled,
 * so this is the only way accounts are made: enrollment (students), the
 * admin panel (teachers) and first-time setup (admin).
 */
export async function createUserWithPassword(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string | null;
}) {
  const ctx = await getAuth().$context;
  const email = input.email.trim().toLowerCase();
  if (await ctx.internalAdapter.findUserByEmail(email)) throw new EmailTakenError(email);

  const user = await ctx.internalAdapter.createUser({
    name: input.name.trim(),
    email,
    // Staff are added by the admin; a student's email is confirmed when their payment is matched.
    emailVerified: input.role !== "student",
    role: input.role,
    phone: input.phone ?? null,
    disabled: false,
  }, { method: input.role === "student" ? "email-password" : "admin" });
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(input.password),
  });
  return user;
}

/** Ends every session of a user, e.g. when a teacher is removed. */
export async function signOutEverywhere(userId: string) {
  const ctx = await getAuth().$context;
  await ctx.internalAdapter.deleteUserSessions(userId);
}

export function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Buffer.from(bytes).toString("base64url");
}

const INVITE_DAYS = 7;

/**
 * Makes a set-password link for a staff member and tries to email it. The
 * link is returned too, so the admin can send it another way (e.g. WhatsApp)
 * when email isn't set up or doesn't arrive. Uses Better Auth's own
 * reset-password token, so /reset-password accepts it as usual.
 */
export async function inviteStaff(user: { id: string; name: string; email: string }) {
  const ctx = await getAuth().$context;
  const token = randomBytes(18).toString("base64url");
  await ctx.internalAdapter.createVerificationValue({
    identifier: `reset-password:${token}`,
    value: user.id,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
  });
  const link = `${siteUrl()}/reset-password?token=${token}`;
  let emailed = true;
  try {
    await sendEmail({
      to: user.email,
      subject: "You're invited to teach at School of Tomorrow",
      text: `Assalam o Alaikum ${user.name},\n\nYou've been added as a teacher at School of Tomorrow. Set your password here (valid for ${INVITE_DAYS} days):\n${link}\n\nThen log in at ${siteUrl()}/login?as=teacher\n\nSchool of Tomorrow`,
    });
  } catch {
    emailed = false;
  }
  return { link, emailed };
}

/** Sets a staff member's password directly (admin-chosen) and signs them out elsewhere. */
export async function setPassword(userId: string, password: string) {
  const ctx = await getAuth().$context;
  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(password));
  await ctx.internalAdapter.deleteUserSessions(userId);
}

export function passwordProblem(password: string) {
  if (password.length < 8) return "Use a password of at least 8 characters.";
  if (password.length > 128) return "That password is too long.";
  return null;
}
