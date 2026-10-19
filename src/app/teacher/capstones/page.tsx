import type { Metadata } from "next";
import { BadgeDollarSign, Rocket } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { when } from "@/components/learn/ProgressViews";
import { Avatar } from "@/components/portal/Avatar";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { listCapstones } from "@/lib/server/capstone";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Capstones · Exambites", robots: { index: false } };

const BADGE = {
  submitted: ["To review", "bg-brand-500/15 text-brand-700"],
  rejected: ["Rejected", "bg-red-500/15 text-red-500"],
  approved: ["Approved", "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"],
} as const;

export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Capstones />
    </Suspense>
  );
}

async function Capstones() {
  const user = await requireRole("teacher");
  const rows = await listCapstones();
  const waiting = rows.filter((r) => r.status === "submitted").length;
  return (
    <PortalShell role="teacher" user={user}>
      <div className="mb-6">
        <PageTitle eyebrow={waiting ? `${waiting} to review` : "Teacher"} title="Capstones" />
        <p className="mt-2 text-sm text-ink-soft">Final projects and proofs of earning from students who finished every course. Approve them or send them back with feedback.</p>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-surface-card">
          {rows.map((r) => {
            const [label, tone] = BADGE[r.status];
            return (
              <li key={r.id}>
                <Link href={`/teacher/capstones/${r.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-ink/[0.03] sm:p-5">
                  <Avatar name={r.studentName} image={r.studentImage} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{r.studentName}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-ink-soft">
                      {r.kind === "earning" ? <BadgeDollarSign className="size-3.5 shrink-0" /> : <Rocket className="size-3.5 shrink-0" />}
                      <span className="truncate">{r.title} · {when(r.submittedAt)}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-3xl border border-ink/10 bg-surface-card p-8 text-center text-sm text-ink-soft">No capstones handed in yet.</p>
      )}
    </PortalShell>
  );
}
