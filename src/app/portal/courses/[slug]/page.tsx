import type { Metadata } from "next";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { lessonsWithProgress, studentPath } from "@/lib/server/learning";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Course · Exambites", robots: { index: false } };

type Params = PageProps<"/portal/courses/[slug]">["params"];

export default function CoursePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Course params={params} />
    </Suspense>
  );
}

async function Course({ params }: { params: Params }) {
  const user = await requireRole("student");
  const { slug } = await params;
  const path = await studentPath(user.id);
  const course = path?.courses.find((c) => c.slug === slug);
  if (!course || (course.state !== "current" && course.state !== "done")) notFound();
  const lessons = await lessonsWithProgress(user.id, course.id);
  const done = lessons.filter((l) => l.state === "done").length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const next = lessons.find((l) => l.state === "open");

  return (
    <PortalShell role="student" name={user.name}>
      <Link href="/portal" className="text-xs font-semibold text-muted hover:text-brand-700">← My courses</Link>
      <div className="mt-3">
        <PageTitle eyebrow={course.state === "done" ? "Completed" : "In progress"} title={course.title}>
          {next && (
            <Link href={`/portal/lessons/${next.id}`} className="inline-flex items-center gap-2 self-start rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 md:self-auto">
              <PlayCircle className="size-4" /> {done ? "Continue" : "Start"}
            </Link>
          )}
        </PageTitle>
      </div>
      {course.description && <p className="mt-3 max-w-2xl text-sm text-ink-soft">{course.description}</p>}

      <div className="mt-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-ink-soft">{done}/{lessons.length}</span>
      </div>

      {lessons.length ? (
        <ol className="mt-6 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-surface-card">
          {lessons.map((l, i) => {
            const row = (
              <>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full border font-label text-xs font-bold ${l.state === "done" ? "border-emerald-500/50 text-emerald-500" : l.state === "open" ? "border-brand-600 text-brand-700" : "border-ink/15 text-muted"}`}>
                  {l.state === "done" ? <CheckCircle2 className="size-4" /> : l.state === "locked" ? <Lock className="size-3.5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${l.state === "locked" ? "text-muted" : "text-ink"}`}>{l.title}</p>
                  {l.summary && <p className="mt-0.5 truncate text-xs text-ink-soft">{l.summary}</p>}
                </div>
                <span className="shrink-0 text-xs text-muted">{l.questions.length ? `${l.questions.length}-question quiz` : ""}</span>
              </>
            );
            return (
              <li key={l.id}>
                {l.state === "locked" ? (
                  <div className="flex items-center gap-4 p-4 sm:p-5">{row}</div>
                ) : (
                  <Link href={`/portal/lessons/${l.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-ink/[0.03] sm:p-5">{row}</Link>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-6 rounded-3xl border border-ink/10 bg-surface-card p-8 text-center text-sm text-ink-soft">Lessons for this course are being added. Check back soon.</p>
      )}
    </PortalShell>
  );
}
