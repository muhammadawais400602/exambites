"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { reviews, reviewsSection } from "@/content/testimonials";

/** Grid of short written reviews with star ratings and result badges. */
export function Reviews() {
  return (
    <section id="reviews" className="relative bg-surface-card px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{reviewsSection.eyebrow}</span>
          <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] text-ink">
            {reviewsSection.title.lead} <span className="text-brand-gradient">{reviewsSection.title.highlight}</span>
          </h2>
          <p className="mt-4 text-ink-soft">{reviewsSection.body}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {reviews.map((r, i) => (
            <motion.figure
              key={`${r.name}-${r.badge}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl border border-ink/10 bg-surface p-5 transition-colors hover:border-brand-600/40 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex gap-0.5 text-brand-500" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span className="rounded-full bg-brand-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.1em] text-brand-900">
                  {r.badge}
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] italic leading-relaxed text-ink">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-sm font-black text-white">
                  {r.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{r.name}</span>
                  <span className="block text-xs text-muted">{r.place}</span>
                </span>
                <span className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">{r.track}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
