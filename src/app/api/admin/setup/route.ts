import { timingSafeEqual } from "node:crypto";
import { audit } from "@/lib/server/audit";
import { getAuth } from "@/lib/server/auth";
import { db, describeDbError, ensureIndexes } from "@/lib/server/db";
import { readJson, reply } from "@/lib/server/admin-api";
import { createUserWithPassword, EmailTakenError } from "@/lib/server/users";

/**
 * Creates the first admin account. Only works while no admin exists and only
 * with the ADMIN_SETUP_TOKEN from the server settings, so it is safe to leave
 * the page deployed.
 */
export async function POST(request: Request) {
  try {
    return await setup(request);
  } catch (err) {
    console.error("[admin/setup]", err);
    // Only someone holding the setup token gets this far, so naming the cause is safe.
    return reply({ ok: false, error: describeDbError(err) ?? "Server error. Check the Vercel logs for /api/admin/setup." }, 500);
  }
}

async function setup(request: Request) {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  const body = await readJson<{ token: string; name: string; email: string; password: string }>(request);
  if (!expected) return reply({ ok: false, error: "Setup is not enabled on this server." }, 503);
  if (!sameSecret(String(body.token ?? ""), expected)) return reply({ ok: false, error: "Wrong setup token." }, 403);

  await ensureIndexes();
  if (await db().collection("user").findOne({ role: "admin" })) {
    return reply({ ok: false, error: "An admin already exists. Log in instead." }, 409);
  }
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (name.length < 2) return reply({ ok: false, error: "Enter your name." }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: "Enter a valid email." }, 422);
  if (password.length < 12) return reply({ ok: false, error: "Use a password of at least 12 characters." }, 422);

  try {
    const user = await createUserWithPassword({ name, email, password, role: "admin" });
    await audit({ id: user.id, name, role: "admin" }, "admin.setup", `${name} created the admin account`);
  } catch (err) {
    if (err instanceof EmailTakenError) return reply({ ok: false, error: "That email already has an account." }, 409);
    throw err;
  }

  const signIn = await getAuth().api.signInEmail({ body: { email, password }, headers: request.headers, asResponse: true });
  const res = reply({ ok: true });
  for (const cookie of signIn.headers.getSetCookie()) res.headers.append("Set-Cookie", cookie);
  return res;
}

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
