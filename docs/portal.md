# Portal setup

Three logins share one account system (Better Auth + MongoDB):

| Who | Login | Home |
| --- | --- | --- |
| Students | `/login` (account made at `/enroll`) | `/portal` |
| Teachers | `/login`, Teacher tab (added by the admin) | `/teacher` |
| Admin | `/admin/login` | `/admin` |

## 1. Environment variables (Vercel → Settings → Environment Variables)

| Name | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | `exambites` |
| `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | the live site URL, e.g. `https://www.schooloftomorrow.si` (previews use their own URL automatically) |
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
- **Teachers on a course**: tap course chips under each teacher in the Teachers tab, or tick teachers on the course page. They see that course's students (on it now or finished) with lesson-by-lesson progress and quiz scores; the admin sees every student via **Students → Progress**.
- **Lessons**: title, video (a YouTube link for now: upload as **Unlisted**, with embedding allowed; or a Bunny video ID later), notes and a multiple-choice quiz. Each lesson has steps (Video, Quiz, Assignment) listed in **Course content** beside the lesson. Videos can be skipped; the quiz must be passed (80%, one question at a time) and the assignment submitted before moving on. After a failed attempt students see every question with the right answer in green and their wrong pick struck through in red, then **Retry quiz**. A lesson without questions has a **Mark as complete** button.

## How students move through courses

One payment covers all courses, but one course is open at a time, in the order set in **Admin → Courses** (↑ ↓ to reorder). Finishing a course opens the next one automatically and shows a congratulations popup with a button to start it; bonus courses come after all the others. Hidden courses are skipped, so hide a course until its lessons are ready, or students reaching it will wait on an empty course. Videos are signed per viewer (links expire after 4 hours) and show the student's email as a moving watermark.

## Profiles

Everyone (students, teachers, admin) has a profile on the **Settings** page (`/settings`), opened from the ⚙️ icon or their name in the top bar. The **name and picture are public**: they show wherever the person appears (teacher views now, the community later). Phone, school details (students: registration number, campus, class, section), city, bio, skills and social links are **private**: only the person and the admin see them (Admin → Students → Progress). Teachers see students' names and pictures only, not their email or details. Pictures are cropped to a 256px square in the browser and stored in MongoDB (about 30 KB each). The settings page also has **Change password**.

### Videos on YouTube (temporary)

Until Bunny Stream is set up, lessons can use YouTube. Upload each video as **Unlisted** (not Private, which can't be embedded), keep **Allow embedding** on, and paste its link into the lesson. The player hides related videos and shows the student's email as a watermark. Unlisted videos can still be shared and downloaded by anyone who gets the link, so move paid content to Bunny when you can: paste the Bunny video ID into the same field, one lesson at a time.

## Lesson files (PDF, Word, PowerPoint…)

Needs Vercel Blob: Vercel → **Storage** → **Create** → **Blob** → choose **Public** access → connect it to the exambites project (Production and Preview). Vercel adds `BLOB_READ_WRITE_TOKEN` itself; redeploy afterwards.

In a lesson, **Files → Upload files** sends files straight from the browser to storage (up to 100 MB each, 20 per lesson): PDF, Word, PowerPoint, Excel, text, CSV, ZIP and images. Files are stored under random addresses that aren't shown on any page. Students download through `/api/files/…`, which only works for lessons they've unlocked (teachers: their courses), and every student download is logged in Activity. A student who downloads a file can still share it, like any download.

## Assignments

In any lesson, tick **Add an assignment** and write what students should do. It opens after the lesson's quiz is passed, and the next lesson opens only after it's handed in. Students submit text, a link and/or up to 5 files (50 MB each; files need Vercel Blob). They can edit until it's graded.

Teachers of the course see **Assignments** on the course page (waiting ones first, and a count on their home page). They give a score out of 100 with feedback, or **Ask to resubmit** with a note, which reopens it for the student. Grades show to the student on the lesson, and in teacher and admin progress views. Every submission and grade is logged in Activity.

## Student dashboard

Students land on **Dashboard** (`/portal`): a welcome, the program card (courses completed, a button to continue the current course, and the path of all courses), then **My courses** as cover cards. **Courses** (`/portal/courses`) shows the same cards; **Profile** opens Settings. Locked courses are dimmed with a padlock and "Complete Course N to unlock". Upload a cover picture per course in **Admin → Courses → (course)**, 16:9 works best; without one, a designed cover with the course icon is shown.
