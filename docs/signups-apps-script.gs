/**
 * School of Tomorrow sign-ups: Google Apps Script web app.
 *
 * Paste this into Extensions → Apps Script of the sign-ups Google Sheet,
 * fill in the three settings below, then deploy it as a web app
 * (see docs/signups.md). Each sign-up from /enroll:
 *   1. adds a row to the "Signups" tab,
 *   2. emails NOTIFY_EMAIL,
 *   3. emails the student their seat reference and payment steps.
 */

// ── Settings ────────────────────────────────────────────────────────────
// Must match SIGNUP_WEBHOOK_SECRET in Vercel. Use a long random string.
const SECRET = "PASTE-THE-SAME-SECRET-AS-VERCEL";
// Where new sign-up alerts go.
const NOTIFY_EMAIL = "admissions@example.com";
// Name shown as the sender of the student's confirmation email.
const FROM_NAME = "School of Tomorrow";
// ────────────────────────────────────────────────────────────────────────

const SHEET_NAME = "Signups";
const HEADERS = ["Submitted at", "Reference", "Name", "Email", "Phone", "Heard from", "Payment method", "Amount", "Status"];

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }
  if (d.secret !== SECRET) return reply({ ok: false, error: "unauthorized" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(d.submittedAt),
      d.reference,
      cell(d.name),
      cell(d.email),
      cell(d.phone),
      cell(d.source),
      cell(d.method),
      cell(d.amount),
      "Awaiting payment",
    ]);
  } finally {
    lock.releaseLock();
  }

  // The website sends its own emails once the portal is live (sendEmails: false).
  if (d.sendEmails === false) return reply({ ok: true });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "New seat: " + d.name + " (" + d.reference + ")",
    body: [
      "New sign-up from the website.",
      "",
      "Reference: " + d.reference,
      "Name: " + d.name,
      "Email: " + d.email,
      "Phone: " + d.phone,
      "Heard from: " + d.source,
      "Paying with: " + d.method + " (" + d.amount + ")",
      "",
      "Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join("\n"),
  });

  const account = d.account && d.account.number
    ? "Account title: " + d.account.title + "\nAccount / IBAN: " + d.account.number
    : "We'll reply with the " + d.method + " account details shortly.";

  MailApp.sendEmail({
    to: d.email,
    name: FROM_NAME,
    replyTo: NOTIFY_EMAIL,
    subject: "Your School of Tomorrow seat reference: " + d.reference,
    body: [
      "Assalam o Alaikum " + d.name + ",",
      "",
      "Your seat at School of Tomorrow is reserved.",
      "",
      "Seat reference: " + d.reference,
      "Amount: " + d.amount,
      "Pay with: " + d.method,
      account,
      "",
      "1. Send " + d.amount + " and write " + d.reference + " in the payment note.",
      "2. We match your payment to your reference.",
      "3. Your student portal login arrives at this email within 24 hours.",
      "",
      "Questions? Just reply to this email.",
      "",
      FROM_NAME,
    ].join("\n"),
  });

  return reply({ ok: true });
}

// Stop values like "=HYPERLINK(...)" from running as formulas in the sheet.
function cell(v) {
  const s = String(v == null ? "" : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
