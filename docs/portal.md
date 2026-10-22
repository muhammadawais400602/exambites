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
| `EMAIL_FROM` | e.g. `School of Tomorrow <hello@schooloftomorrow.si>` (domain verified in Resend) |
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
- **Courses**: the six courses are created automatically, in this order: AI Basics, AI Graphic Design, AI Video Editing & Filmmaking, AI Web Development, AI Digital Marketing, Freelancing & Portfolio Building. (Databases that had the earlier list were renamed in place on the first visit after the update: Content Creation → Graphic Design, AI Filmmaking → Video Editing & Filmmaking, Selling & Client Communication → Freelancing & Portfolio Building; lessons and progress kept.) Open one to edit its text, add lessons, reorder them and publish. A course or lesson is only visible to students once **Visible to students** is ticked.
- **Teachers on a course**: tap course chips under each teacher in the Teachers tab, or tick teachers on the course page. They see that course's students (on it now or finished) with lesson-by-lesson progress and quiz scores; the admin sees every student via **Students → Progress**.
- **Lessons**: title, video (a YouTube link for now: upload as **Unlisted**, with embedding allowed; or a Bunny video ID later), notes and a multiple-choice quiz. Each lesson has steps (Video, Quiz, Assignment) listed in **Course content** beside the lesson. Videos can be skipped; the quiz must be passed (80%, one question at a time) and the assignment approved by a teacher before moving on. After a failed attempt students see every question with the right answer in green and their wrong pick struck through in red, then **Retry quiz**. A lesson without questions has a **Mark as complete** button.

## Growth charts

**Admin → Overview** shows the last 12 months: new students and earnings this month (so far) with the change vs last month, all-time totals, and two column charts, **New students** and **Earnings (Rs)** per month. Hover a month for its exact value (and running student total), or press **Table** to see every month. A student counts in the month their payment was **approved**, in Pakistan time; earnings are the approved payment amounts.

## How students move through courses

One payment covers all courses, but one course is open at a time, in the order set in **Admin → Courses** (↑ ↓ to reorder). Finishing a course opens the next one automatically and shows a congratulations popup with a button to start it; bonus courses come after all the others. Hidden courses are skipped, so hide a course until its lessons are ready, or students reaching it will wait on an empty course. Videos are signed per viewer (links expire after 4 hours) and show the student's email as a moving watermark.

## Profiles

Everyone (students, teachers, admin) has a profile on the **Settings** page (`/settings`), opened from the ⚙️ icon or their name in the top bar. The **name and picture are public**: they show wherever the person appears (teacher views now, the community later). Phone, city, bio, skills and social links are **private**: only the person and the admin see them (Admin → Students → Progress). Teachers see the name, picture, email and school details of students on their courses (see **Teacher: Students** below), but not the rest of the private profile. Pictures are cropped to a 256px square in the browser and stored in MongoDB (about 30 KB each). The settings page also has **Change password**.

### Videos on YouTube (temporary)

