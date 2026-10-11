"use client";

import { animate, motion, useInView, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { inside } from "@/content/home";
import { MagneticButton } from "@/components/ui/MagneticButton";

/** Number that counts up from zero the first time it scrolls into view. */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const a = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => a.stop();
  }, [seen, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** "1,200+ Inside": member count headline and a tilting join card. */
export function Inside() {
  const cardRef = useRef<HTMLDivElement>(null);
  const px = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotateY = useTransform(px, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(py, [-0.5, 0.5], [8, -8]);
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(254,240,138,0.16), transparent 50%)`;

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const { card } = inside;

  return (
    <section id="join" className="relative overflow-hidden bg-surface px-4 py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-brand-gradient font-display text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[-0.045em]">
          <CountUp to={inside.title.count} suffix={inside.title.suffix} /> {inside.title.word}
        </h2>
        <p className="mt-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-muted sm:text-sm">{inside.subtitle}</p>

        <div className="mt-12 w-full max-w-md" style={{ perspective: 1000 }}>
          <motion.div
            ref={cardRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-[28px] bg-night p-6 text-left shadow-[0_40px_80px_-30px_rgba(20,18,16,0.6),0_20px_50px_-30px_rgba(217,119,6,0.5)] sm:p-8"
          >
            <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0" />

            <div className="relative flex items-center justify-between">
              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">
                {inside.badge}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-semibold text-white/50">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            </div>

            <h3 className="relative mt-6 font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              {card.title}
            </h3>
            <p className="relative mt-1 text-sm text-white/55">{card.body}</p>

            <div className="relative mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-4">
              {card.stats.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center gap-1 px-2">
                  <span className={`font-display text-lg font-black sm:text-xl ${i === 0 ? "text-brand-400" : "text-white"}`}>
                    {s.value}
                  </span>
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{card.priceLabel}</p>
                <p className="mt-1 font-display text-2xl font-black text-white">{card.price}</p>
              </div>
              <MagneticButton
                href={card.cta.href}
                className="rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-3 font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_-10px_rgba(217,119,6,0.7)]"
              >
                {card.cta.label}
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
