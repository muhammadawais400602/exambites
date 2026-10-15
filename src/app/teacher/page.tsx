import type { Metadata } from "next";
import { MessageCircleQuestion } from "lucide-react";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Teacher · Exambites", robots: { index: false } };

export default function TeacherPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <TeacherHome />
    </Suspense>
  );
}

async function TeacherHome() {
  const user = await requireRole("teacher");
  return (
    <PortalShell role="teacher" name={user.name}>
      <PageTitle eyebrow="Teacher" title={`Hi ${user.name.split(" ")[0]}`} />
      <div className="mt-8 max-w-2xl rounded-3xl border border-ink/10 bg-surface-card p-8">
        <MessageCircleQuestion className="size-8 text-brand-700" />
        <h2 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-ink">No questions yet</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Once the admin assigns you to a course, student questions from its lessons show up here for you to answer.
        </p>
      </div>
    </PortalShell>
  );
}
