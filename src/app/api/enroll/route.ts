import { randomInt } from "node:crypto";
import { checkout } from "@/content/enroll";
import { normalisePhone, type SignupFields, type SignupResponse, validateSignup } from "@/lib/enroll";

/**
 * Receives a seat sign-up and forwards it to the Google Apps Script web app
 * attached to the sign-ups sheet. The script appends a row and emails the
 * admissions inbox (see docs/signups.md).
 *
 * Env (set in Vercel → Settings → Environment Variables):
 *   SIGNUP_WEBHOOK_URL     the Apps Script web app URL ending in /exec
 *   SIGNUP_WEBHOOK_SECRET  shared secret, same value as SECRET in the script
 */
export async function POST(request: Request) {
  let body: Partial<SignupFields> & { company?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real people never see or fill this field.
  if (body.company) return json({ ok: true, reference: makeReference() });

  const fields: SignupFields = {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    phone: String(body.phone ?? ""),
    source: String(body.source ?? ""),
    method: (body.method ?? "") as SignupFields["method"],
  };
  const errors = validateSignup(fields);
  if (Object.keys(errors).length) {
    return json({ ok: false, error: "Please fix the highlighted fields.", fields: errors }, 422);
  }

  const url = process.env.SIGNUP_WEBHOOK_URL;
  const secret = process.env.SIGNUP_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.error("[enroll] SIGNUP_WEBHOOK_URL or SIGNUP_WEBHOOK_SECRET is not set");
    return json({ ok: false, error: "Online enrollment isn't open yet. Please try again soon." }, 503);
  }

  const reference = makeReference();
  const payload = {
    secret,
    reference,
    submittedAt: new Date().toISOString(),
    name: fields.name,
    email: fields.email,
    phone: `+92${normalisePhone(fields.phone)}`,
    source: fields.source,
    method: fields.method,
    amount: checkout.amount,
    // Included so the student's confirmation email can show where to pay.
    account: fields.method ? checkout.accounts[fields.method] : null,
  };

  try {
    // Apps Script answers with a redirect to the result; fetch follows it.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !out?.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (err) {
    console.error("[enroll] could not record sign-up", err);
    return json({ ok: false, error: "We couldn't save your seat. Please try again in a minute." }, 502);
  }

  return json({ ok: true, reference });
}

/** Short reference the student quotes with their payment, e.g. EXB-4K7Q2M. */
function makeReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[randomInt(alphabet.length)];
  return `EXB-${s}`;
}

function json(body: SignupResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
