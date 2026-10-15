import { randomInt } from "node:crypto";
import { checkout } from "@/content/enroll";
import { normalisePhone, type SignupFields, type SignupResponse, validateSignup } from "@/lib/enroll";
import { formatRs, PRICE, REFERRAL_PRICE } from "@/lib/pricing";
import { audit } from "@/lib/server/audit";
import { getAuth } from "@/lib/server/auth";
import { db, ensureIndexes } from "@/lib/server/db";
import { sendEmail, siteUrl } from "@/lib/server/email";
import { claimCode, normaliseCode, releaseCode } from "@/lib/server/referrals";
import { createUserWithPassword, EmailTakenError } from "@/lib/server/users";

/**
 * Student sign-up. Creates the account (locked until the admin approves the
 * payment), records the enrollment with its price, signs the student in,
 * and emails the student and the admissions inbox.
 *
 * Env: MONGODB_URI, BETTER_AUTH_SECRET, BETTER_AUTH_URL; optional
 * RESEND_API_KEY + EMAIL_FROM, ADMIN_NOTIFY_EMAIL, SIGNUP_WEBHOOK_URL +
 * SIGNUP_WEBHOOK_SECRET (Google Sheet copy, see docs/signups.md).
 */
export async function POST(request: Request) {
  let body: Partial<SignupFields> & { company?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real people never see or fill this field.
  if (body.company) return json({ ok: true, reference: makeReference(), amount: PRICE });

  const fields: SignupFields = {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    phone: String(body.phone ?? ""),
    password: String(body.password ?? ""),
    referralCode: normaliseCode(String(body.referralCode ?? "")),
    source: String(body.source ?? ""),
    method: (body.method ?? "") as SignupFields["method"],
  };
  const errors = validateSignup(fields);
  if (Object.keys(errors).length) {
    return json({ ok: false, error: "Please fix the highlighted fields.", fields: errors }, 422);
  }
  if (!process.env.MONGODB_URI || !process.env.BETTER_AUTH_SECRET) {
    console.error("[enroll] MONGODB_URI or BETTER_AUTH_SECRET is not set");
    return json({ ok: false, error: "Online enrollment isn't open yet. Please try again soon." }, 503);
  }
  await ensureIndexes();

  // Claim the referral code first, so its use limit holds even under load.
  const code = fields.referralCode;
  if (code && !(await claimCode(code))) {
    return json(
      { ok: false, error: "That referral code isn't valid.", fields: { referralCode: "Invalid, expired or fully used." } },
      422,
    );
  }
  const amount = code ? REFERRAL_PRICE : PRICE;
  const phone = `+92${normalisePhone(fields.phone)}`;

  let userId: string;
  try {
    const user = await createUserWithPassword({ ...fields, phone, role: "student" });
    userId = user.id;
  } catch (err) {
    if (code) await releaseCode(code);
    if (err instanceof EmailTakenError) {
      return json(
        { ok: false, error: "An account with this email already exists.", fields: { email: "Already registered. Log in instead." } },
        409,
      );
    }
    console.error("[enroll] could not create account", err);
    return json({ ok: false, error: "We couldn't create your account. Please try again in a minute." }, 500);
  }

  const reference = makeReference();
  await db().collection("enrollments").insertOne({
    userId,
    reference,
    amount,
    referralCode: code || null,
    method: fields.method,
    source: fields.source,
    status: "pending",
    createdAt: new Date(),
  });
  await audit(null, "enrollment.created", `${fields.name} signed up (${formatRs(amount)}${code ? `, code ${code}` : ""})`, {
    userId,
    reference,
  });

  // Side effects that must not block the sign-up.
  await Promise.allSettled([
    notifyStudent(fields, reference, amount),
    notifyAdmin(fields, reference, amount, code),
    copyToSheet(fields, reference, amount, phone),
  ]);

  // Sign the new student in so they land on their portal straight away.
  const signIn = await getAuth().api.signInEmail({
    body: { email: fields.email, password: fields.password },
    headers: request.headers,
    asResponse: true,
  });
  const res = json({ ok: true, reference, amount });
  for (const cookie of signIn.headers.getSetCookie()) res.headers.append("Set-Cookie", cookie);
  return res;
}

function paymentLines(method: SignupFields["method"]) {
  const account = method ? checkout.accounts[method] : null;
  return account?.number
    ? `Account title: ${account.title}\nAccount / IBAN: ${account.number}`
    : `We'll email the ${method} account details shortly.`;
}

async function notifyStudent(f: SignupFields, reference: string, amount: number) {
  await sendEmail({
    to: f.email,
    subject: `Your Exambites seat reference: ${reference}`,
    text: [
      `Assalam o Alaikum ${f.name},`,
      "",
      "Your Exambites account is created and waiting for payment.",
      "",
      `Seat reference: ${reference}`,
      `Amount: ${formatRs(amount)}`,
      `Pay with: ${f.method}`,
      paymentLines(f.method),
      "",
      `1. Send ${formatRs(amount)} and write ${reference} in the payment note.`,
      "2. We match your payment to your reference and unlock your account.",
      `3. Log in any time at ${siteUrl()}/login to see your status.`,
      "",
      "Exambites Creative Academy",
    ].join("\n"),
  });
}

async function notifyAdmin(f: SignupFields, reference: string, amount: number, code: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail({
    to,
    subject: `New sign-up: ${f.name} (${reference})`,
    text: [
      `${f.name} <${f.email}> signed up.`,
      `Reference: ${reference}`,
      `Amount: ${formatRs(amount)}${code ? ` (referral ${code})` : ""}`,
      `Paying with: ${f.method}`,
      "",
      `Approve the payment in the admin portal: ${siteUrl()}/admin?tab=payments`,
    ].join("\n"),
  });
}

/** Optional copy of the sign-up into the Google Sheet (docs/signups.md). */
async function copyToSheet(f: SignupFields, reference: string, amount: number, phone: string) {
  const url = process.env.SIGNUP_WEBHOOK_URL;
  const secret = process.env.SIGNUP_WEBHOOK_SECRET;
  if (!url || !secret) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      secret,
      reference,
      submittedAt: new Date().toISOString(),
      name: f.name,
      email: f.email,
      phone,
      source: f.source,
      method: f.method,
      amount: formatRs(amount),
      account: f.method ? checkout.accounts[f.method] : null,
      // Emails are sent by the website now; the script only records the row.
      sendEmails: false,
    }),
    signal: AbortSignal.timeout(10_000),
  });
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
