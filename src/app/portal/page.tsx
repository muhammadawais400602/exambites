import type { Metadata } from "next";
import { CheckCircle2, Clock, Lock, PlayCircle, XCircle } from "lucide-react";
import { Suspense } from "react";
import { PageTitle, PortalLoading, PortalShell } from "@/components/portal/PortalShell";
import { courses } from "@/content/courses";
import { checkout, type PaymentMethod } from "@/content/enroll";
import { formatRs } from "@/lib/pricing";
import { getEnrollment } from "@/lib/server/queries";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "My courses · Exambites", robots: { index: false } };

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
    <PortalShell role="student" name={user.name}>
      {enrollment?.status === "approved" ? (
        <>
          <PageTitle eyebrow="My courses" title={`Welcome, ${first}`}>
            <p className="max-w-sm text-sm text-ink-soft">Finish AI Basics first. After each course you pick the next one.</p>
          </PageTitle>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => {
              const open = i === 0;
              return (
                <li key={c.title} className={`${card} relative flex flex-col !p-6 ${open ? "border-brand-600/40" : "opacity-70"}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-500/10 text-brand-700">
                      <c.Icon className="size-5" />
                    </span>
                    <span className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {c.bonus ? "Bonus" : `Course ${String(i + 1).padStart(2, "0")}`}
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-xl font-black uppercase tracking-tight text-ink">{c.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{c.category}</p>
                  <div className="mt-auto pt-6">
                    {open ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-bold text-white">
                        <PlayCircle className="size-4" /> Lessons coming soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Lock className="size-3.5" /> {c.bonus ? "Unlocks after all five courses" : "Unlocks after your current course"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
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
