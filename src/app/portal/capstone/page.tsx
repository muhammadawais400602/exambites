import type { Metadata } from "next";
import { Lock, Trophy } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CapstoneForm } from "@/components/learn/CapstoneForm";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { capstoneProgress, getCapstone } from "@/lib/server/capstone";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Capstone · School of Tomorrow", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Capstone />
    </Suspense>
  );
}

async function Capstone() {
  const user = await requireRole("student");
  const [progress, capstone] = await Promise.all([capstoneProgress(user.id), getCapstone(user.id)]);
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <PortalShell role="student" user={user}>
      <div className="mb-6">
        <PageTitle eyebrow="Final step" title="Capstone" />
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Show what you can do with everything you&apos;ve learned: hand in a real <span className="font-semibold text-ink">project</span> you made, or <span className="font-semibold text-ink">proof of your first earning</span>. A teacher reviews it.
        </p>
      </div>
      {progress.unlocked || capstone ? (
        <CapstoneForm
          userId={user.id}
          uploadsReady={!!process.env.BLOB_READ_WRITE_TOKEN}
          capstone={capstone && { id: capstone.id, kind: capstone.kind, title: capstone.title, description: capstone.description, link: capstone.link, files: capstone.files, status: capstone.status, feedback: capstone.feedback, reviewedByName: capstone.reviewedByName }}
        />
      ) : (
        <section className="grid gap-6 rounded-3xl border border-ink/10 bg-surface-card p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
          <span className="relative grid size-20 place-items-center rounded-3xl bg-brand-500/10 text-brand-700">
            <Trophy className="size-9" />
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-surface-card ring-1 ring-ink/10"><Lock className="size-4 text-muted" /></span>
          </span>
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">Unlocks after your last course</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {progress.enrolled ? `You've finished ${progress.done} of ${progress.total} courses. Finish them all to open the capstone.` : "Your payment hasn't been approved yet."}
            </p>
            {progress.enrolled && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Courses finished">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${pct}%` }} />
              </div>
            )}
            <Link href="/portal/courses" className="mt-4 inline-block text-xs font-bold text-brand-700 hover:underline">Go to my courses →</Link>
          </div>
        </section>
      )}
    </PortalShell>
  );
}
