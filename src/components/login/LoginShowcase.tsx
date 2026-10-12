"use client";

import { motion } from "motion/react";
import { loginPage } from "@/content/login";
import { Mascot } from "@/components/home/Mascot";

/** Dark brand panel beside the login form, with the cursor-tracking mascot. */
export function LoginShowcase() {
  const { title } = loginPage;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-night p-8 text-white sm:p-10"
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-brand-700/25 blur-3xl" />

      <div className="relative">
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-400">{loginPage.eyebrow}</span>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.8rem)] font-black uppercase leading-[0.95] tracking-[-0.045em]">
          {title.lead} <span className="text-brand-gradient">{title.highlight}</span>
        </h1>
        <p className="mt-4 max-w-sm text-white/65">{loginPage.body}</p>

        <div className="my-8 hidden justify-center sm:flex">
          <Mascot />
        </div>

        <ul className="mt-8 grid gap-3 sm:mt-0 sm:grid-cols-2">
          {loginPage.perks.map((p, i) => (
            <motion.li
              key={p.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80"
            >
              <p.Icon className="size-4 shrink-0 text-brand-400" />
              {p.label}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
