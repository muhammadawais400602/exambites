import "server-only";
import type { Role } from "@/lib/roles";
import { getAuth } from "./auth";

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
