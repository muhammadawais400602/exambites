import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseGrid } from "@/components/learn/CourseGrid";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { pathProgress, studentPath } from "@/lib/server/learning";
import { requireRole } from "@/lib/server/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Courses · School of Tomorrow", robots: { index: false } };

export default function CoursesPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Courses />
    </Suspense>
  );
}

async function Courses() {
  const user = await requireRole("student");
  const path = await studentPath(user.id);
  if (!path) redirect("/portal");
  const progress = await pathProgress(user.id, path.courses);
  return (
    <PortalShell role="student" user={user}>
      <PageTitle eyebrow="Courses" title="All courses">
        <p className="max-w-sm text-sm text-ink-soft">One course at a time. Finishing one opens the next.</p>
      </PageTitle>
      <div className="mt-8">
        <CourseGrid courses={path.courses} progress={progress} />
      </div>
    </PortalShell>
  );
}
