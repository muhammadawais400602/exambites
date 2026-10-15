"use client";

import { CheckCircle2, LoaderCircle, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Q = { id: string; prompt: string; options: string[] };
type Result = { score: number; passed: boolean; wrong: string[]; courseCompleted: boolean; nextLessonId: string | null };

/** The lesson quiz, or a "mark as done" button for lessons without one. */
export function Quiz({ lessonId, questions, passMark, done, courseSlug }: { lessonId: string; questions: Q[]; passMark: number; done: boolean; courseSlug: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (questions.some((q) => answers[q.id] === undefined)) return setError("Answer every question first.");
    setBusy(true);
    setError("");
    const res = await fetch(`/api/portal/lessons/${lessonId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (Result & { ok: boolean; error?: string }) | null;
    setBusy(false);
    if (!data?.ok) return setError(data?.error ?? "Connection problem. Try again.");
    setResult(data);
    router.refresh();
  }

  if (result) {
    return (
      <div role="status" className={`rounded-3xl border p-6 ${result.passed ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/30 bg-red-500/[0.07]"}`}>
        <div className="flex items-center gap-3">
          {result.passed ? <CheckCircle2 className="size-7 text-emerald-500" /> : <XCircle className="size-7 text-red-500" />}
          <p className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            {questions.length ? `${result.score}% · ${result.passed ? "Passed" : "Not yet"}` : "Lesson done"}
          </p>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {result.courseCompleted
            ? "You finished the course! Pick your next course from My courses."
            : result.passed
              ? result.nextLessonId ? "The next lesson is unlocked." : "Nice work."
              : `You need ${passMark}% to move on. ${result.wrong.length} answer${result.wrong.length === 1 ? " was" : "s were"} wrong. Rewatch the video and try again.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {result.passed && result.nextLessonId && (
            <Link href={`/portal/lessons/${result.nextLessonId}`} className="rounded-full bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700">Next lesson →</Link>
          )}
          {(result.courseCompleted || (result.passed && !result.nextLessonId)) && (
            <Link href={result.courseCompleted ? "/portal" : `/portal/courses/${courseSlug}`} className="rounded-full bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700">
              {result.courseCompleted ? "Choose next course →" : "Back to course"}
            </Link>
          )}
          {!result.passed && (
            <button type="button" onClick={() => { setResult(null); setAnswers({}); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink">
              <RotateCcw className="size-3.5" /> Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return done ? (
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-4" /> Lesson done</p>
    ) : (
      <form onSubmit={submit}>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> I&apos;ve watched it, mark as done</>}
        </button>
        {error && <p role="alert" className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">Quiz</h2>
        <p className="text-xs text-muted">{done ? "Passed · you can retake it" : `${passMark}% to unlock the next lesson`}</p>
      </div>
      {questions.map((q, i) => (
        <fieldset key={q.id} className="rounded-3xl border border-ink/10 bg-surface-card p-5">
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="font-semibold text-ink"><span className="mr-2 font-label text-xs text-muted">{i + 1}.</span>{q.prompt}</p>
          <div className="mt-3 grid gap-2">
            {q.options.map((o, k) => (
              <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${answers[q.id] === k ? "border-brand-600 bg-brand-500/10 text-ink" : "border-ink/10 text-ink-soft hover:border-ink/25"}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => { setAnswers((a) => ({ ...a, [q.id]: k })); setError(""); }} className="size-4 accent-[var(--color-brand-600)]" />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Submit answers"}
      </button>
    </form>
  );
}
