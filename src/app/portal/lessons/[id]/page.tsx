import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Download, FileText, Film, Lock } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonVideo, LessonWatch, QuizGate } from "@/components/learn/LessonVideo";
import { AssignmentCard } from "@/components/learn/AssignmentCard";
import { Quiz } from "@/components/learn/Quiz";
import { PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { videoEmbedUrl } from "@/lib/server/bunny";
import { getSubmission } from "@/lib/server/assignments";
import { PASS_MARK } from "@/lib/server/courses";
import { FILE_TYPES, formatBytes } from "@/lib/files";
import { hasWatched, lessonForStudent, needsWatching, publicQuestions } from "@/lib/server/learning";
import { parseVideo } from "@/lib/video";
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
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const src = videoEmbedUrl(lesson.videoId, origin);
  const kind = parseVideo(lesson.videoId)?.kind ?? "youtube";
  const required = needsWatching(lesson);
  const watched = lesson.quizPassed || (required && (await hasWatched(user.id, lesson.id)));
  const submission = lesson.assignment ? await getSubmission(user.id, lesson.id) : null;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const nav = <LessonNav prev={prev} next={next} />;

  return (
    <PortalShell role="student" user={user}>
      <Link href={`/portal/courses/${course.slug}`} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <p className="mt-4 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Lesson {index + 1} of {lessons.length}</p>
      <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h1 className="font-display text-2xl font-black uppercase tracking-[-0.03em] text-ink md:text-4xl">{lesson.title}</h1>
        <div className="shrink-0">{nav}</div>
      </div>

      <LessonWatch lessonId={lesson.id} required={required} initiallyWatched={watched}>
      {src ? (
        <LessonVideo src={src} kind={kind} title={lesson.title} watermark={user.email} />
      ) : (
        <div className="relative mt-6 grid aspect-video place-items-center overflow-hidden rounded-3xl border border-ink/10 bg-black text-center text-white/60">
          <div>
            <Film className="mx-auto size-8" />
            <p className="mt-3 text-sm">The video for this lesson is coming soon.</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {lesson.summary && <p className="text-ink-soft">{lesson.summary}</p>}
          <QuizGate>
            <Quiz lessonId={lesson.id} questions={publicQuestions(lesson)} passMark={PASS_MARK} done={lesson.quizPassed} courseSlug={course.slug} />
          </QuizGate>
          {lesson.assignment && (
            <AssignmentCard
              lessonId={lesson.id}
              userId={user.id}
              instructions={lesson.assignment.instructions}
              required={lesson.assignment.required}
              uploadsReady={!!process.env.BLOB_READ_WRITE_TOKEN}
              submission={submission && { id: submission.id, text: submission.text, link: submission.link, files: submission.files, status: submission.status, score: submission.score, feedback: submission.feedback, gradedByName: submission.gradedByName }}
            />
          )}
        </div>
        {(lesson.notes || lesson.attachments.length > 0) && (
          <aside className="h-fit space-y-6 rounded-3xl border border-ink/10 bg-surface-card p-6">
            {lesson.notes && (
              <div>
                <h2 className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Notes</h2>
                <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{lesson.notes}</div>
              </div>
            )}
            {lesson.attachments.length > 0 && (
              <div>
                <h2 className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Files</h2>
                <ul className="mt-3 space-y-2">
                  {lesson.attachments.map((f) => (
                    <li key={f.id}>
                      <a href={`/api/files/${lesson.id}/${f.id}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-ink/10 p-3 transition-colors hover:border-brand-600/40">
                        <FileText className="size-5 shrink-0 text-brand-700" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{f.name}</span>
                          <span className="text-xs text-muted">{FILE_TYPES[f.type] ?? "File"} · {formatBytes(f.size)}</span>
                        </span>
                        <Download className="size-4 shrink-0 text-ink-soft" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>

      </LessonWatch>
      <div className="mt-10 border-t border-ink/10 pt-6">{nav}</div>
    </PortalShell>
  );
}

type NavLesson = { id: string; title: string; state: "done" | "open" | "locked" } | undefined;

/** Previous / next lesson. The next one stays locked until this lesson is passed. */
function LessonNav({ prev, next }: { prev: NavLesson; next: NavLesson }) {
  const btn = "inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-bold transition-colors";
  return (
    <nav aria-label="Lessons" className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
      {prev ? (
        <Link href={`/portal/lessons/${prev.id}`} title={prev.title} className={`${btn} border-ink/15 text-ink-soft hover:border-brand-600/50 hover:text-ink`}>
          <ArrowLeft className="size-3.5" /> Previous
        </Link>
      ) : (
        <span className={`${btn} cursor-not-allowed border-ink/10 text-muted opacity-50`}><ArrowLeft className="size-3.5" /> Previous</span>
      )}
      {next && next.state !== "locked" ? (
        <Link href={`/portal/lessons/${next.id}`} title={next.title} className={`${btn} border-brand-600 bg-brand-600 text-white hover:bg-brand-700`}>
          Next <ArrowRight className="size-3.5" />
        </Link>
      ) : (
        <span title={next ? "Pass this lesson to unlock the next one" : "This is the last lesson"} className={`${btn} cursor-not-allowed border-ink/10 text-muted`}>
          {next ? <><Lock className="size-3.5" /> Next</> : "Last lesson"}
        </span>
      )}
    </nav>
  );
}
