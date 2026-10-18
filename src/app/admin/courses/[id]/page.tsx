import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CourseForm, LessonList } from "@/components/admin/courses";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { getCourse, listLessons } from "@/lib/server/courses";
import { listTeachers } from "@/lib/server/queries";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Edit course · Exambites", robots: { index: false } };

export default function CoursePage({ params }: PageProps<"/admin/courses/[id]">) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <CourseEditor params={params} />
    </Suspense>
  );
}

async function CourseEditor({ params }: { params: PageProps<"/admin/courses/[id]">["params"] }) {
  const user = await requireRole("admin");
  const course = await getCourse((await params).id);
  if (!course) notFound();
  const [lessons, teachers] = await Promise.all([listLessons(course.id), listTeachers()]);
  return (
    <PortalShell role="admin" user={user}>
      <Link href="/admin?tab=courses" className="text-xs font-semibold text-muted hover:text-brand-700">← All courses</Link>
      <div className="mt-3">
        <PageTitle eyebrow={course.bonus ? "Bonus course" : `Course ${String(course.order).padStart(2, "0")}`} title={course.title} />
      </div>
      <section className="mt-6 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
        <CourseForm course={{ id: course.id, title: course.title, category: course.category, description: course.description, published: course.published, bonus: course.bonus, teacherIds: course.teacherIds ?? [] }}
          teachers={teachers.filter((t) => !t.disabled).map((t) => ({ id: t.id, name: t.name }))}
        />
      </section>
      <h2 className="mb-3 mt-10 font-display text-lg font-black uppercase tracking-tight text-ink">Lessons</h2>
      <LessonList
        courseId={course.id}
        lessons={lessons.map((l) => ({ id: l.id, title: l.title, published: l.published, videoId: l.videoId, questions: l.questions.length }))}
      />
    </PortalShell>
  );
}
