import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/portal/Avatar";
import type { LessonProgress, RosterRow } from "@/lib/server/progress";

const card = "rounded-3xl border border-ink/10 bg-surface-card";

export const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Not started";

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${value}%` }} />
    </div>
  );
}

/** Students on a course, most recently active first. */
export function RosterList({ rows, hrefFor }: { rows: RosterRow[]; hrefFor: (userId: string) => string }) {
  if (!rows.length) return <p className={`${card} p-8 text-center text-sm text-ink-soft`}>No students on this course yet.</p>;
  return (
    <ul className={`${card} divide-y divide-ink/10`}>
      {rows.map((r) => {
        const pct = r.total ? Math.round((r.passed / r.total) * 100) : 0;
        return (
          <li key={r.userId}>
            <Link href={hrefFor(r.userId)} className="grid gap-3 p-5 transition-colors hover:bg-ink/[0.03] sm:grid-cols-[1.4fr_1fr_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={r.name} image={r.image} size={40} />
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-semibold text-ink">{r.name}</p>
                  {r.status === "done" && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed</span>}
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-ink-soft">
                  <span>{r.passed}/{r.total} lessons</span>
                  <span>{r.avgScore === null ? "No quizzes yet" : `Avg ${r.avgScore}%`}</span>
                </div>
                <Bar value={pct} />
              </div>
              <p className="text-xs text-muted sm:text-right">{r.lastActive ? `Active ${when(r.lastActive)}` : "Not started"}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** One student's lessons in a course: passed or not, scores and attempts. */
export function LessonProgressList({ lessons }: { lessons: LessonProgress[] }) {
  if (!lessons.length) return <p className={`${card} p-8 text-center text-sm text-ink-soft`}>This course has no lessons yet.</p>;
  return (
    <ol className={`${card} divide-y divide-ink/10`}>
      {lessons.map((l, i) => (
        <li key={l.id} className="flex items-center gap-4 p-4 sm:p-5">
          {l.passed ? <CheckCircle2 className="size-5 shrink-0 text-emerald-500" /> : <Circle className="size-5 shrink-0 text-ink/25" />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink"><span className="mr-2 font-label text-xs text-muted">{i + 1}</span>{l.title}</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {l.attempts === 0
                ? "Not attempted"
                : l.questions
                  ? `Best ${l.bestScore}% · last ${l.lastScore}% · ${l.attempts} attempt${l.attempts === 1 ? "" : "s"}`
                  : "Marked as watched"}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted">{l.lastAttempt ? when(l.lastAttempt) : ""}</span>
        </li>
      ))}
    </ol>
  );
}
