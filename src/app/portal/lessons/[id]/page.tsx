import type { Metadata } from "next";
import { Film } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Quiz } from "@/components/learn/Quiz";
import { PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { videoEmbedUrl } from "@/lib/server/bunny";
import { PASS_MARK } from "@/lib/server/courses";
import { lessonForStudent, publicQuestions } from "@/lib/server/learning";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Lesson · Exambites", robots: { index: false } };

type Params = PageProps<"/portal/lessons/[id]">["params"];

export default function LessonPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Params }) {
  const user = await requireRole("student");
  const found = await lessonForStudent(user.id, (await params).id);
  if (!found) notFound();
  const { course, lesson, lessons, index } = found;
  const src = videoEmbedUrl(lesson.videoId);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <PortalShell role="student" user={user}>
      <Link href={`/portal/courses/${course.slug}`} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <p className="mt-4 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Lesson {index + 1} of {lessons.length}</p>
      <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-[-0.03em] text-ink md:text-4xl">{lesson.title}</h1>

      <div className="relative mt-6 aspect-video overflow-hidden rounded-3xl border border-ink/10 bg-black">
        {src ? (
          <>
            <iframe src={src} title={lesson.title} loading="lazy" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full border-0" />
            {/* Who is watching, so screen recordings can be traced back to an account. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
              <span className="watermark absolute font-mono text-xs text-white/25">{user.email}</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center text-white/60">
            <div>
              <Film className="mx-auto size-8" />
              <p className="mt-3 text-sm">The video for this lesson is coming soon.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {lesson.summary && <p className="text-ink-soft">{lesson.summary}</p>}
          <Quiz lessonId={lesson.id} questions={publicQuestions(lesson)} passMark={PASS_MARK} done={lesson.state === "done"} courseSlug={course.slug} />
        </div>
        {lesson.notes && (
          <aside className="h-fit rounded-3xl border border-ink/10 bg-surface-card p-6">
            <h2 className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Notes</h2>
            <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{lesson.notes}</div>
          </aside>
        )}
      </div>

      <nav aria-label="Lessons" className="mt-10 flex justify-between gap-3 border-t border-ink/10 pt-6 text-sm font-semibold">
        {prev ? <Link href={`/portal/lessons/${prev.id}`} className="text-ink-soft hover:text-brand-700">← {prev.title}</Link> : <span />}
        {next && next.state !== "locked" && <Link href={`/portal/lessons/${next.id}`} className="text-right text-ink-soft hover:text-brand-700">{next.title} →</Link>}
      </nav>
    </PortalShell>
  );
}
