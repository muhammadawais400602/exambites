"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { hero } from "@/content/home";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Mascot } from "./Mascot";

// Each headline word picks up the next slice of the amber ramp.
const WORD_GRADIENTS = [
  "from-brand-900 to-brand-700",
  "from-brand-700 to-brand-600",
  "from-brand-500 to-brand-400",
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Cursor glow, in pixels.
  const glowX = useSpring(useMotionValue(0), { stiffness: 90, damping: 22 });
  const glowY = useSpring(useMotionValue(0), { stiffness: 90, damping: 22 });
  const glowOpacity = useSpring(useMotionValue(0), { stiffness: 120, damping: 25 });

  // Content drifts up and fades as the hero scrolls away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    glowX.set(e.clientX - r.left);
    glowY.set(e.clientY - r.top);
    glowOpacity.set(1);
  }

  function onPointerLeave() {
    glowOpacity.set(0);
  }

  return (
    <section
      ref={ref}
      id="top"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface-card px-4 pt-16 pb-24"
    >
      {/* Ambient halo behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] dark:opacity-20 h-[560px] w-[min(1000px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-200)_55%,transparent),color-mix(in_srgb,var(--color-brand-100)_35%,transparent)_45%,transparent_75%)]"
      />
      {/* Cursor-following glow */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY, opacity: glowOpacity }}
        className="pointer-events-none absolute -left-[210px] -top-[210px] size-[420px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-500)_22%,transparent),transparent)] blur-2xl"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex w-full max-w-6xl flex-col items-center text-center"
      >
        <motion.h1
          style={{ scale: headlineScale }}
          aria-label={hero.headline.join(" ")}
          className="flex flex-wrap justify-center gap-x-[0.22em] font-display text-[clamp(3rem,10.5vw,8rem)] font-black leading-[0.9] tracking-[-0.045em]"
        >
          {hero.headline.map((word, i) => (
            <span key={word} aria-hidden className="-mx-[0.06em] inline-block overflow-hidden px-[0.06em] pb-[0.08em]">
              <motion.span
                initial={{ y: "105%", rotate: 6 }}
                animate={{ y: "0%", rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block bg-gradient-to-r bg-clip-text text-transparent ${WORD_GRADIENTS[i % WORD_GRADIENTS.length]}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <div className="mt-8 md:mt-10">
          <Mascot />
        </div>

        <motion.p
          {...fadeUp(0.7)}
          className="mt-8 max-w-2xl font-display text-lg font-extrabold tracking-tight text-ink md:text-[1.35rem]"
        >
          {hero.tagline.before}
          <a
            href="#trailer"
            className="text-brand-700 underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-brand-600"
          >
            {hero.tagline.highlight}
          </a>
          {hero.tagline.after}
        </motion.p>

        <motion.div
          {...fadeUp(0.85)}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 font-bold text-brand-900">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-600 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
            </span>
            {hero.students}
          </span>
          <span aria-hidden className="hidden text-muted sm:inline">·</span>
          <span className="font-semibold text-ink">
            {hero.price} <span className="font-normal text-muted">{hero.priceNote}</span>
          </span>
        </motion.div>

        <motion.div {...fadeUp(1)} className="mt-9">
          <MagneticButton
            href={hero.cta.href}
            className="rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-9 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--color-brand-600)_60%,transparent)] transition-shadow hover:shadow-[0_24px_50px_-10px_color-mix(in_srgb,var(--color-brand-600)_75%,transparent)]"
          >
            {hero.cta.label}
            <span aria-hidden className="h-4 w-px bg-white/60" />
            {hero.cta.price}
          </MagneticButton>
        </motion.div>

        <motion.a
          {...fadeUp(1.15)}
          href={hero.scrollCue.href}
          className="group mt-12 inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-brand-700"
        >
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-brand-600"
          >
            <ArrowDown className="size-4" strokeWidth={2.5} />
          </motion.span>
          {hero.scrollCue.label}
        </motion.a>
      </motion.div>
    </section>
  );
}
