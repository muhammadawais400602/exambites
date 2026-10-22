"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

/** Download as PDF (the browser's "Save as PDF" print, one landscape page) and copy the verify link. */
export function CertificateActions({ verifyLink }: { verifyLink: string }) {
  const [copied, setCopied] = useState(false);
  const btn = "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors";
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}>
        <Download className="size-4" /> Download PDF
      </button>
      <button type="button" className={`${btn} border border-ink/15 text-ink-soft hover:text-ink`}
        onClick={async () => { await navigator.clipboard.writeText(verifyLink).catch(() => null); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
        {copied ? <><Check className="size-4 text-emerald-500" /> Link copied</> : <><Copy className="size-4" /> Copy verify link</>}
      </button>
    </div>
  );
}
