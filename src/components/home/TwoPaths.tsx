"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { twoPaths } from "@/content/home";

const listItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

/** Side-by-side comparison: the slow way versus the Exambites way. */
export function TwoPaths() {
  const { slow, mapped } = twoPaths;

  return (
    <section id="paths" className="relative bg-surface-card px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-brand-gradient font-display text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[-0.045em]">
            {twoPaths.title.join(" ")}
          </h2>
          <p className="mt-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-muted sm:text-sm">
            {twoPaths.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
          {/* Slow way: muted, settles slightly grey once seen */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, filter: "grayscale(0.6)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-3xl border border-ink/10 bg-surface p-7 sm:p-8"
          >
            <span className="font-label text-xs font-bold uppercase tracking-[0.18em] text-muted">{slow.label}</span>
            <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-ink/75">{slow.title}</h3>
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
              className="mt-6 flex-1 space-y-4"
            >
              {slow.points.map((p) => (
                <motion.li key={p} variants={listItem} className="flex gap-3 text-sm text-ink-soft sm:text-[15px]">
                  <span aria-hidden className="mt-1 h-4 w-1 shrink-0 rounded-full bg-ink/20" />
                  {p}
                </motion.li>
              ))}
            </motion.ul>
            <p className="mt-8 border-t border-ink/10 pt-5 font-label text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {slow.outcome}
            </p>
          </motion.div>

          {/* Mapped way: highlighted, with a moving sheen */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="sheen relative flex flex-col overflow-hidden rounded-3xl border-2 border-brand-600 p-7 shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-brand-600)_55%,transparent)] sm:p-8"
          >
            <span className="absolute right-4 top-4 rounded-full bg-brand-700 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              {mapped.badge}
            </span>
            <span className="font-label text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{mapped.label}</span>
            <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-ink">{mapped.title}</h3>
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.35 }}
              className="mt-6 flex-1 space-y-4"
            >
              {mapped.points.map((p) => (
                <motion.li key={p} variants={listItem} className="flex gap-3 text-sm font-medium text-ink sm:text-[15px]">
                  <motion.span
                    variants={{ hidden: { scale: 0 }, show: { scale: 1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </motion.span>
                  {p}
                </motion.li>
              ))}
            </motion.ul>
            <p className="mt-8 border-t border-brand-600/25 pt-5 font-label text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              {mapped.outcome}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
