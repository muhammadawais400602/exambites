import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HOME, LOGIN, type Role } from "@/lib/roles";
import { getAuth } from "./auth";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  disabled?: boolean | null;
};

function asAppUser(user: Record<string, unknown> | undefined | null): AppUser | null {
  if (!user) return null;
  const role = (user.role as Role) || "student";
  return { ...(user as unknown as AppUser), role };
}

/** The signed-in user for the current request, or null. */
export async function currentUser(): Promise<AppUser | null> {
  // Read the request first so prerendering stops here instead of opening the database.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  return asAppUser(session?.user);
}

/**
 * For pages: sends visitors without a session to the role's login page, and
 * users with a different role to their own home.
 */
export async function requireRole(role: Role): Promise<AppUser> {
  const user = await currentUser();
  if (!user || user.disabled) redirect(LOGIN[role]);
  if (user.role !== role) redirect(HOME[user.role]);
  return user;
}

/** For route handlers: the user if they have the role, otherwise a JSON error response. */
export async function requireApiRole(request: Request, role: Role): Promise<AppUser | Response> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  const user = asAppUser(session?.user);
  if (!user) return Response.json({ ok: false, error: "Please log in." }, { status: 401 });
  if (user.role !== role || user.disabled) return Response.json({ ok: false, error: "Not allowed." }, { status: 403 });
  return user;
}
