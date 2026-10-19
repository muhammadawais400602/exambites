import "server-only";
import { Resend } from "resend";

/**
 * Sends an email through Resend. Without RESEND_API_KEY (local development)
 * the email is printed to the server log instead, so flows stay testable.
 */
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "School of Tomorrow <onboarding@resend.dev>";
  if (!key) {
    console.info(`[email:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  const { error } = await new Resend(key).emails.send({ from, to, subject, text });
  if (error) {
    console.error("[email] send failed", error);
    throw new Error("Email could not be sent");
  }
}

const https = (host?: string) => (host ? `https://${host}` : "");

/**
 * The address this deployment is served from. Vercel previews use their
 * branch URL, so logins and email links work there too. In production,
 * Vercel's own production domain (the custom domain once one is added) is
 * the fallback when BETTER_AUTH_URL isn't set.
 */
export function siteUrl() {
  const env = process.env;
  const url =
    (env.VERCEL_ENV === "preview" && https(env.VERCEL_BRANCH_URL)) ||
    env.BETTER_AUTH_URL ||
    https(env.VERCEL_PROJECT_PRODUCTION_URL) ||
    https(env.VERCEL_URL) ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

/** Every address this deployment answers on; sign-in requests are accepted from these only. */
export function siteOrigins() {
  const env = process.env;
  // VERCEL_PROJECT_PRODUCTION_URL follows the project's production domain, so a
  // domain change keeps logins working even before BETTER_AUTH_URL is updated.
  const base = [siteUrl(), env.BETTER_AUTH_URL, https(env.VERCEL_PROJECT_PRODUCTION_URL), https(env.VERCEL_URL), https(env.VERCEL_BRANCH_URL)]
    .filter((u): u is string => !!u)
    .map((u) => u.replace(/\/$/, ""));
  // A custom domain usually answers both with and without "www.".
  const twins = base.flatMap((u) => {
    const m = /^(https?:\/\/)(www\.)?(.+)$/.exec(u);
    return m && !m[3].endsWith(".vercel.app") && !m[3].startsWith("localhost") ? [`${m[1]}${m[2] ? "" : "www."}${m[3]}`] : [];
  });
  return [...new Set([...base, ...twins])];
}
