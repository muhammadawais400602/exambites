"use client";

import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";
import { finalCta, midCta } from "@/content/testimonials";
import { MagneticButton } from "@/components/ui/MagneticButton";

const NOTE_ICONS = [Zap, Users, ShieldCheck];

const rise = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

/** Light boxed call to action between the video stories and the posts. */
export function MidCta() {
  return (
    <section className="bg-surface px-4 pb-20 md:pb-28">
      <motion.div
        {...rise}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-ink/10 bg-surface-card px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        {/* Corner ticks */}
        {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "left-4 bottom-4 border-l border-b", "right-4 bottom-4 border-r border-b"].map((c) => (
          <span key={c} aria-hidden className={`absolute size-4 border-brand-600/50 ${c}`} />
        ))}
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{midCta.eyebrow}</span>
        <h2 className="mx-auto mt-3 max-w-xl text-balance font-display text-[clamp(1.8rem,4.5vw,2.8rem)] font-black uppercase leading-[1] tracking-[-0.035em] text-ink">
          {midCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">{midCta.body}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton
            href={midCta.primary.href}
            className="rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-7 py-3.5 font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_-10px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)]"
          >
            {midCta.primary.label}
          </MagneticButton>
          <a
            href={midCta.secondary.href}
            className="group inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 font-label text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-brand-600/60 hover:text-brand-700"
          >
            {midCta.secondary.label}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/** Dark closing call to action at the bottom of the page. */
export function FinalCta() {
  return (
    <section className="bg-surface-card px-4 pb-20 md:pb-28">
      <motion.div
        {...rise}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-night px-6 py-16 text-center text-white sm:px-12 md:py-20"
      >
        <motion.div
          aria-hidden
          animate={{ x: ["-15%", "15%", "-15%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[min(700px,120vw)] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"
        />
        <div className="relative">
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-400">{finalCta.eyebrow}</span>
          <h2 className="mx-auto mt-3 max-w-3xl text-balance font-display text-[clamp(2rem,5.5vw,3.8rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-white/65">{finalCta.body}</p>
          <div className="mt-9 flex justify-center">
            <MagneticButton
              href={finalCta.cta.href}
              className="rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-8 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--color-brand-600)_70%,transparent)]"
            >
              {finalCta.cta.label}
            </MagneticButton>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            {finalCta.notes.map((n, i) => {
              const Icon = NOTE_ICONS[i % NOTE_ICONS.length];
              return (
                <li key={n} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-brand-400" /> {n}
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
