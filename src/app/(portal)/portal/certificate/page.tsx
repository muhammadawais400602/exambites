import type { Metadata } from "next";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CertificateActions } from "@/components/learn/CertificateActions";
import { CertificateCard } from "@/components/learn/CertificateCard";
import { PageTitle, PortalLoading } from "@/components/portal/PortalShell";
import { certificateQr, issueCertificateIfEarned, verifyUrl } from "@/lib/server/certificates";
import { capstoneProgress, getCapstone } from "@/lib/server/capstone";
import { requireRole } from "@/lib/server/session";

export const metadata: Metadata = { title: "Certificate · School of Tomorrow", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Certificate />
    </Suspense>
  );
}

async function Certificate() {
  const user = await requireRole("student");
  // Issues it on first visit for capstones approved before certificates existed.
  const cert = await issueCertificateIfEarned(user.id);
  if (!cert) {
    const [progress, capstone] = await Promise.all([capstoneProgress(user.id), getCapstone(user.id)]);
    const left = !progress.unlocked
      ? `Finish all your courses (${progress.done} of ${progress.total} done), then hand in your capstone.`
      : !capstone ? "Hand in your capstone project or proof of earning."
        : capstone.status === "rejected" ? "Update your capstone and submit it again."
          : "Your capstone is waiting for a teacher's review.";
    return (
      <>
        <PageTitle eyebrow="Your achievement" title="Certificate" />
        <section className="mt-6 flex items-start gap-4 rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-700"><Lock className="size-5" /></span>
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">Not earned yet</h2>
            <p className="mt-1 text-sm text-ink-soft">You get your certificate when every course is complete and your capstone is approved. {left}</p>
            <Link href={progress.unlocked ? "/portal/capstone" : "/portal/courses"} className="mt-3 inline-block text-xs font-bold text-brand-700 hover:underline">
              {progress.unlocked ? "Go to capstone →" : "Go to my courses →"}
            </Link>
          </div>
        </section>
      </>
    );
  }
  const link = verifyUrl(cert.code);
  return (
    <>
      <div className="print:hidden">
        <PageTitle eyebrow="Your achievement" title="Certificate">
          <CertificateActions verifyLink={link} />
        </PageTitle>
        <p className="mt-2 text-sm text-ink-soft">Anyone can check it by scanning the QR code or opening <a href={link} className="font-semibold text-brand-700 hover:underline">{link.replace(/^https?:\/\//, "")}</a>.</p>
      </div>
      <div className="mx-auto mt-6 max-w-5xl print:m-0 print:max-w-none">
        <CertificateCard cert={cert} qrSvg={await certificateQr(cert.code)} verifyHost={new URL(link).host.replace(/^www\./, "")} />
      </div>
    </>
  );
}
