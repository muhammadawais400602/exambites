import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonEditor } from "@/components/admin/courses";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getCourse, getLesson } from "@/lib/server/courses";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Edit lesson · Exambites", robots: { index: false } };

type Params = PageProps<"/admin/courses/[id]/lessons/[lessonId]">["params"];

export default function LessonPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Params }) {
  const user = await requireRole("admin");
  const { id, lessonId } = await params;
  const [course, lesson] = await Promise.all([getCourse(id), getLesson(lessonId)]);
  if (!course || !lesson || lesson.courseId !== course.id) notFound();
  return (
    <PortalShell role="admin" name={user.name}>
      <Link href={`/admin/courses/${course.id}`} className="text-xs font-semibold text-muted hover:text-brand-700">← {course.title}</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow={`Lesson ${lesson.order}`} title={lesson.title} />
      </div>
      <LessonEditor lesson={{ id: lesson.id, courseId: course.id, title: lesson.title, summary: lesson.summary, videoId: lesson.videoId, notes: lesson.notes, questions: lesson.questions, published: lesson.published }} />
    </PortalShell>
  );
}
