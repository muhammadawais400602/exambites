"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { ArrowDown, Clock } from "lucide-react";
import Image from "next/image";
import { createRef, Fragment, type RefObject, useMemo, useRef, useState } from "react";
import { type Course, courses, coursesSection } from "@/content/courses";
import { tracks, type Track } from "@/content/home";

const STICKY_TOP = 96;

// Each track gets its own glow inside the card visual.
const TRACK_GLOW: Record<Track, string> = {
  Creator: "rgba(245,158,11,0.55)",
  Marketer: "rgba(234,88,12,0.5)",
  Builder: "rgba(234,179,8,0.5)",
  Commerce: "rgba(217,119,6,0.55)",
};

const pad = (n: number) => String(n).padStart(2, "0");
const firstIndex = (t: Track) => courses.findIndex((c) => c.track === t);

/**
 * Stack of course cards. Each card pins below the header; the next one slides
 * up over it while the previous card shrinks, lifts and dims behind it.
 */
export function Courses() {
  const stackRef = useRef<HTMLDivElement>(null);
  // Zero-height markers in normal flow mark where each card starts, since the
  // sticky cards themselves report their pinned position once stuck.
  const markers = useMemo(() => courses.map(() => createRef<HTMLDivElement>()), []);
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const n = courses.length;

  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))));
  });

  function goTo(i: number) {
    const el = markers[i].current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -STICKY_TOP });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - STICKY_TOP, behavior: "smooth" });
  }

  const activeTrack = courses[active].track;

  return (
    <section id="courses" className="relative bg-surface px-4 pt-20 pb-24 md:pt-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              {coursesSection.eyebrow}
            </span>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] text-ink">
              {coursesSection.title.lead}
              <br />
              <span className="text-brand-gradient">{coursesSection.title.highlight}</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-1 md:items-end">
            <span className="font-mono text-2xl font-semibold tabular-nums text-ink-soft">
              <motion.span key={active} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block text-brand-700">
                {pad(active + 1)}
              </motion.span>{" "}
              / {pad(n)}
            </span>
            <span className="inline-flex items-center gap-1 font-label text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {coursesSection.scrollCue} <ArrowDown className="size-3 text-brand-600" strokeWidth={2.5} />
            </span>
          </div>
        </div>

        {/* Track shortcuts */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tracks.map((t) => {
            const on = t === activeTrack;
            const count = courses.filter((c) => c.track === t).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => goTo(firstIndex(t))}
                className={`rounded-full border px-4 py-2 font-label text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                  on
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-600/25 bg-white text-brand-900 hover:border-brand-600/60"
                }`}
              >
                {t} <span className={on ? "text-white/70" : "text-muted"}>· {count}</span>
              </button>
            );
          })}
        </div>

        {/* Card stack */}
        <div ref={stackRef} className="relative mt-10 pb-[8vh]">
          {courses.map((course, i) => (
            // Fragment, not a wrapper: every card must share the stack as its sticky parent.
            <Fragment key={course.title}>
              <div ref={markers[i]} aria-hidden />
              <CourseCard course={course} index={i} next={markers[i + 1]} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  course: Course;
  index: number;
  /** Marker of the following card; undefined for the last card. */
  next?: RefObject<HTMLDivElement | null>;
};

function CourseCard({ course, index, next }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { Icon } = course;
  const last = !next;

  // Shrink, lift and dim while the next card rises from the bottom of the
  // viewport to its pinned spot over this one.
  const { scrollYProgress: covered } = useScroll({
    target: next ?? ref,
    offset: ["start end", `start ${STICKY_TOP}px`],
  });
  const scale = useTransform(covered, [0, 1], [1, last ? 1 : 0.93]);
  const y = useTransform(covered, [0, 1], [0, last ? 0 : -18]);
  const dim = useTransform(covered, [0, 1], [0, last ? 0 : 0.2]);

  // Visual drifts inside its frame as the card rises into place.
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const iconY = useTransform(enter, [0, 1], [50, 0]);
  const iconRotate = useTransform(enter, [0, 1], [-12, 0]);
  const imageScale = useTransform(enter, [0, 1], [1.2, 1]);

  return (
    <motion.article
      ref={ref}
      style={{ top: STICKY_TOP, scale, y, transformOrigin: "50% 0%" }}
      className={`sticky ${last ? "mb-0" : "mb-[24vh] md:mb-[30vh]"}`}
    >
      <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_30px_60px_-30px_rgba(120,53,15,0.35)] sm:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[1.25fr_1fr] md:gap-10">
          {/* Text */}
          <div className="order-2 md:order-1">
            <span className="font-display text-2xl font-black text-brand-600">{pad(index)}</span>
            <h3 className="mt-2 font-display text-xl font-black uppercase leading-tight tracking-[-0.02em] text-ink sm:text-2xl">
              {course.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-[15px]">{course.body}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-100 px-3 py-1 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-brand-900">
                {course.track}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink-soft">
                <Clock className="size-3" /> {course.weeks} weeks
              </span>
              {course.tools.map((tool) => (
                <span key={tool} className="rounded-full border border-ink/10 bg-surface px-2.5 py-1 text-xs text-ink-soft">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-2xl bg-night md:order-2">
            {course.image ? (
              <motion.div style={{ scale: imageScale }} className="absolute inset-0">
                <Image src={course.image} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
              </motion.div>
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(90% 80% at 70% 30%, ${TRACK_GLOW[course.track]}, transparent 60%), radial-gradient(120% 100% at 0% 100%, #2a1d0e, #0e0c0a 70%)`,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:28px_28px]"
                />
                <span
                  aria-hidden
                  className="absolute -right-3 -top-8 select-none font-display text-[9rem] font-black leading-none text-white/[0.06]"
                >
                  {pad(index)}
                </span>
                <motion.div style={{ y: iconY, rotate: iconRotate }} className="absolute inset-0 grid place-items-center">
                  <span className="grid size-20 place-items-center rounded-3xl border border-brand-400/40 bg-white/[0.06] text-brand-200 shadow-[0_0_60px_rgba(245,158,11,0.45)] backdrop-blur-sm sm:size-24">
                    <Icon className="size-10 sm:size-12" strokeWidth={1.8} />
                  </span>
                </motion.div>
              </>
            )}
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-brand-200 backdrop-blur-sm">
              {course.tag}
            </span>
          </div>
        </div>

        {/* Dims the card once the next one covers it */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />
      </div>
    </motion.article>
  );
}
