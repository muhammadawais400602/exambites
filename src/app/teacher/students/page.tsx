import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { StudentTable } from "@/components/staff/StudentTable";
import { requireRole } from "@/lib/server/session";
import { teacherStudents } from "@/lib/server/students";

export const metadata: Metadata = { title: "Students · Exambites", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Students />
    </Suspense>
  );
}

async function Students() {
  const user = await requireRole("teacher");
  const students = await teacherStudents(user.id);
  return (
    <PortalShell role="teacher" user={user}>
      <div className="mb-6">
        <PageTitle eyebrow="Teacher" title="Students" />
        <p className="mt-2 text-sm text-ink-soft">Students on your courses. Click a name to see their progress; tap ✏️ to set a Reg No.</p>
      </div>
      <StudentTable students={students} />
    </PortalShell>
  );
}
