import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WorkViewer } from "@/components/learn/WorkViewer";
import { GradeForm } from "@/components/learn/GradeForm";
import { when } from "@/components/learn/ProgressViews";
import { Avatar } from "@/components/portal/Avatar";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { canReview, getSubmissionById } from "@/lib/server/assignments";
import { getCourse, getLesson } from "@/lib/server/courses";
import { studentBasics } from "@/lib/server/progress";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Review assignment · School of Tomorrow", robots: { index: false } };

type Params = PageProps<"/teacher/courses/[id]/submissions/[subId]">["params"];

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({ params }: { params: Params }) {
  const user = await requireRole("teacher");
  const { id, subId } = await params;
  const [course, sub] = await Promise.all([getCourse(id), getSubmissionById(subId)]);
  if (!course || !sub || sub.courseId !== course.id || !(await canReview(user, course.id))) notFound();
  const [lesson, student] = await Promise.all([getLesson(sub.lessonId), studentBasics(sub.userId)]);
  const back = `/teacher/courses/${course.id}`;
  return (
    <PortalShell role="teacher" user={user}>
      <Link href={back} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`Lesson ${lesson?.order ?? "?"}: ${lesson?.title ?? ""}`} title={student?.name ?? "Student"}>
          <Avatar name={student?.name ?? "?"} image={student?.image} size={48} />
        </PageTitle>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {lesson?.assignment && (
            <section className="rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
              <h2 className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">The assignment</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{lesson.assignment.instructions}</p>
            </section>
          )}
          <section className="space-y-3 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
            <h2 className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Student&apos;s work · {when(sub.submittedAt)}</h2>
            {sub.text && <p className="whitespace-pre-wrap break-words text-sm text-ink">{sub.text}</p>}
            <WorkViewer link={sub.link} files={sub.files} openHref={(fid) => `/api/submissions/${sub.id}/files/${fid}`} />
          </section>
        </div>
        <div className="lg:sticky lg:top-32 lg:self-start xl:top-24"><GradeForm id={sub.id} status={sub.status} feedback={sub.status === "submitted" ? "" : sub.feedback} backHref={back} /></div>
      </div>
    </PortalShell>
  );
}
