import "server-only";
import { Resend } from "resend";

/**
 * Sends an email through Resend. Without RESEND_API_KEY (local development)
 * the email is printed to the server log instead, so flows stay testable.
 */
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Exambites <onboarding@resend.dev>";
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

export function siteUrl() {
  return (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}
