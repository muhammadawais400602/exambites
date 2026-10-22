"use client";

import { Download } from "lucide-react";

/** Download as PDF: the browser's "Save as PDF" print, one landscape A4 page. */
export function CertificateActions() {
  return (
    <button type="button" onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 print:hidden">
      <Download className="size-4" /> Download PDF
    </button>
  );
}
