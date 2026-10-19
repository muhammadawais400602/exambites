import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonProgressList } from "@/components/learn/ProgressViews";
import { Avatar } from "@/components/portal/Avatar";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getCourse } from "@/lib/server/courses";
import { courseRoster, studentCourseProgress } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";
import { studentRecord } from "@/lib/server/students";
import { StudentActions } from "@/components/staff/StudentTable";

export const metadata: Metadata = { title: "Student progress · Exambites", robots: { index: false } };

type Params = PageProps<"/teacher/courses/[id]/students/[userId]">["params"];

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Student params={params} />
    </Suspense>
  );
}

async function Student({ params }: { params: Params }) {
  const user = await requireRole("teacher");
  const { id, userId } = await params;
  const course = await getCourse(id);
  if (!course || !course.teacherIds?.includes(user.id)) notFound();
  // Teachers only see students who are on, or finished, one of their courses.
  const student = (await courseRoster(course.id)).find((r) => r.userId === userId);
  if (!student) notFound();
  const [lessons, record] = await Promise.all([studentCourseProgress(userId, course.id), studentRecord(userId)]);
  const school = record ? [record.regNo && `Reg No ${record.regNo}`, record.className, record.section && `Section ${record.section}`, record.campus].filter(Boolean).join(" · ") : "";
  return (
    <PortalShell role="teacher" user={user}>
      <Link href={`/teacher/courses/${course.id}`} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`${student.passed}/${student.total} lessons${student.avgScore === null ? "" : ` · avg ${student.avgScore}%`}`} title={student.name}>
          <Avatar name={student.name} image={student.image} size={56} />
        </PageTitle>
      </div>
      {record && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">{school || "No school details yet."} {record.disabled && <span className="ml-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">Disabled</span>}</p>
          <StudentActions student={record} />
        </div>
      )}
      <LessonProgressList lessons={lessons} reviewHref={(sid) => `/teacher/courses/${course.id}/submissions/${sid}`} />
    </PortalShell>
  );
}
