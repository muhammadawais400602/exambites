import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { coursesForTeacher } from "@/lib/server/courses";
import { courseRoster } from "@/lib/server/progress";
import { waitingCount } from "@/lib/server/assignments";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Teacher · Exambites", robots: { index: false } };

export default function TeacherPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <TeacherHome />
    </Suspense>
  );
}

async function TeacherHome() {
  const user = await requireRole("teacher");
  const courses = await coursesForTeacher(user.id);
  const [rosters, waiting] = await Promise.all([
    Promise.all(courses.map((c) => courseRoster(c.id))),
    Promise.all(courses.map((c) => waitingCount(c.id))),
  ]);
  return (
    <PortalShell role="teacher" user={user}>
      <PageTitle eyebrow="Teacher" title={`Hi ${user.name.split(" ")[0]}`} />
      {courses.length ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => {
            const roster = rosters[i];
            const active = roster.filter((r) => r.status === "current").length;
            return (
              <li key={c.id}>
                <Link href={`/teacher/courses/${c.id}`} className="flex h-full flex-col rounded-3xl border border-ink/10 bg-surface-card p-6 transition-colors hover:border-brand-600/40">
                  <BookOpen className="size-6 text-brand-700" />
                  <h2 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-ink">{c.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{active} studying now · {roster.length - active} completed</p>
                  {waiting[i] > 0 && <p className="mt-2 w-fit rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">{waiting[i]} assignment{waiting[i] === 1 ? "" : "s"} to grade</p>}
                  <span className="mt-auto pt-5 text-xs font-bold text-brand-700">See students →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 max-w-2xl rounded-3xl border border-ink/10 bg-surface-card p-8">
          <BookOpen className="size-8 text-brand-700" />
          <h2 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-ink">No courses yet</h2>
          <p className="mt-2 text-sm text-ink-soft">Once the admin assigns you to a course, its students and their progress show up here.</p>
        </div>
      )}
    </PortalShell>
  );
}
