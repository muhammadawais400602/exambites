import type { Metadata } from "next";
import { Award, CheckCircle2, Clock, Lock, PlayCircle, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { checkout, type PaymentMethod } from "@/content/enroll";
import { formatRs } from "@/lib/pricing";
import { pathProgress, pendingCelebration, studentPath } from "@/lib/server/learning";
import { PendingCelebration } from "@/components/learn/CourseCompleteDialog";
import { getProfile } from "@/lib/server/profile";
import { certificateFor } from "@/lib/server/certificates";
import { CourseGrid } from "@/components/learn/CourseGrid";
import { CourseIcon } from "@/components/learn/CourseCover";
import { getEnrollment } from "@/lib/server/queries";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Dashboard · School of Tomorrow", robots: { index: false } };

const card = "rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8";

export default function PortalPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <StudentPortal />
    </Suspense>
  );
}

async function StudentPortal() {
  const user = await requireRole("student");
  const enrollment = await getEnrollment(user.id);
  const first = user.name.split(" ")[0];

  return (
    <PortalShell role="student" user={user}>
      {enrollment?.status === "approved" ? (
        <CoursePath userId={user.id} first={first} />
      ) : enrollment?.status === "rejected" ? (
        <>
          <PageTitle eyebrow="Payment" title="Payment not confirmed" />
          <div className={`${card} mt-8 max-w-2xl`}>
            <XCircle className="size-8 text-red-500" />
            <p className="mt-4 text-ink">We couldn&apos;t match a payment to reference <strong>{enrollment.reference}</strong>.</p>
            {enrollment.note && <p className="mt-3 rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink-soft">{enrollment.note}</p>}
            <p className="mt-4 text-sm text-ink-soft">Reply to the email we sent you with your payment screenshot and we&apos;ll check again.</p>
          </div>
        </>
      ) : enrollment ? (
        <Pending reference={enrollment.reference} amount={enrollment.amount} method={enrollment.method} first={first} />
      ) : (
        <>
          <PageTitle eyebrow="My courses" title="No enrollment yet" />
          <p className={`${card} mt-8 max-w-2xl text-ink-soft`}>This account has no seat attached. Contact us if you think that&apos;s wrong.</p>
        </>
      )}
    </PortalShell>
  );
}

