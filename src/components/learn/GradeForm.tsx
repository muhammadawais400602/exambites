"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

/** Teacher grading: a score out of 100 with feedback, or send it back for a redo. */
export function GradeForm({ id, score, feedback, backHref }: { id: string; score: number | null; feedback: string; backHref: string }) {
  const router = useRouter();
  const [s, setS] = useState(score === null ? "" : String(score));
  const [f, setF] = useState(feedback);
  const [state, setState] = useState<{ busy?: string; error?: string }>({});

  async function send(action: "grade" | "return") {
    setState({ busy: action });
    const res = await fetch(`/api/submissions/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, score: Number(s), feedback: f }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) return setState({ error: data?.error ?? "Connection problem. Try again." });
    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); send("grade"); }} className="space-y-4 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">Grade</h2>
      <label className="block text-xs font-semibold text-ink-soft">
        Score (0–100)
        <input type="number" min={0} max={100} step={1} inputMode="numeric" value={s} onChange={(e) => { setS(e.target.value); setState({}); }} className={`${field} mt-1.5 max-w-32 text-lg font-bold`} />
      </label>
      <label className="block text-xs font-semibold text-ink-soft">
        Feedback for the student
        <textarea rows={5} maxLength={3000} value={f} onChange={(e) => { setF(e.target.value); setState({}); }} placeholder="What went well, what to improve…" className={`${field} mt-1.5`} />
      </label>
      {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={!!state.busy || s === ""} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {state.busy === "grade" ? <LoaderCircle className="size-3.5 animate-spin" /> : "Save grade"}
        </button>
        <button type="button" disabled={!!state.busy} onClick={() => send("return")}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink disabled:opacity-60">
          {state.busy === "return" ? <LoaderCircle className="size-3.5 animate-spin" /> : <><RotateCcw className="size-3.5" /> Ask to resubmit</>}
        </button>
      </div>
      <p className="text-[11px] text-muted">&ldquo;Ask to resubmit&rdquo; sends your feedback and lets the student hand it in again.</p>
    </form>
  );
}
