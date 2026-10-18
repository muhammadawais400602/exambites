import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AddCourseForm } from "@/components/admin/courses";
import { AddTeacherForm, EnrollmentActions, ReferralActions, ReferralForm, TeacherActions, TeacherCourses } from "@/components/admin/actions";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { formatRs } from "@/lib/pricing";
import { lessonCounts, listCourses } from "@/lib/server/courses";
import { adminStats, listAudit, listEnrollments, listReferralCodes, listTeachers, type EnrollmentStatus } from "@/lib/server/queries";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Admin · Exambites", robots: { index: false } };

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "payments", label: "Payments" },
  { key: "courses", label: "Courses" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
  { key: "referrals", label: "Referral codes" },
  { key: "activity", label: "Activity" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const card = "rounded-3xl border border-ink/10 bg-surface-card";
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <AdminDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminDashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const user = await requireRole("admin");
  const raw = (await searchParams).tab;
  const tab: Tab = TABS.some((t) => t.key === raw) ? (raw as Tab) : "overview";
  const stats = await adminStats();

  return (
    <PortalShell role="admin" user={user}>
      <PageTitle eyebrow="Admin" title={TABS.find((t) => t.key === tab)!.label} />
      <nav aria-label="Admin sections" className="-mx-4 mt-6 overflow-x-auto px-4">
        <ul className="flex w-max gap-1 rounded-full border border-ink/10 bg-surface-card p-1">
          {TABS.map((t) => (
            <li key={t.key}>
              <Link href={t.key === "overview" ? "/admin" : `/admin?tab=${t.key}`} aria-current={t.key === tab ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${t.key === tab ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"}`}>
                {t.label}
                {t.key === "payments" && stats.pending > 0 && (
                  <span className={`rounded-full px-1.5 text-[10px] ${t.key === tab ? "bg-white/25" : "bg-brand-500/15 text-brand-700"}`}>{stats.pending}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6">
        {tab === "overview" && <Overview stats={stats} />}
        {tab === "payments" && <Enrollments status="pending" />}
        {tab === "courses" && <Courses />}
        {tab === "students" && <Enrollments />}
        {tab === "teachers" && <Teachers />}
        {tab === "referrals" && <Referrals />}
        {tab === "activity" && <Activity limit={100} />}
      </div>
    </PortalShell>
  );
}

function Overview({ stats }: { stats: Awaited<ReturnType<typeof adminStats>> }) {
  const tiles = [
    { label: "Payments to check", value: stats.pending, href: "/admin?tab=payments" },
    { label: "Active students", value: stats.approved, href: "/admin?tab=students" },
    { label: "Teachers", value: stats.teachers, href: "/admin?tab=teachers" },
    { label: "Live referral codes", value: stats.codes, href: "/admin?tab=referrals" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`${card} p-5 transition-colors hover:border-brand-600/40`}>
            <p className="font-display text-4xl font-black tracking-tight text-ink">{t.value}</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">{t.label}</p>
          </Link>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Recent activity</h2>
        <Activity limit={8} />
      </section>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className={`${card} p-8 text-center text-sm text-ink-soft`}>{children}</p>;
}

const STATUS_STYLE: Record<EnrollmentStatus, string> = {
  pending: "bg-brand-500/15 text-brand-700",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-500",
};

async function Enrollments({ status }: { status?: EnrollmentStatus }) {
  const rows = await listEnrollments(status);
  if (!rows.length) return <Empty>{status === "pending" ? "No payments waiting. You're all caught up." : "No students yet."}</Empty>;
  return (
    <ul className={`${card} divide-y divide-ink/10`}>
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{r.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[r.status]}`}>{r.status}</span>
            </div>
            <p className="mt-0.5 truncate text-sm text-ink-soft">{r.email} · {r.phone}</p>
            <p className="mt-1.5 text-xs text-muted">
              <span className="font-mono font-bold text-ink">{r.reference}</span> · {formatRs(r.amount)} via {r.method}
              {r.referralCode && <> · code {r.referralCode}</>} · {when(r.createdAt)}
              {r.note && <> · “{r.note}”</>}
            </p>
          </div>
          {r.status === "pending" && <EnrollmentActions id={r.id} />}
          {r.status === "approved" && (
            <Link href={`/admin/students/${r.userId}`} className="shrink-0 text-xs font-bold text-brand-700 hover:underline">Progress →</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

async function Courses() {
  const [courses, counts] = await Promise.all([listCourses(), lessonCounts()]);
  return (
    <div className="space-y-4">
      <ul className={`${card} divide-y divide-ink/10`}>
        {courses.map((c) => {
          const n = counts.get(c.id);
          return (
            <li key={c.id}>
              <Link href={`/admin/courses/${c.id}`} className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-ink/[0.03]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{c.title}</p>
                    {c.bonus && <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">Bonus</span>}
                    {!c.published && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">Hidden</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {c.category && <>{c.category} · </>}
                    {n ? `${n.published} of ${n.total} lessons visible` : "No lessons yet"}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-brand-700">Edit →</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={`${card} p-5`}>
        <AddCourseForm />
      </div>
    </div>
  );
}

async function Teachers() {
  const [rows, courses] = await Promise.all([listTeachers(), listCourses()]);
  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <p className="mb-3 text-sm text-ink-soft">Set a password yourself, or leave it empty to get an invite link the teacher uses to choose their own.</p>
        <AddTeacherForm />
      </div>
      {rows.length ? (
        <ul className={`${card} divide-y divide-ink/10`}>
          {rows.map((t) => (
            <li key={t.id} className={`space-y-4 p-5 ${t.disabled ? "opacity-60" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{t.name} {t.disabled && <span className="ml-1 text-xs font-medium text-muted">(removed)</span>}</p>
                  <p className="truncate text-sm text-ink-soft">{t.email}</p>
                </div>
                <TeacherActions id={t.id} name={t.name} email={t.email} disabled={t.disabled} />
              </div>
              {!t.disabled && (
                <TeacherCourses
                  id={t.id}
                  courses={courses.map((c) => ({ id: c.id, title: c.title }))}
                  assigned={courses.filter((c) => c.teacherIds?.includes(t.id)).map((c) => c.id)}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No teachers yet.</Empty>
      )}
    </div>
  );
}

async function Referrals() {
  const rows = await listReferralCodes();
  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <ReferralForm />
      </div>
      {rows.length ? (
        <ul className={`${card} divide-y divide-ink/10`}>
          {rows.map((c) => {
            const full = c.uses >= c.maxUses;
            const state = !c.active ? "Paused" : c.expired ? "Expired" : full ? "Used up" : "Live";
            return (
              <li key={c.code} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-base font-bold text-ink">{c.code}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${state === "Live" ? STATUS_STYLE.approved : "bg-ink/10 text-ink-soft"}`}>{state}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {c.uses} / {c.maxUses} used · {c.expiresAt ? `until ${new Date(c.expiresAt).toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" })}` : "no expiry"}
                    {c.note && <> · {c.note}</>}
                  </p>
                </div>
                <ReferralActions code={c.code} active={c.active} />
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>No referral codes yet.</Empty>
      )}
    </div>
  );
}

async function Activity({ limit }: { limit: number }) {
  const rows = await listAudit(limit);
  if (!rows.length) return <Empty>Nothing has happened yet.</Empty>;
  return (
    <ol className={`${card} divide-y divide-ink/10`}>
      {rows.map((a) => (
        <li key={a.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            {a.summary} <span className="text-ink-soft">· {a.actorName}</span>
          </p>
          <time dateTime={a.createdAt} className="shrink-0 text-xs text-muted">{when(a.createdAt)}</time>
        </li>
      ))}
    </ol>
  );
}
