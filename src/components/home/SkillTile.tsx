"use client";

import { AnimatePresence, motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";
import { Bot, Camera, Clapperboard, Code, Megaphone, Music, Palette, Search, ShoppingBag, Truck, Workflow } from "lucide-react";
import { useEffect, useState } from "react";

const SKILLS = [
  { Icon: Clapperboard, track: "Creator", label: "Video & Film" },
  { Icon: Palette, track: "Creator", label: "Graphics" },
  { Icon: Music, track: "Creator", label: "Music" },
  { Icon: Megaphone, track: "Marketer", label: "Social & Ads" },
  { Icon: Search, track: "Marketer", label: "SEO & Content" },
  { Icon: Code, track: "Builder", label: "Web & Apps" },
  { Icon: Bot, track: "Builder", label: "Chatbots" },
  { Icon: Workflow, track: "Builder", label: "Automation" },
  { Icon: ShoppingBag, track: "Commerce", label: "Online Stores" },
  { Icon: Camera, track: "Commerce", label: "Product Shots" },
  { Icon: Truck, track: "Commerce", label: "AI Dropshipping" },
];

const CYCLE_MS = 2200;

type Props = {
  /** Pointer position across the hero, normalised to -0.5…0.5. */
  px: MotionValue<number>;
  py: MotionValue<number>;
};

/** Dark 3D tile that tilts toward the cursor and flips through the AI skills taught. */
export function SkillTile({ px, py }: Props) {
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
    const id = setInterval(() => setIndex((i) => (i + 1) % SKILLS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const { Icon, track, label } = SKILLS[index];

  return (
    <div className="flex flex-col items-center gap-3" style={{ perspective: 800 }}>
      <motion.button
        type="button"
        aria-label={`Showing ${track}: ${label}. Next skill`}
        onClick={() => setIndex((i) => (i + 1) % SKILLS.length)}
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
          {track} <span className="text-brand-500">·</span> {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
