import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ClipboardList, Download, FileText, Film, Lock, PlayCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AssignmentCard } from "@/components/learn/AssignmentCard";
import { CourseBanner } from "@/components/learn/CourseBanner";
import { LessonVideo, LessonWatch } from "@/components/learn/LessonVideo";
import { Quiz } from "@/components/learn/Quiz";
import { PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { FILE_TYPES, formatBytes } from "@/lib/files";
import { getSubmission } from "@/lib/server/assignments";
import { videoEmbedUrl } from "@/lib/server/bunny";
import { PASS_MARK } from "@/lib/server/courses";
import { courseSteps, lessonForStudent, publicQuestions, type LessonStep, type StepKind } from "@/lib/server/learning";
import { requireRole } from "@/lib/server/session";
import { parseVideo } from "@/lib/video";

export const metadata: Metadata = { title: "Lesson · Exambites", robots: { index: false } };

type Props = { params: PageProps<"/portal/lessons/[id]">["params"]; searchParams: PageProps<"/portal/lessons/[id]">["searchParams"] };

export default function LessonPage(props: Props) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Lesson {...props} />
    </Suspense>
  );
}

const KIND_LABEL: Record<StepKind, string> = { video: "Video", quiz: "Quiz", assignment: "Assignment" };
const stepHref = (s: Pick<LessonStep, "lessonId" | "kind">) => `/portal/lessons/${s.lessonId}?step=${s.kind}`;

