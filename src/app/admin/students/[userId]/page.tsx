import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonProgressList } from "@/components/learn/ProgressViews";
import { Avatar } from "@/components/portal/Avatar";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getProfile } from "@/lib/server/profile";
import { studentPath } from "@/lib/server/learning";
import { studentBasics, studentCourseProgress } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Student · Exambites", robots: { index: false } };

type Params = PageProps<"/admin/students/[userId]">["params"];

const STATE_LABEL = { current: "In progress", done: "Completed", choose: "Not started", locked: "Locked" } as const;

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Student params={params} />
    </Suspense>
  );
}

async function Student({ params }: { params: Params }) {
  const user = await requireRole("admin");
  const { userId } = await params;
  const student = await studentBasics(userId);
  if (!student) notFound();
  const [path, profile] = await Promise.all([studentPath(userId), getProfile(userId)]);
  const details = [
    ["City", profile.city],
    ["About", profile.bio],
    ["Skills", profile.skills],
    ["LinkedIn", profile.linkedin],
    ["Instagram", profile.instagram],
    ["Facebook", profile.facebook],
    ["Website", profile.website],
  ].filter(([, v]) => v);
  const started = (path?.courses ?? []).filter((c) => c.state === "current" || c.state === "done");
  const progress = await Promise.all(started.map((c) => studentCourseProgress(userId, c.id)));
  return (
    <PortalShell role="admin" user={user}>
      <Link href="/admin?tab=students" className="text-xs font-semibold text-muted hover:text-brand-700">← Students</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow="Student" title={student.name}>
          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-soft">{student.email}{student.phone && ` · ${student.phone}`}</p>
            <Avatar name={student.name} image={student.image} size={48} />
          </div>
        </PageTitle>
      </div>
      {details.length > 0 && (
        <dl className="mb-8 grid gap-x-6 gap-y-3 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:grid-cols-2">
          {details.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{k}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
                {v.startsWith("https://") ? <a href={v} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-700 hover:underline">{v.replace(/^https:\/\//, "")}</a> : v}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {!path ? (
        <p className="rounded-3xl border border-ink/10 bg-surface-card p-8 text-center text-sm text-ink-soft">Payment not approved yet, so no courses are open.</p>
      ) : (
        <div className="space-y-8">
          <ul className="flex flex-wrap gap-2">
            {path.courses.map((c) => (
              <li key={c.id} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${c.state === "current" ? "border-brand-600 text-brand-700" : c.state === "done" ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" : "border-ink/10 text-muted"}`}>
                {c.title} · {STATE_LABEL[c.state]}
              </li>
            ))}
          </ul>
          {started.map((c, i) => (
            <section key={c.id}>
              <h2 className="mb-3 font-display text-lg font-black uppercase tracking-tight text-ink">{c.title}</h2>
              <LessonProgressList lessons={progress[i]} />
            </section>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
