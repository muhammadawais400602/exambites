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
| `BUNNY_LIBRARY_ID` | Bunny → Stream → your library → API → Library ID |
| `BUNNY_TOKEN_KEY` | Bunny → Stream → library → Security → turn on **Embed view token authentication**, copy the key (secret) |

In Atlas → Network Access, allow `0.0.0.0/0` (Vercel has no fixed IP).

## 2. Create the admin

Open `/admin/setup`, enter `ADMIN_SETUP_TOKEN`, your name, email and a password of 12+ characters.
It only works while no admin exists. Afterwards delete `ADMIN_SETUP_TOKEN` from Vercel.

## 3. Daily use

- **Payments**: each sign-up has a reference (`EXB-XXXXXX`). Match it to the payment, then Approve (student is emailed and AI Basics opens) or Reject with a reason.
- **Teachers**: add name + email, and optionally a password you choose. Without a password, a set-password link (valid 7 days) is emailed and shown in the panel to send on WhatsApp. **Set password** changes it later and signs the teacher out. Remove signs them out at once; their answers stay. Adding the same email again restores them.
- **Referral codes**: pick the code, how many sign-ups it allows and an optional last day. A code drops the price from Rs. 7,000 to Rs. 5,000.
- **Activity**: every admin action and sign-up is logged.
- **Courses**: the six courses are created automatically. Open one to edit its text, add lessons, reorder them and publish. A course or lesson is only visible to students once **Visible to students** is ticked.
- **Lessons**: title, Bunny video ID (Bunny → Stream → video → Video GUID), notes and a multiple-choice quiz. Students need 80% to unlock the next lesson; a lesson without questions is marked done after watching.

## How students move through courses

One payment covers all courses, but one course is open at a time. AI Basics is first. When a course is finished, the student picks the next one. The bonus course opens after all the others. Videos are signed per viewer (links expire after 4 hours) and show the student's email as a moving watermark.
