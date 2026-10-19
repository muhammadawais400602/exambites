import type { Metadata } from "next";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Shots } from "@/components/learn/CapstoneForm";
import { GradeForm } from "@/components/learn/GradeForm";
import { when } from "@/components/learn/ProgressViews";
import { Avatar } from "@/components/portal/Avatar";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { CAPSTONE_KINDS, getCapstoneById } from "@/lib/server/capstone";
import { studentBasics } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Review capstone · Exambites", robots: { index: false } };

type Params = PageProps<"/teacher/capstones/[id]">["params"];

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({ params }: { params: Params }) {
  const user = await requireRole("teacher");
  const cap = await getCapstoneById((await params).id);
  if (!cap) notFound();
  const student = await studentBasics(cap.userId);
  return (
    <PortalShell role="teacher" user={user}>
      <Link href="/teacher/capstones" className="text-xs font-semibold text-muted hover:text-brand-700">← Capstones</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`Capstone · ${CAPSTONE_KINDS[cap.kind]}`} title={student?.name ?? "Student"}>
          <Avatar name={student?.name ?? "?"} image={student?.image} size={48} />
        </PageTitle>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Submitted {when(cap.submittedAt)}</p>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">{cap.title}</h2>
          {cap.description && <p className="whitespace-pre-wrap break-words text-sm text-ink">{cap.description}</p>}
          {cap.link && <a href={cap.link} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 break-all text-sm font-semibold text-brand-700 hover:underline"><Link2 className="size-4 shrink-0" /> {cap.link}</a>}
          <Shots files={cap.files.map((f) => ({ ...f, href: `/api/capstones/${cap.id}/files/${f.id}` }))} />
        </section>
        <GradeForm id={cap.id} endpoint="/api/capstones" status={cap.status} feedback={cap.status === "submitted" ? "" : cap.feedback}
          backHref="/teacher/capstones" approveHint="Approving marks the student's program as complete." />
      </div>
    </PortalShell>
  );
}
