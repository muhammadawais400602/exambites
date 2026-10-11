"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { wrap } from "motion";
import { useRef } from "react";
import { marquee } from "@/content/home";

/** Percent of one copy's width moved per second at rest. */
const BASE_SPEED = 2.4;

/**
 * Ticker ribbon. Drifts left at rest, speeds up with scroll velocity,
 * reverses when scrolling up, and slows to a stop on hover.
 */
export function Marquee() {
  const reduce = useReducedMotion();
  const offset = useMotionValue(0);
  const direction = useRef(1);
  const hover = useSpring(1, { stiffness: 120, damping: 20 });

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 400, damping: 50 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < -0.05) direction.current = -1;
    else if (b > 0.05) direction.current = 1;
    const step = direction.current * BASE_SPEED * (delta / 1000) * (1 + Math.abs(b)) * hover.get();
    offset.set(offset.get() - step);
  });

  // Two identical copies; wrapping at -50% makes the loop seamless.
  const x = useTransform(offset, (v) => `${wrap(-50, 0, v)}%`);

  return (
    <section
      aria-label="What you learn"
      onPointerEnter={() => hover.set(0.15)}
      onPointerLeave={() => hover.set(1)}
      className="relative overflow-hidden border-y border-brand-600/20 bg-brand-100/70 py-3.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent"
      />
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {marquee.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-brand-900 md:text-sm"
              >
                <span aria-hidden className="text-brand-600">
                  ✦
                </span>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </motion.div>
    </section>
  );
}
