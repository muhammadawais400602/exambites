# Portal setup

Three logins share one account system (Better Auth + MongoDB):

| Who | Login | Home |
| --- | --- | --- |
| Students | `/login` (account made at `/enroll`) | `/portal` |
| Teachers | `/teacher/login` (invited by the admin) | `/teacher` |
| Admin | `/admin/login` | `/admin` |

## 1. Environment variables (Vercel → Settings → Environment Variables)

| Name | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | `exambites` |
| `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | the live site URL, e.g. `https://exambites.vercel.app` (previews use their own URL automatically) |
| `ADMIN_SETUP_TOKEN` | any long random string (only for step 2) |
| `RESEND_API_KEY` | from resend.com (without it, emails only appear in the logs) |
| `EMAIL_FROM` | e.g. `Exambites <hello@exambites.com>` (domain verified in Resend) |
| `ADMIN_NOTIFY_EMAIL` | inbox that gets new sign-up alerts |

In Atlas → Network Access, allow `0.0.0.0/0` (Vercel has no fixed IP).

## 2. Create the admin

Open `/admin/setup`, enter `ADMIN_SETUP_TOKEN`, your name, email and a password of 12+ characters.
It only works while no admin exists. Afterwards delete `ADMIN_SETUP_TOKEN` from Vercel.

## 3. Daily use

- **Payments**: each sign-up has a reference (`EXB-XXXXXX`). Match it to the payment, then Approve (student is emailed and AI Basics opens) or Reject with a reason.
- **Teachers**: add name + email. A set-password link (valid 7 days) is emailed and shown in the panel, so you can send it on WhatsApp if email is not set up yet. Remove signs them out at once; their answers stay. Adding the same email again restores them.
- **Referral codes**: pick the code, how many sign-ups it allows and an optional last day. A code drops the price from Rs. 7,000 to Rs. 5,000.
- **Activity**: every admin action and sign-up is logged.