async function Lesson({ params, searchParams }: Props) {
  const user = await requireRole("student");
  const found = await lessonForStudent(user.id, (await params).id);
  if (!found) notFound();
  const { course, lesson, lessons } = found;
  const steps = courseSteps(lessons);
  const wanted = String((await searchParams).step ?? "video");
  const here = steps.find((s) => s.lessonId === lesson.id && s.kind === wanted) ?? steps.find((s) => s.lessonId === lesson.id)!;
  if (here.state === "locked") redirect(stepHref(steps.find((s) => s.lessonId === lesson.id)!));
  const idx = steps.indexOf(here);
  const prev = steps[idx - 1];
  const next = steps[idx + 1];
  const done = steps.filter((s) => s.state === "done").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  // Moving on needs the quiz passed (or the lesson marked complete) and the assignment handed in.
  const hasQuiz = lesson.questions.length > 0;
  const blocked =
    here.kind === "quiz" && !lesson.quizPassed ? "Pass the quiz to continue"
      : here.kind === "assignment" && !lesson.submitted ? "Submit the assignment to continue"
        : here.kind === "video" && !hasQuiz && !lesson.quizPassed ? "Mark the lesson complete to continue"
          : null;
  const canNext = !!next && !blocked && next.state !== "locked";
  // Where "Continue" goes after passing the quiz: the assignment, or the next lesson.
  const afterQuiz = steps[steps.findIndex((s) => s.lessonId === lesson.id && s.kind === (hasQuiz ? "quiz" : "video")) + 1];

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const src = videoEmbedUrl(lesson.videoId, origin);
  const submission = here.kind === "assignment" ? await getSubmission(user.id, lesson.id) : null;
  const btn = "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors";

  return (
    <PortalShell role="student" user={user}>
      <div className="flex items-center gap-4">
        <Link href="/portal/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="size-4" /> Back</Link>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">{course.title}</h1>
          <p className="text-xs text-ink-soft">{done}/{steps.length} completed · {pct}%</p>
        </div>
      </div>
      <div className="mt-5"><CourseBanner title={course.title} slug={course.slug} image={course.image} /></div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <details open className="group order-2 rounded-3xl border border-ink/10 bg-surface-card lg:order-1 lg:sticky lg:top-32 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-display text-base font-black uppercase tracking-tight text-ink lg:cursor-default">
            Course content <span className="text-xs font-semibold text-muted lg:hidden">{done}/{steps.length}</span>
          </summary>
          <nav aria-label="Course content" className="max-h-[70vh] overflow-y-auto px-2 pb-4">
            {lessons.map((l, n) => (
              <div key={l.id} className="mt-2">
                <p className="truncate px-3 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{n + 1}. {l.title}</p>
                <ul>
                  {steps.filter((s) => s.lessonId === l.id).map((s) => {
                    const on = s.key === here.key;
                    const Icon = s.state === "done" ? CheckCircle2 : s.state === "locked" ? Lock : s.kind === "video" ? PlayCircle : s.kind === "quiz" ? CircleHelp : ClipboardList;
                    const inner = (
                      <>
                        <Icon className={`mt-0.5 size-4 shrink-0 ${s.state === "done" ? "text-emerald-500" : on ? "text-brand-600" : "text-muted"}`} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{s.kind === "video" ? l.title : `${l.title} · ${KIND_LABEL[s.kind]}`}</span>
                          <span className="block text-xs text-muted">{s.kind === "video" && !l.videoId ? "Lesson" : KIND_LABEL[s.kind]}</span>
                        </span>
                      </>
                    );
                    const cls = `flex gap-3 rounded-2xl px-3 py-2.5 ${on ? "bg-brand-500/10 text-brand-700" : s.state === "locked" ? "text-muted opacity-60" : "text-ink hover:bg-ink/[0.04]"}`;
                    return (
                      <li key={s.key}>
                        {s.state === "locked" ? <span className={cls}>{inner}</span> : <Link href={stepHref(s)} aria-current={on ? "step" : undefined} className={cls}>{inner}</Link>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </details>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          {here.kind === "video" && (
            <section className="rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex min-w-0 items-center gap-2 font-display text-lg font-black uppercase tracking-tight text-ink">
                  <PlayCircle className="size-5 shrink-0 text-brand-700" /> <span className="truncate">{lesson.title}</span>
                </h2>
                {here.state === "done" && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-3.5" /> Completed</span>}
              </div>
              {src ? (
                <LessonWatch lessonId={lesson.id} required initiallyWatched={lesson.watched || lesson.quizPassed}>
                  <LessonVideo src={src} kind={parseVideo(lesson.videoId)?.kind ?? "youtube"} title={lesson.title} watermark={user.email} />
                </LessonWatch>
              ) : lesson.videoId ? (
                <div className="grid aspect-video place-items-center rounded-3xl bg-black text-center text-white/60"><div><Film className="mx-auto size-8" /><p className="mt-3 text-sm">The video for this lesson is coming soon.</p></div></div>
              ) : null}
              {lesson.summary && <p className="mt-5 text-ink-soft">{lesson.summary}</p>}
              {lesson.notes && <div className="mt-5 whitespace-pre-wrap break-words border-t border-ink/10 pt-5 text-sm leading-relaxed text-ink">{lesson.notes}</div>}
              {lesson.attachments.length > 0 && (
                <ul className="mt-5 grid gap-2 border-t border-ink/10 pt-5 sm:grid-cols-2">
                  {lesson.attachments.map((f) => (
                    <li key={f.id}>
                      <a href={`/api/files/${lesson.id}/${f.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-ink/10 p-3 transition-colors hover:border-brand-600/40">
                        <FileText className="size-5 shrink-0 text-brand-700" />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{f.name}</span><span className="text-xs text-muted">{FILE_TYPES[f.type] ?? "File"} · {formatBytes(f.size)}</span></span>
                        <Download className="size-4 shrink-0 text-ink-soft" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {here.kind === "video" && !hasQuiz && (
            <Quiz lessonId={lesson.id} questions={[]} passMark={PASS_MARK} passed={lesson.quizPassed} bestScore={null} continueHref={afterQuiz ? stepHref(afterQuiz) : null} />
          )}
          {here.kind === "quiz" && (
            <Quiz lessonId={lesson.id} questions={publicQuestions(lesson)} passMark={PASS_MARK} passed={lesson.quizPassed} bestScore={lesson.bestScore} continueHref={afterQuiz ? stepHref(afterQuiz) : null} />
          )}
          {here.kind === "assignment" && lesson.assignment && (
            <AssignmentCard
              lessonId={lesson.id}
              userId={user.id}
              instructions={lesson.assignment.instructions}
              required
              uploadsReady={!!process.env.BLOB_READ_WRITE_TOKEN}
              submission={submission && { id: submission.id, text: submission.text, link: submission.link, files: submission.files, status: submission.status, score: submission.score, feedback: submission.feedback, gradedByName: submission.gradedByName }}
            />
          )}

          <nav aria-label="Steps" className="flex items-center justify-between gap-3">
            {prev && prev.state !== "locked" ? (
              <Link href={stepHref(prev)} className={`${btn} border border-ink/15 text-ink-soft hover:text-ink`}><ArrowLeft className="size-4" /> Previous</Link>
            ) : <span />}
            {canNext ? (
              <Link href={stepHref(next)} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}>Next <ArrowRight className="size-4" /></Link>
            ) : next ? (
              <span title={blocked ?? "Locked"} className={`${btn} cursor-not-allowed border border-ink/10 text-muted`}><Lock className="size-3.5" /> {blocked ?? "Next"}</span>
            ) : (
              <span className={`${btn} text-muted`}>Last step</span>
            )}
          </nav>
        </div>
      </div>
    </PortalShell>
  );
}