Until Bunny Stream is set up, lessons can use YouTube. Upload each video as **Unlisted** (not Private, which can't be embedded), keep **Allow embedding** on, and paste its link into the lesson. The player hides related videos and shows the student's email as a watermark. Unlisted videos can still be shared and downloaded by anyone who gets the link, so move paid content to Bunny when you can: paste the Bunny video ID into the same field, one lesson at a time.

## Teacher: Students

Teachers get a **Students** tab listing every student on, or finished with, one of their courses: Name, Reg No, Class (with section and campus), Email, Course and Status (Studying / Completed / Disabled). Search by name, Reg No or email; filter by class or status; sort by name or Reg No.

- Tap ✏️ next to a Reg No to edit it in place (Enter saves, Esc cancels).
- **⋯** on a row: **View progress**, **Edit profile** (name, Reg No, campus, class, section), **Reset password** (teacher sets a new one and gives it to the student; other devices are signed out) and **Disable / Enable account** (a disabled student is signed out and can't log in; progress is kept).
- The admin has the same buttons on **Admin → Students → (student)**. Students can't change their own school details.
- Every change is recorded in the activity log.

### Checking work inside the site

On an assignment or capstone review page the student's work is shown right there, next to Approve / Reject (which stays in view while scrolling):

- **Links**: YouTube, Google Drive (files and folders), Google Docs / Sheets / Slides / Forms, Canva, Figma, Loom and Vimeo play or preview inline. They must be shared publicly ("Anyone with the link"); the student forms remind them. Other websites usually block being shown inside another site, so they get an **Open** button.
- **Files**: images show full size; PDF, text and CSV open in the browser's viewer; Word, PowerPoint and Excel open in Microsoft's free Office viewer (it reads the file from its storage address). ZIP files are download-only.

Every item also has **Open** for a full view in a new tab.

## Capstone

Students have a **Capstone** tab. It unlocks once every core course is finished (bonus courses aren't needed); the dashboard shows a "Capstone unlocked" banner. The student picks **Project** (something they made) or **Proof of earning** (their first income), adds a title, a description, a link and/or up to 5 screenshots (PNG, JPG, WebP or PDF, 10 MB each; screenshots need Vercel Blob), and submits. They can edit while it's waiting.

Every teacher has a **Capstones** tab listing all students' capstones (waiting first), since the capstone covers the whole program. They open one and **Approve** it (the student sees "Capstone approved — you've completed the whole program") or **Reject** it with feedback (the student updates it and submits again). Decisions are logged in Activity.

## Certificates

When a teacher approves a student's capstone (which only opens after every course is done), the student gets a **certificate** automatically. Students who were approved before certificates existed get theirs the first time they open it.

- Students find it under **Capstone → View your certificate** or the "Program complete" banner on the dashboard (`/portal/certificate`). **Download PDF** saves it as one landscape A4 page (the browser's "Save as PDF"); **Copy verify link** copies its public check link.
- Each certificate has a random ID like `SOT-26-7K3Q-9XHD` and a **QR code** that opens `/verify/<ID>`. Anyone (an employer, a client) can scan it and see whether it's **genuine**, with the name, program, courses, capstone and issue date. Unknown IDs say "Not a valid certificate".
- At **/verify** people type the **ID and the name printed on the certificate**. Both must match: a real ID with a different name says **Not genuine** (the certificate was probably edited) without revealing who the ID belongs to. Case, spacing and punctuation in the name don't matter.
- **Sharing**: the certificate page has LinkedIn, Facebook, X and WhatsApp buttons (plus the phone's share sheet and Copy link) and **Add to your LinkedIn profile**, which opens LinkedIn's "Licenses & certifications" form pre-filled with the program, School of Tomorrow, issue date, ID and verify link. Shared links show a preview card with the student's name and "Verified".
- Details are a snapshot from the day it was issued.
- **Withdraw**: Admin → Students → (student) shows the certificate with **Withdraw** / **Restore**. A withdrawn certificate's verify page says it's no longer valid.
- The QR code uses the site address (`BETTER_AUTH_URL`, or the Vercel production domain), so set `BETTER_AUTH_URL=https://www.schooloftomorrow.si` in Vercel before issuing real certificates.

## Lesson files (PDF, Word, PowerPoint…)

Needs Vercel Blob: Vercel → **Storage** → **Create** → **Blob** → choose **Public** access → connect it to the exambites project (Production and Preview). Vercel adds `BLOB_READ_WRITE_TOKEN` itself; redeploy afterwards.

In a lesson, **Files → Upload files** sends files straight from the browser to storage (up to 100 MB each, 20 per lesson): PDF, Word, PowerPoint, Excel, text, CSV, ZIP and images. Files are stored under random addresses that aren't shown on any page. Students download through `/api/files/…`, which only works for lessons they've unlocked (teachers: their courses), and every student download is logged in Activity. A student who downloads a file can still share it, like any download.

## Assignments

In any lesson, tick **Add an assignment** and write what students should do. It opens after the lesson's quiz is passed (or the lesson is marked complete). Students submit text, a link and/or up to 5 files (50 MB each; files need Vercel Blob), then wait: **the next lesson opens only once a teacher approves the work**. They can edit while it's waiting.

Teachers of the course see **Assignments** on the course page (waiting ones first, and a "to review" count on their home page). They open one (from that list, or the **Review assignment** button on a student's progress page) and press **Approve** (next lesson opens) or **Reject** with feedback (required), which asks the student to redo it; the student resubmits and it goes back in the queue. The decision and feedback show to the student on the lesson, and in teacher and admin progress views. If approving finishes the student's course, they get the congratulations popup the next time they open the portal. Every submission and decision is logged in Activity.

Older grades (score out of 100) count as approved; older "ask to resubmit" counts as rejected.

## Student dashboard

Students land on **Dashboard** (`/portal`): a welcome, the program card (courses completed, a button to continue the current course, and the path of all courses), then **My courses** as cover cards. **Courses** (`/portal/courses`) shows the same cards; **Profile** opens Settings. Locked courses are dimmed with a padlock and "Complete Course N to unlock". Upload a cover picture per course in **Admin → Courses → (course)**, 16:9 works best; without one, a designed cover with the course icon is shown.
