# Receiving sign-ups (Google Sheet + email)

The seat form on `/enroll` posts to `/api/enroll`. That route validates the
details and forwards them to a Google Apps Script attached to your sign-ups
sheet. The script adds a row, emails you, and emails the student their seat
reference and payment steps. No paid email service is needed; emails are sent
from the Google account that owns the sheet.

Until the two settings in step 4 exist, the form shows
"Online enrollment isn't open yet" and nothing is recorded.

## 1. Create the sheet

Create a Google Sheet (any name). A `Signups` tab with headers is created on
the first sign-up.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Replace everything in `Code.gs` with [`signups-apps-script.gs`](./signups-apps-script.gs).
3. Fill in the settings at the top:
   - `SECRET`: a long random string (e.g. from a password generator).
   - `NOTIFY_EMAIL`: the inbox that should get new sign-up alerts.
   - `FROM_NAME`: sender name for the student's email.
4. Save.

## 3. Deploy it as a web app

1. **Deploy → New deployment → Select type: Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. **Deploy**, approve the permissions (sheet + send email), copy the
   **Web app URL** (ends in `/exec`).

"Anyone" is required so the website can reach it; the `SECRET` stops anyone
else from writing to the sheet.

After editing the script later, use **Deploy → Manage deployments → Edit →
New version** so the same URL picks up the change.

## 4. Add the settings to Vercel

Vercel → Project → **Settings → Environment Variables**, for Production (and
Preview if you want to test there):

| Name | Value |
| --- | --- |
| `SIGNUP_WEBHOOK_URL` | the Web app URL from step 3 |
| `SIGNUP_WEBHOOK_SECRET` | the same `SECRET` as in the script |

Then redeploy. For local development put the same two lines in `.env.local`
(see `.env.example`).

## 5. Test

Submit the form on `/enroll`. You should see a new row, an alert in
`NOTIFY_EMAIL`, and a confirmation email at the address you entered.

Gmail accounts can send about 100 emails a day through Apps Script
(Workspace accounts about 1,500). Each sign-up sends two.
