"use client";

import { AnimatePresence, motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";
import { Atom, Calculator, Dna, FlaskConical, Sigma, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

const SUBJECTS = [
  { Icon: Stethoscope, label: "MDCAT" },
  { Icon: Atom, label: "Physics" },
  { Icon: FlaskConical, label: "Chemistry" },
  { Icon: Dna, label: "Biology" },
  { Icon: Sigma, label: "Maths" },
  { Icon: Calculator, label: "NET / ECAT" },
];

const CYCLE_MS = 2200;

type Props = {
  /** Pointer position across the hero, normalised to -0.5…0.5. */
  px: MotionValue<number>;
  py: MotionValue<number>;
};

/** Dark 3D tile that tilts toward the cursor and flips through exam subjects. */
export function SubjectTile({ px, py }: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const rotateY = useTransform(px, [-0.5, 0.5], [-22, 22]);
  const rotateX = useTransform(py, [-0.5, 0.5], [18, -18]);
  const glareX = useTransform(px, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(py, [-0.5, 0.5], ["10%", "90%"]);
  const glare = useTransform(
    [glareX, glareY] as MotionValue<string>[],
    ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(254,240,138,0.28), transparent 55%)`,
  );

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SUBJECTS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const { Icon, label } = SUBJECTS[index];

  return (
    <div className="flex flex-col items-center gap-3" style={{ perspective: 800 }}>
      <motion.button
        type="button"
        aria-label={`Showing ${label}. Next subject`}
        onClick={() => setIndex((i) => (i + 1) % SUBJECTS.length)}
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.5 },
          scale: { type: "spring", stiffness: 180, damping: 14, delay: 0.5 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative grid size-24 cursor-pointer place-items-center rounded-[26px] border-4 border-brand-500 bg-night shadow-[0_24px_60px_-12px_rgba(217,119,6,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] outline-none focus-visible:ring-4 focus-visible:ring-brand-200 md:size-28"
      >
        {/* Moving glare */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[22px] opacity-60"
          style={{ background: glare }}
        />
        <span style={{ transform: "translateZ(30px)" }} className="relative grid place-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              initial={{ rotateY: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: 90, opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="grid place-items-center text-brand-400"
            >
              <Icon className="size-11 md:size-12" strokeWidth={2.2} />
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
