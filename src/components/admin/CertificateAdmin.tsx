"use client";

import { Award, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** The student's certificate on the admin student page, with withdraw / restore. */
export function CertificateAdmin({ code, issued, revoked }: { code: string; issued: string; revoked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (!revoked && !confirm(`Withdraw certificate ${code}? The verify page will say it's no longer valid.`)) return;
    setBusy(true);
    await fetch(`/api/admin/certificates/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revoked: !revoked }) }).catch(() => null);
    setBusy(false);
    router.refresh();
  }
  return (
    <div className={`mb-6 flex flex-wrap items-center gap-3 rounded-3xl border p-4 ${revoked ? "border-red-500/30" : "border-emerald-500/30"} bg-surface-card`}>
      <Award className={`size-5 ${revoked ? "text-red-500" : "text-emerald-500"}`} />
      <p className="min-w-0 flex-1 text-sm text-ink">
        <span className="font-semibold">{revoked ? "Certificate withdrawn" : "Certificate issued"}</span> · {issued} · <a href={`/verify/${code}`} target="_blank" rel="noreferrer" className="font-mono text-brand-700 hover:underline">{code}</a>
      </p>
      <button type="button" onClick={toggle} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${revoked ? "border-ink/15 text-ink-soft hover:text-ink" : "border-red-500/30 text-red-500 hover:bg-red-500/10"}`}>
        {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : revoked ? "Restore" : "Withdraw"}
      </button>
    </div>
  );
}
