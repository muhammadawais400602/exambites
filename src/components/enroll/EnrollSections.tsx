"use client";

import { motion } from "motion/react";
import { ArrowUp, BadgeCheck, Check, Gift } from "lucide-react";
import { checkout, enrollPage, helpBox, offer, syllabus } from "@/content/enroll";
import { courses } from "@/content/courses";
import { SignupForm } from "./SignupForm";

const pad = (n: number) => String(n).padStart(2, "0");

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Intro, offer card and the seat form side by side. */
export function Seat() {
  const { title } = enrollPage;
  return (
    <section id="seat" className="relative overflow-hidden bg-surface px-4 pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-[420px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-200)_50%,transparent),transparent_75%)] dark:opacity-20"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Intro */}
        <div className="flex flex-col gap-6 border-b border-ink/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.span {...rise()} className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              {enrollPage.eyebrow}
            </motion.span>
            <motion.h1
              {...rise(0.06)}
              className="mt-3 font-display text-[clamp(2.4rem,6.5vw,4.6rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] text-ink"
            >
              {title.lead}
              <br />
              <span className="text-brand-gradient">{title.highlight}</span>
            </motion.h1>
          </div>
          <motion.ul {...rise(0.12)} className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
            {enrollPage.trust.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-600/25 bg-surface-card px-3 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900 dark:text-brand-200"
              >
                <BadgeCheck className="size-3.5 text-brand-600" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          {/* Offer */}
          <div className="space-y-5">
            <motion.div {...rise()} className="rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8">
              <p className="font-label text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">{offer.label}</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="font-display text-5xl font-black tracking-tight text-ink">{offer.price}</span>
                <span className="mb-2 rounded-full bg-brand-600 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  {offer.referral}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-soft">{offer.terms}</p>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{offer.body}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {offer.features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    {...rise(0.05 * i)}
                    whileHover={{ y: -4 }}
                    className="flex gap-3 rounded-2xl border border-ink/10 bg-surface p-4"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15">
                      <f.Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{f.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{f.body}</span>
                    </span>
                  </motion.div>
                ))}
              </div>

              <figure className="mt-6 flex gap-4 rounded-2xl border-l-4 border-brand-600 bg-surface p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-sm font-black text-white">
                  {offer.quote.name.slice(0, 1)}
                </span>
                <div>
                  <blockquote className="text-sm italic leading-relaxed text-ink">“{offer.quote.text}”</blockquote>
                  <figcaption className="mt-1.5 text-xs text-muted">
                    <span className="font-bold text-ink-soft">{offer.quote.name}</span> · {offer.quote.note}
                  </figcaption>
                </div>
              </figure>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3">
              {offer.guarantees.map((g, i) => (
                <motion.div key={g.title} {...rise(0.06 * i)} className="flex gap-3 rounded-2xl border border-ink/10 bg-surface-card p-4">
                  <g.Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <span>
                    <span className="block text-xs font-bold text-ink">{g.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">{g.body}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form comes first on phones; on desktop it sits right and stays in view */}
          <motion.div {...rise(0.1)} className="order-first lg:order-none lg:sticky lg:top-24">
            <SignupForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** The six courses as cards, numbered in teaching order. */
export function Syllabus() {
  return (
    <section id="syllabus" className="relative bg-surface-card px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{syllabus.eyebrow}</span>
            <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] text-ink">
              {syllabus.title.lead} <span className="text-brand-gradient">{syllabus.title.highlight}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">{syllabus.body}</p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <motion.li
              key={c.title}
              {...rise(0.06 * (i % 3))}
              whileHover={{ y: -6 }}
              className={`flex flex-col rounded-3xl border p-6 transition-colors ${
                c.bonus
                  ? "sheen border-brand-600"
                  : "border-ink/10 bg-surface hover:border-brand-600/40"
              }`}
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-black text-brand-600">{pad(i + 1)}</span>
                  <span className="font-label text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">{c.category}</span>
                </span>
                {c.bonus ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                    <Gift className="size-3" /> Bonus
                  </span>
                ) : (
                  <span className="font-mono text-xs text-muted">{c.weeks} weeks</span>
                )}
              </div>
              <h3 className="mt-4 flex items-center gap-2 font-display text-lg font-black uppercase tracking-tight text-ink">
                <c.Icon className="size-5 shrink-0 text-brand-600" /> {c.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{c.body}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.tools.map((t) => (
                  <span key={t} className="rounded-full border border-ink/10 bg-surface-card px-2.5 py-1 text-xs text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Closing box with a jump back to the form. */
export function HelpBox() {
  return (
    <section className="bg-surface-card px-4 pb-24">
      <motion.div
        {...rise()}
        className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-surface p-8 text-center sm:p-10"
      >
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">{helpBox.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">{helpBox.body}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#seat"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-3.5 font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_-10px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)]"
          >
            {helpBox.cta} <ArrowUp className="size-3.5" />
          </a>
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted">
          <Check className="size-3.5 text-brand-600" /> {checkout.policy}
        </p>
      </motion.div>
    </section>
  );
}