async function CoursePath({ userId, first }: { userId: string; first: string }) {
  const [path, profile, celebrate, cert] = await Promise.all([studentPath(userId), getProfile(userId), pendingCelebration(userId), certificateFor(userId)]);
  const list = path?.courses ?? [];
  const progress = await pathProgress(userId, list);
  const core = list.filter((c) => !c.bonus);
  const doneCount = core.filter((c) => c.state === "done").length;
  const current = list.find((c) => c.state === "current");
  const currentProgress = current ? progress.get(current.id) : undefined;
  const pct = core.length ? Math.round((doneCount / core.length) * 100) : 0;
  let n = 0;

  return (
    <>
      {celebrate && <PendingCelebration completion={celebrate} />}
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.03em] text-ink md:text-4xl">Welcome, {first}</h1>
        <p className="mt-1 text-sm text-ink-soft">{[profile.city, "School of Tomorrow"].filter(Boolean).join(" · ")}</p>
      </div>

      <section className="mt-5 grid overflow-hidden rounded-3xl border border-ink/10 bg-surface-card lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-700"><Award className="size-5" /></span>
              <div>
                <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">AI Skills Program</h2>
                <p className="text-sm text-ink-soft">One payment covering every course</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Approved</span>
          </div>
          <p className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-ink">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> You&apos;re enrolled. Courses open one by one as you finish them.
          </p>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-ink-soft">
              <span>{doneCount} of {core.length} courses completed</span><span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Program progress">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {current && (
            <Link href={`/portal/courses/${current.slug}`} className="group mt-6 flex items-center justify-between gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white transition-colors hover:bg-brand-700">
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">{currentProgress?.done ? "Continue" : "Start"}</span>
                <span className="block truncate font-display text-lg font-black uppercase tracking-tight">{current.title}</span>
              </span>
              <PlayCircle className="size-7 shrink-0 transition-transform group-hover:scale-110" />
            </Link>
          )}
        </div>
        <div className="relative overflow-hidden bg-[#120d08] p-6 sm:p-8">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_100%_0%,color-mix(in_srgb,var(--color-brand-500)_40%,transparent),transparent_65%),radial-gradient(70%_60%_at_0%_100%,color-mix(in_srgb,var(--color-brand-800)_60%,transparent),transparent_70%)]" />
          <div className="relative flex h-full flex-col">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-brand-300">Your path</p>
            <p className="mt-1 font-display text-2xl font-black uppercase leading-none tracking-tight text-white">{core.length} skills. One career.</p>
            <ol className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
              {list.map((c) => {
                const num = c.bonus ? "★" : String(++n).padStart(2, "0");
                return (
                  <li key={c.id} className={`flex flex-col items-center rounded-2xl border p-2.5 text-center ${c.state === "current" ? "border-brand-400 bg-white/10" : "border-white/10 bg-white/[0.04]"} ${c.state === "locked" ? "opacity-50" : ""}`}>
                    <span className="font-label text-[10px] font-bold text-brand-300">{num}</span>
                    <span className={`mt-1.5 grid size-9 place-items-center rounded-full ${c.state === "done" ? "bg-emerald-500 text-white" : "bg-white/10 text-white"}`}>
                      {c.state === "done" ? <CheckCircle2 className="size-4" /> : c.state === "locked" ? <Lock className="size-3.5" /> : <CourseIcon slug={c.slug} className="size-4" />}
                    </span>
                    <span className="mt-1.5 line-clamp-3 break-words text-[9px] font-bold uppercase leading-tight tracking-wide text-white/80">{c.title}</span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-auto pt-8 text-center font-label text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Learn · Practice · Earn · Grow</p>
          </div>
        </div>
      </section>

      {cert ? (
        <Link href="/portal/certificate" className="mt-6 flex items-center gap-4 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-transparent p-5 transition-colors hover:border-emerald-500">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white"><Award className="size-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-black uppercase tracking-tight text-ink">Program complete</span>
            <span className="block text-sm text-ink-soft">Your certificate is ready. Download it or share its verify link.</span>
          </span>
          <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">View →</span>
        </Link>
      ) : core.length > 0 && doneCount === core.length && (
        <Link href="/portal/capstone" className="mt-6 flex items-center gap-4 rounded-3xl border border-brand-600/40 bg-gradient-to-r from-brand-500/15 to-transparent p-5 transition-colors hover:border-brand-600">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white"><Trophy className="size-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-black uppercase tracking-tight text-ink">Capstone unlocked</span>
            <span className="block text-sm text-ink-soft">Hand in your first project or proof of earning to complete the program.</span>
          </span>
          <span className="shrink-0 text-sm font-bold text-brand-700">Open →</span>
        </Link>
      )}

      <div className="mb-5 mt-12 flex items-end justify-between">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">My courses</h2>
        <Link href="/portal/courses" className="text-sm font-semibold text-brand-700 hover:underline">All courses →</Link>
      </div>
      <CourseGrid courses={list} progress={progress} />
    </>
  );
}

function Pending({ reference, amount, method, first }: { reference: string; amount: number; method: string; first: string }) {
  const account = checkout.accounts[method as PaymentMethod];
  const steps = [
    { title: "Send the payment", body: account?.number ? `${formatRs(amount)} to ${account.title}, ${account.number} (${method}).` : `${formatRs(amount)} by ${method}. Account details are in your email.` },
    { title: "Add your reference", body: `Write ${reference} in the payment note, or reply to our email with a screenshot.` },
    { title: "We confirm it", body: "Usually within a few hours. You'll get an email and AI Basics unlocks here." },
  ];
  return (
    <>
      <PageTitle eyebrow="Almost there" title={`Hi ${first}, your seat is held`} />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className={card}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700">
            <Clock className="size-3.5" /> Waiting for payment
          </span>
          <p className="mt-6 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Reference</p>
          <p className="mt-1 font-display text-4xl font-black tracking-tight text-ink">{reference}</p>
          <p className="mt-6 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Amount</p>
          <p className="mt-1 font-display text-2xl font-black text-brand-700">{formatRs(amount)}</p>
        </div>
        <ol className={`${card} space-y-6`}>
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-600/40 font-label text-xs font-bold text-brand-700">
                {i === 2 ? <CheckCircle2 className="size-4" /> : i + 1}
              </span>
              <div>
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
          <li className="border-t border-ink/10 pt-5 text-xs text-muted">{checkout.policy}</li>
        </ol>
      </div>
    </>
  );
}
