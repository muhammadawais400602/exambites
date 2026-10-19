import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RosterList } from "@/components/learn/ProgressViews";
import { SubmissionList } from "@/components/learn/SubmissionList";
import { courseSubmissions } from "@/lib/server/assignments";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getCourse } from "@/lib/server/courses";
import { courseRoster } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Course students · School of Tomorrow", robots: { index: false } };

type Params = PageProps<"/teacher/courses/[id]">["params"];

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Roster params={params} />
    </Suspense>
  );
}

async function Roster({ params }: { params: Params }) {
  const user = await requireRole("teacher");
  const course = await getCourse((await params).id);
  if (!course || !course.teacherIds?.includes(user.id)) notFound();
  const [rows, submissions] = await Promise.all([courseRoster(course.id), courseSubmissions(course.id)]);
  const waiting = submissions.filter((x) => x.status === "submitted").length;
  return (
    <PortalShell role="teacher" user={user}>
      <Link href="/teacher" className="text-xs font-semibold text-muted hover:text-brand-700">← My courses</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`${rows.length} student${rows.length === 1 ? "" : "s"}`} title={course.title} />
      </div>
      <h2 className="mb-3 font-display text-lg font-black uppercase tracking-tight text-ink">
        Assignments {waiting > 0 && <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 align-middle text-xs text-white">{waiting} to review</span>}
      </h2>
      <SubmissionList rows={submissions} hrefFor={(id) => `/teacher/courses/${course.id}/submissions/${id}`} />
      <h2 className="mb-3 mt-10 font-display text-lg font-black uppercase tracking-tight text-ink">Students</h2>
      <RosterList rows={rows} hrefFor={(id) => `/teacher/courses/${course.id}/students/${id}`} />
    </PortalShell>
  );
}
