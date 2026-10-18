import Link from "next/link";
import { Avatar } from "@/components/portal/Avatar";
import type { ReviewRow } from "@/lib/server/assignments";
import { when } from "./ProgressViews";

const BADGE = {
  submitted: "bg-brand-500/15 text-brand-700",
  returned: "bg-ink/10 text-ink-soft",
  graded: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
} as const;

/** Assignment submissions for a course, waiting ones first. */
export function SubmissionList({ rows, hrefFor }: { rows: ReviewRow[]; hrefFor: (id: string) => string }) {
  if (!rows.length) return <p className="rounded-3xl border border-ink/10 bg-surface-card p-8 text-center text-sm text-ink-soft">No assignments handed in yet.</p>;
  return (
    <ul className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-surface-card">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={hrefFor(r.id)} className="flex items-center gap-3 p-4 transition-colors hover:bg-ink/[0.03] sm:p-5">
            <Avatar name={r.studentName} image={r.studentImage} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{r.studentName}</p>
              <p className="truncate text-xs text-ink-soft">Lesson {r.lessonOrder}: {r.lessonTitle} · {when(r.submittedAt)}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${BADGE[r.status]}`}>
              {r.status === "graded" ? `${r.score}/100` : r.status === "returned" ? "Redo asked" : "To grade"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
