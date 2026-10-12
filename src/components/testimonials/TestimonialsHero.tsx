"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { posts } from "@/content/community";
import { reviews, testimonialsPage, videoStories } from "@/content/testimonials";

const JUMPS = [
  { id: "wall", label: "All", count: videoStories.length + posts.length + reviews.length },
  { id: "videos", label: "Video stories", count: videoStories.length },
  { id: "posts", label: "Community posts", count: posts.length },
  { id: "reviews", label: "Written reviews", count: reviews.length },
];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Page intro: headline, stats row and jump chips that track the section in view. */
export function TestimonialsHero() {
  const [active, setActive] = useState("wall");
  const { title, stats } = testimonialsPage;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const j of JUMPS) {
      const el = document.getElementById(j.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <section id="wall" className="relative overflow-hidden bg-surface-card px-4 pt-32 pb-16 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-200)_55%,transparent),transparent_75%)] dark:opacity-20"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.span
          {...rise(0)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-100 px-4 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.18em] text-brand-900"
        >
          <span className="size-1.5 rounded-full bg-brand-600" />
          {testimonialsPage.eyebrow}
        </motion.span>

        <motion.h1
          {...rise(0.08)}
          className="mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] text-ink"
        >
          {title.lead}
          <br />
          <span className="text-brand-gradient">{title.highlight}</span>
        </motion.h1>

        <motion.p {...rise(0.16)} className="mt-6 max-w-2xl text-base text-ink-soft md:text-lg">
          {testimonialsPage.body}
        </motion.p>

        {/* Stats */}
        <div className="mt-12 grid w-full grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-ink/10 bg-surface p-4 text-left sm:p-5"
            >
              <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{s.label}</p>
              <p className={`mt-2 font-display text-2xl font-black sm:text-3xl ${i === 3 ? "text-brand-600" : "text-ink"}`}>
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-soft">{s.note}</p>
            </motion.div>
          ))}
        </div>

        {/* Jump chips */}
        <nav aria-label="Jump to" className="mt-10 flex flex-wrap justify-center gap-2">
          {JUMPS.map((j) => {
            const on = active === j.id;
            return (
              <a
                key={j.id}
                href={`#${j.id}`}
                aria-current={on ? "true" : undefined}
                className={`rounded-full border px-4 py-2 font-label text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  on
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-600/25 bg-surface-card text-brand-900 hover:border-brand-600/60 dark:text-brand-200"
                }`}
              >
                {j.label} <span className={on ? "text-white/70" : "text-muted"}>· {j.count}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
