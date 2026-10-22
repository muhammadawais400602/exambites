import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VerifyForm } from "@/components/learn/VerifyForm";
import { AuthFrame } from "@/components/portal/AuthFrame";
import { normaliseCode } from "@/lib/server/certificates";

export const metadata: Metadata = { title: "Verify a certificate · School of Tomorrow", description: "Check that a School of Tomorrow certificate is genuine." };

export default function Page({ searchParams }: PageProps<"/verify">) {
  return (
    <AuthFrame>
      <section className="rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8">
        <p className="font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Certificate check</p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-ink">Verify a certificate</h1>
        <p className="mt-2 text-sm text-ink-soft">Scan the QR code on the certificate, or type its ID and the name printed on it. Both must match our records.</p>
        <div className="mt-5">
          <Suspense fallback={<VerifyForm />}>
            <Lookup searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </AuthFrame>
  );
}

async function Lookup({ searchParams }: { searchParams: PageProps<"/verify">["searchParams"] }) {
  const sp = await searchParams;
  const typed = typeof sp.code === "string" ? sp.code : "";
  const name = typeof sp.name === "string" ? sp.name.trim().slice(0, 80) : "";
  const code = typed ? normaliseCode(typed) : null;
  if (code) redirect(`/verify/${code}${name ? `?name=${encodeURIComponent(name)}` : ""}`);
  return (
    <>
      <VerifyForm code={typed} name={name} />
      {typed && <p role="alert" className="mt-3 text-sm font-medium text-red-500">That doesn&apos;t look like a certificate ID. It looks like SOT-26-XXXX-XXXX.</p>}
    </>
  );
}
