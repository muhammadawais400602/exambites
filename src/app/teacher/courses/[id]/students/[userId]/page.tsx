import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonProgressList } from "@/components/learn/ProgressViews";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getCourse } from "@/lib/server/courses";
import { courseRoster, studentCourseProgress } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";

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
  const lessons = await studentCourseProgress(userId, course.id);
  return (
    <PortalShell role="teacher" name={user.name}>
      <Link href={`/teacher/courses/${course.id}`} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`${student.passed}/${student.total} lessons${student.avgScore === null ? "" : ` · avg ${student.avgScore}%`}`} title={student.name}>
          <p className="text-sm text-ink-soft">{student.email}</p>
        </PageTitle>
      </div>
      <LessonProgressList lessons={lessons} />
    </PortalShell>
  );
}
