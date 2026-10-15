import "server-only";
import { ObjectId } from "mongodb";
import { requireApiRole, type AppUser } from "./session";

export type ApiResult = { ok: true; [k: string]: unknown } | { ok: false; error: string };

export function reply(body: ApiResult, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Runs `fn` only for a signed-in admin; everyone else gets 401/403. */
export async function asAdmin(request: Request, fn: (admin: AppUser) => Promise<Response>) {
  const admin = await requireApiRole(request, "admin");
  if (admin instanceof Response) return admin;
  try {
    return await fn(admin);
  } catch (err) {
    console.error("[admin]", err);
    return reply({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  return ((await request.json().catch(() => ({}))) ?? {}) as Partial<T>;
}

export function objectId(id: string) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id ? new ObjectId(id) : null;
}
