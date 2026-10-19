"use client";

import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

/** Teacher review: approve the work (next lesson opens) or reject it with feedback (student redoes it). */
export function GradeForm({ id, status, feedback, backHref }: {
  id: string; status: "submitted" | "approved" | "rejected"; feedback: string; backHref: string;
}) {
  const router = useRouter();
  const [f, setF] = useState(feedback);
  const [state, setState] = useState<{ busy?: string; error?: string }>({});

  async function send(action: "approve" | "reject") {
    if (action === "reject" && !f.trim()) return setState({ error: "Tell the student what to change." });
    setState({ busy: action });
    const res = await fetch(`/api/submissions/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, feedback: f }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) return setState({ error: data?.error ?? "Connection problem. Try again." });
    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); send("approve"); }} className="space-y-4 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">Review</h2>
        {status !== "submitted" && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status === "approved" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-500"}`}>
            {status === "approved" ? "Approved" : "Rejected"}
          </span>
        )}
      </div>
      <label className="block text-xs font-semibold text-ink-soft">
        Feedback for the student {status === "submitted" && <span className="font-normal text-muted">(needed to reject)</span>}
        <textarea rows={5} maxLength={3000} value={f} onChange={(e) => { setF(e.target.value); setState({}); }} placeholder="What went well, what to change…" className={`${field} mt-1.5`} />
      </label>
      {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={!!state.busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
          {state.busy === "approve" ? <LoaderCircle className="size-3.5 animate-spin" /> : <><CheckCircle2 className="size-3.5" /> Approve</>}
        </button>
        <button type="button" disabled={!!state.busy} onClick={() => send("reject")}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
          {state.busy === "reject" ? <LoaderCircle className="size-3.5 animate-spin" /> : <><XCircle className="size-3.5" /> Reject</>}
        </button>
      </div>
      <p className="text-[11px] text-muted">Approving opens the student&apos;s next lesson. Rejecting sends your feedback and asks them to redo it.</p>
    </form>
  );
}
