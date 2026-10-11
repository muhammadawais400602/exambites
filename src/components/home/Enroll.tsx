"use client";

import { motion } from "motion/react";
import { enroll } from "@/content/home";
import { MagneticButton } from "@/components/ui/MagneticButton";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Final call to action before the FAQ. */
export function Enroll() {
  return (
    <section id="enroll" className="relative overflow-hidden bg-surface px-4 py-24 md:py-32">
      {/* Slow drifting glow */}
      <motion.div
        aria-hidden
        animate={{ x: ["-10%", "10%", "-10%"], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[min(900px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(254,240,138,0.6),rgba(254,243,199,0.3)_50%,transparent)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.h2
          {...rise(0)}
          className="text-balance font-display text-[clamp(2rem,5.5vw,3.6rem)] font-black uppercase leading-[0.98] tracking-[-0.04em] text-ink"
        >
          {enroll.title.lead} <span className="text-brand-gradient">{enroll.title.highlight}</span>
        </motion.h2>
        <motion.p {...rise(0.1)} className="mt-5 max-w-md text-base text-ink-soft md:text-lg">
          {enroll.body}
        </motion.p>
        <motion.div {...rise(0.2)} className="mt-9">
          <MagneticButton
            href={enroll.cta.href}
            className="rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-9 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-10px_rgba(217,119,6,0.6)] transition-shadow hover:shadow-[0_24px_50px_-10px_rgba(217,119,6,0.75)]"
          >
            {enroll.cta.label}
            <span aria-hidden className="h-4 w-px bg-white/60" />
            {enroll.cta.price}
          </MagneticButton>
        </motion.div>
        <motion.p
          {...rise(0.3)}
          className="mt-5 flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
        >
          {enroll.note[0]}
          <span aria-hidden className="size-1 rounded-full bg-brand-600" />
          {enroll.note[1]}
        </motion.p>
      </div>
    </section>
  );
}
