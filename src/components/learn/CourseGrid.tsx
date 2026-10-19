import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { PathCourse } from "@/lib/server/learning";
import { CourseCover } from "./CourseCover";

/** The student's courses as cover cards: open, completed, or locked until the one before is done. */
export function CourseGrid({ courses, progress }: { courses: PathCourse[]; progress: Map<string, { done: number; total: number }> }) {
  let coreNumber = 0;
  const numbered = courses.map((c) => ({ ...c, number: c.bonus ? 0 : ++coreNumber }));
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {numbered.map((c, i) => {
        const p = progress.get(c.id);
        const pct = c.state === "done" ? 100 : p?.total ? Math.round((p.done / p.total) * 100) : 0;
        const prev = numbered[i - 1];
        const body = (
          <>
            <CourseCover title={c.title} slug={c.slug} image={c.image} number={c.number} locked={c.state === "locked"} bonus={c.bonus} />
            <div className="flex flex-1 flex-col p-5">
              <h3 className={`font-display text-lg font-black uppercase leading-tight tracking-tight ${c.state === "locked" ? "text-ink-soft" : "text-ink"}`}>{c.title}</h3>
              {c.state === "current" && (
                <>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-ink-soft">{pct}%</span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-brand-700">
                    {pct > 0 ? "Continue" : "Start course"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </>
              )}
              {c.state === "done" && (
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Completed · review
                </span>
              )}
              {c.state === "locked" && (
                <p className="mt-auto pt-4 text-sm text-muted">
                  {c.bonus ? "Unlocks after all other courses" : prev ? `Complete ${prev.bonus ? "the bonus" : `Course ${prev.number}`} to unlock` : "Opens soon"}
                </p>
              )}
            </div>
          </>
        );
        const cls = `group flex h-full flex-col overflow-hidden rounded-3xl border bg-surface-card transition-[border-color,transform] ${c.state === "current" ? "border-brand-600/50 hover:-translate-y-0.5" : c.state === "done" ? "border-ink/10 hover:border-emerald-500/40" : "border-ink/10 opacity-75"}`;
        return (
          <li key={c.id}>
            {c.state === "locked" ? <div className={cls}>{body}</div> : <Link href={`/portal/courses/${c.slug}`} className={cls}>{body}</Link>}
          </li>
        );
      })}
    </ul>
  );
}
