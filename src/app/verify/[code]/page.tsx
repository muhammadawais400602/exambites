import type { Metadata } from "next";
import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CertificateCard } from "@/components/learn/CertificateCard";
import { VerifyForm } from "@/components/learn/VerifyForm";
import { AuthFrame } from "@/components/portal/AuthFrame";
import { certificateByCode, certificateQr, verifyUrl } from "@/lib/server/certificates";

/** Title and description for link previews when a verify link is shared. */
export async function generateMetadata({ params }: { params: PageProps<"/verify/[code]">["params"] }): Promise<Metadata> {
  const cert = await certificateByCode(decodeURIComponent((await params).code)).catch(() => null);
  const base = { robots: { index: false } };
  if (!cert || cert.revoked) return { ...base, title: "Certificate check · School of Tomorrow" };
  const title = `${cert.name} · Certificate of Completion · School of Tomorrow`;
  const description = `${cert.name} completed the ${cert.program} at School of Tomorrow: ${cert.courses.length} courses and a capstone project. Verified certificate ${cert.code}.`;
  return { ...base, title, description, openGraph: { title, description, type: "website", siteName: "School of Tomorrow" }, twitter: { card: "summary_large_image", title, description } };
}

type Params = PageProps<"/verify/[code]">["params"];
type Search = PageProps<"/verify/[code]">["searchParams"];

export default function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <AuthFrame wide>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-ink/[0.06]" />}>
        <Result params={params} searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

/** Names compare loosely: case, accents, extra spaces and punctuation don't matter. */
const loose = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const issued = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" });

async function Result({ params, searchParams }: { params: Params; searchParams: Search }) {
  const raw = decodeURIComponent((await params).code);
  const sp = await searchParams;
  const typedName = typeof sp.name === "string" ? sp.name.trim().slice(0, 80) : "";
  const cert = await certificateByCode(raw);

  // Checked with a name: the ID is real but was issued to someone else, so the
  // certificate in hand has been altered. Don't reveal whose ID it is.
  if (cert && typedName && loose(typedName) !== loose(cert.name)) {
    return (
      <section className="rounded-3xl border border-red-500/30 bg-surface-card p-6 sm:p-8" aria-live="polite">
        <p className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-tight text-ink"><ShieldX className="size-7 text-red-500" /> Not genuine</p>
        <p className="mt-2 text-sm text-ink-soft">
          Certificate <span className="font-mono font-semibold text-ink">{cert.code}</span> exists, but it was <span className="font-semibold text-ink">not issued to &ldquo;{typedName}&rdquo;</span>. The name on the certificate you have doesn&apos;t match our records, so it may have been edited. Check the spelling and try again.
        </p>
        <div className="mt-5"><VerifyForm code={cert.code} name={typedName} /></div>
      </section>
    );
  }

  if (!cert) {
    return (
      <section className="rounded-3xl border border-red-500/30 bg-surface-card p-6 sm:p-8" aria-live="polite">
        <p className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-tight text-ink"><ShieldX className="size-7 text-red-500" /> Not a valid certificate</p>
        <p className="mt-2 text-sm text-ink-soft">We couldn&apos;t find a School of Tomorrow certificate with the ID <span className="font-mono font-semibold text-ink">{raw.slice(0, 40)}</span>. Check the ID and try again. If it still isn&apos;t found, the certificate wasn&apos;t issued by us.</p>
        <div className="mt-5"><VerifyForm code={raw.slice(0, 40)} name={typedName} /></div>
      </section>
    );
  }

  const rows: [string, React.ReactNode][] = [
    ["Awarded to", <span key="n" className="font-semibold text-ink">{cert.name}</span>],
    ["Program", cert.program],
    ["Courses", <ul key="c" className="space-y-0.5">{cert.courses.map((c) => <li key={c}>{c}</li>)}</ul>],
    ["Capstone", `“${cert.capstoneTitle}” (${cert.capstoneKind === "earning" ? "proof of earning" : "project"})`],
    ["Issued", issued(cert.issuedAt)],
    ["Certificate ID", <span key="i" className="font-mono">{cert.code}</span>],
  ];
  return (
    <div className="space-y-6">
      <section className={`rounded-3xl border bg-surface-card p-6 sm:p-8 ${cert.revoked ? "border-red-500/30" : "border-emerald-500/40"}`} aria-live="polite">
        {cert.revoked ? (
          <>
            <p className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-tight text-ink"><ShieldAlert className="size-7 text-red-500" /> Certificate withdrawn</p>
            <p className="mt-2 text-sm text-ink-soft">This certificate was issued by School of Tomorrow but has since been withdrawn, so it is <span className="font-semibold text-ink">no longer valid</span>.</p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-tight text-ink"><BadgeCheck className="size-7 text-emerald-500" /> Genuine certificate</p>
            <p className="mt-2 text-sm text-ink-soft">This certificate was issued by School of Tomorrow and is valid.{typedName && " The name matches our records."}</p>
          </>
        )}
        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-ink/10 pt-5 text-sm sm:grid-cols-[10rem_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:pt-0.5">{k}</dt>
              <dd className="-mt-2 text-ink-soft sm:mt-0">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      {!cert.revoked && (
        <CertificateCard cert={cert} qrSvg={await certificateQr(cert.code)} verifyHost={new URL(verifyUrl(cert.code)).host.replace(/^www\./, "")} />
      )}
      <p className="text-center text-xs text-muted"><Link href="/verify" className="hover:text-ink">Check another certificate</Link> · <Link href="/" className="hover:text-ink">schooloftomorrow.si</Link></p>
    </div>
  );
}
