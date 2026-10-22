"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

type Props = { verifyLink: string; code: string; program: string; org: string; issuedAt: string };

// Brand marks as simple inline SVG paths (lucide has no brand icons).
const ICONS = {
  linkedin: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  facebook: "M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.29L17.61 20.65z",
  whatsapp: "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.42z",
};

function Brand({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current"><path d={d} /></svg>;
}

const noop = () => () => {};

/** Share the certificate: social buttons, LinkedIn "add to profile", the phone's share sheet, and copy link. */
export function CertificateShare({ verifyLink, code, program, org, issuedAt }: Props) {
  const [copied, setCopied] = useState(false);
  // The phone's own share sheet, where the browser has one.
  const canShare = useSyncExternalStore(noop, () => typeof navigator !== "undefined" && "share" in navigator, () => false);
  const text = `I just earned my ${program} certificate from ${org}! 🎓 It's verified here:`;
  const u = encodeURIComponent(verifyLink);
  const issued = new Date(issuedAt);
  const links = [
    { key: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, tone: "hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2]" },
    { key: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, tone: "hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]" },
    { key: "x", label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${u}`, tone: "hover:bg-black hover:text-white hover:border-black" },
    { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${verifyLink}`)}`, tone: "hover:bg-[#25d366] hover:text-white hover:border-[#25d366]" },
  ] as const;
  const addToProfile = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: "CERTIFICATION_NAME", name: program, organizationName: org,
    issueYear: String(issued.getFullYear()), issueMonth: String(issued.getMonth() + 1), certUrl: verifyLink, certId: code,
  })}`;
  const btn = "inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors";

  return (
    <section aria-labelledby="share-title" className="rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6 print:hidden">
      <h2 id="share-title" className="font-display text-lg font-black uppercase tracking-tight text-ink">Share your achievement</h2>
      <p className="mt-1 text-sm text-ink-soft">The post links to your verify page, so anyone can check it&apos;s real.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={`${btn} ${l.tone}`}>
            <Brand d={ICONS[l.key]} /> {l.label}
          </a>
        ))}
        {canShare && (
          <button type="button" className={`${btn} hover:text-ink`} onClick={() => navigator.share({ title: `${program} certificate`, text, url: verifyLink }).catch(() => null)}>
            <Share2 className="size-4" /> More…
          </button>
        )}
        <button type="button" className={`${btn} hover:text-ink`}
          onClick={async () => { await navigator.clipboard.writeText(verifyLink).catch(() => null); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          {copied ? <><Check className="size-4 text-emerald-500" /> Link copied</> : <><Copy className="size-4" /> Copy link</>}
        </button>
      </div>
      <a href={addToProfile} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-[#0a66c2]/30 bg-[#0a66c2]/10 p-4 text-sm transition-colors hover:border-[#0a66c2]">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0a66c2] text-white"><Brand d={ICONS.linkedin} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">Add to your LinkedIn profile</span>
          <span className="block text-xs text-ink-soft">Opens LinkedIn&apos;s &ldquo;Licenses &amp; certifications&rdquo; form already filled in, with the ID and verify link.</span>
        </span>
      </a>
    </section>
  );
}
