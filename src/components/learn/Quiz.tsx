"use client";

import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, LoaderCircle, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CourseCompletion } from "@/lib/server/learning";
import { CourseCompleteDialog } from "./CourseCompleteDialog";

type Q = { id: string; prompt: string; options: string[] };
type Result = { score: number; passed: boolean; wrong: string[]; total: number; correct: Record<string, number>; courseCompleted: boolean; completion?: CourseCompletion | null; assignmentPending?: boolean; nextLessonId: string | null };

/**
 * The lesson quiz, one question at a time. Passing (80%) is required to move
 * on; once passed it shows as completed. Lessons without questions get a
 * "mark as complete" button instead.
 */
export function Quiz({ lessonId, questions, passMark, passed, bestScore, continueHref }: {
  lessonId: string; questions: Q[]; passMark: number; passed: boolean; bestScore: number | null; continueHref: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/portal/lessons/${lessonId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (Result & { ok: boolean; error?: string }) | null;
    setBusy(false);
    if (!data?.ok) return setError(data?.error ?? "Connection problem. Try again.");
    setResult(data);
    router.refresh();
  }

  const card = "rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8";

  const celebrate = result?.completion ? <CourseCompleteDialog completion={result.completion} /> : null;

  if (!questions.length) {
    return passed ? (
      <>
        {celebrate}
        <Done title="Lesson complete" body="You've finished this lesson." href={continueHref} />
      </>
    ) : (
      <div className={card}>
        <p className="text-sm text-ink-soft">This lesson has no quiz. Mark it complete when you&apos;re ready to move on.</p>
        <button type="button" disabled={busy} onClick={submit} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> Mark as complete</>}
        </button>
        {error && <p role="alert" className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }

  if (passed && !result) {
    return <Done title="Quiz completed" body={`You passed this quiz${bestScore !== null ? ` with ${bestScore}%` : ""}.`} href={continueHref} />;
  }

  if (result) {
    if (result.passed) {
      return (
        <>
          {celebrate}
          <Done title={`${result.score}% · Passed`} href={continueHref}
            body={result.courseCompleted ? "You finished the course! Your next course is now open." : result.assignmentPending ? "Next, hand in the assignment for this lesson." : "The next lesson is unlocked."} />
        </>
      );
    }
    const retry = () => { setResult(null); setAnswers({}); setI(0); };
    return <Review questions={questions} answers={answers} result={result} passMark={passMark} onRetry={retry} />;
  }

  const q = questions[i];
  const last = i === questions.length - 1;
  const answered = answers[q.id] !== undefined;
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight text-ink"><CircleHelp className="size-5 text-brand-700" /> Quiz</h2>
        <span className="font-label text-sm font-bold text-ink-soft">{i + 1} / {questions.length}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label="Question">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500 transition-[width]" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
      </div>
      <fieldset className="mt-6">
        <legend className="text-lg font-semibold text-ink">
          {i + 1}. {q.prompt} <span className="ml-1 rounded-full border border-ink/15 px-2 py-0.5 align-middle font-label text-[10px] font-bold text-ink-soft">MCQ</span>
        </legend>
        <div className="mt-4 grid gap-2.5">
          {q.options.map((o, k) => (
            <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm transition-colors ${answers[q.id] === k ? "border-brand-600 bg-brand-500/10 text-ink" : "border-ink/10 text-ink-soft hover:border-ink/25"}`}>
              <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => { setAnswers((a) => ({ ...a, [q.id]: k })); setError(""); }} className="size-4 accent-[var(--color-brand-600)]" />
              <span><span className="mr-1 font-bold">{String.fromCharCode(65 + k)}.</span> {o}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-500">{error}</p>}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink-soft hover:text-ink disabled:opacity-40">
          <ArrowLeft className="size-4" /> Previous
        </button>
        {last ? (
          <button type="button" disabled={busy || !answered || questions.some((x) => answers[x.id] === undefined)} onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Submit answers"}
          </button>
        ) : (
          <button type="button" disabled={!answered} onClick={() => setI(i + 1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            Next <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Done({ title, body, href }: { title: string; body: string; href: string | null }) {
  return (
    <div role="status" className="rounded-3xl border border-emerald-500/30 bg-surface-card p-8 text-center">
      <CheckCircle2 className="mx-auto size-11 text-emerald-500" />
      <p className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      {href && (
        <Link href={href} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
          Continue <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
      <RotateCcw className="size-4" /> Retry quiz
    </button>
  );
}

/** Failed attempt: score, then every question with the right answer and the student's pick. */
function Review({ questions, answers, result, passMark, onRetry }: {
  questions: Q[]; answers: Record<string, number>; result: Result; passMark: number; onRetry: () => void;
}) {
  const total = result.total || questions.length;
  const right = total - result.wrong.length;
  return (
    <div role="status" className="rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight text-ink">
        <AlertCircle className="size-5 text-red-500" /> Quiz results
      </h2>
      <div className="mt-5 rounded-2xl border border-ink/10 bg-ink/[0.03] p-5">
        <p className="font-display text-4xl font-black text-ink">{right}/{total}</p>
        <p className="mt-1 text-sm text-ink-soft">{result.score}% correct</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-500">
            <XCircle className="size-4" /> Failed — {passMark}% required to proceed
          </span>
          <RetryButton onClick={onRetry} />
        </div>
      </div>

      <ol className="mt-6 grid gap-4">
        {questions.map((q, n) => {
          const picked = answers[q.id];
          const correct = result.correct?.[q.id];
          const isWrong = result.wrong.includes(q.id);
          return (
            <li key={q.id} className={`rounded-2xl border p-4 sm:p-5 ${isWrong ? "border-red-500/30 bg-red-500/[0.06]" : "border-emerald-500/25 bg-emerald-500/[0.04]"}`}>
              <div className="flex items-start gap-2">
                {isWrong
                  ? <AlertCircle aria-label="Wrong" className="mt-0.5 size-5 shrink-0 text-red-500" />
                  : <CheckCircle2 aria-label="Correct" className="mt-0.5 size-5 shrink-0 text-emerald-500" />}
                <p className="font-semibold text-ink">{n + 1}. {q.prompt}</p>
              </div>
              <ul className="mt-3 grid gap-1.5 pl-7 text-sm">
                {q.options.map((o, k) => {
                  const isCorrect = k === correct;
                  const isPickedWrong = k === picked && !isCorrect;
                  return (
                    <li key={k} className={isCorrect ? "font-bold text-emerald-500" : isPickedWrong ? "text-red-500 line-through" : "text-ink-soft"}>
                      <span className="mr-1 font-bold">{String.fromCharCode(65 + k)}.</span> {o}
                      {isCorrect && <span className="sr-only"> (correct answer)</span>}
                      {isPickedWrong && <span className="sr-only"> (your answer)</span>}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex justify-center"><RetryButton onClick={onRetry} /></div>
    </div>
  );
}
