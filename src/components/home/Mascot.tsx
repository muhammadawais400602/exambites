"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Brain, Clapperboard, Film, Globe, Handshake, Megaphone, Palette, Search, Sparkles, Target } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// Bubble messages: one opener, then what each course teaches.
const SKILLS = [
  { Icon: Sparkles, track: "Exambites", label: "AI Skills That Pay" },
  { Icon: Brain, track: "AI Basics", label: "Prompts & Tools" },
  { Icon: Palette, track: "Content", label: "Canva Designs" },
  { Icon: Clapperboard, track: "Content", label: "CapCut Reels" },
  { Icon: Megaphone, track: "Marketing", label: "Social Media" },
  { Icon: Search, track: "Marketing", label: "SEO" },
  { Icon: Target, track: "Marketing", label: "Paid Ads" },
  { Icon: Globe, track: "Web", label: "Websites" },
  { Icon: Handshake, track: "Selling", label: "Client Pitching" },
  { Icon: Film, track: "Bonus", label: "AI Filmmaking" },
];

const CYCLE_MS = 2400;
const SPRING = { stiffness: 150, damping: 18, mass: 0.6 };

/**
 * Robot mascot whose head and eyes follow the cursor anywhere on the page.
 * Blinks on its own, smiles on hover, hops on click. On touch screens it
 * looks around by itself. A speech bubble cycles through the skills taught.
 */
export function Mascot() {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [skill, setSkill] = useState(0);
  const [blink, setBlink] = useState(false);
  const [happy, setHappy] = useState(false);
  const [hops, setHops] = useState(0);

  // Look direction, -1…1 on each axis, smoothed.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const lookX = useSpring(rawX, SPRING);
  const lookY = useSpring(rawY, SPRING);

  // Layers move by different amounts so the head reads as turning in 3D.
  const headRotate = useTransform(lookX, [-1, 1], [-12, 12]);
  const headX = useTransform(lookX, [-1, 1], [-6, 6]);
  const headY = useTransform(lookY, [-1, 1], [-4, 5]);
  const faceX = useTransform(lookX, [-1, 1], [-11, 11]);
  const faceY = useTransform(lookY, [-1, 1], [-7, 8]);
  const eyesX = useTransform(lookX, [-1, 1], [-15, 15]);
  const eyesY = useTransform(lookY, [-1, 1], [-9, 8]);
  const earLX = useTransform(lookX, [-1, 1], [6, -3]);
  const earRX = useTransform(lookX, [-1, 1], [3, -6]);
  const antennaRotate = useTransform(lookX, [-1, 1], [10, -10]);
  const bodyX = useTransform(lookX, [-1, 1], [-2, 2]);

  // Follow the mouse anywhere on the page; drift back to centre when it leaves.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.4;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      rawX.set(clamp((e.clientX - cx) / (window.innerWidth * 0.4)));
      rawY.set(clamp((e.clientY - cy) / (window.innerHeight * 0.4)));
    }
    function onLeave() {
      rawX.set(0);
      rawY.set(0);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY]);

  // Touch screens have no cursor: look around on a slow loop instead.
  useEffect(() => {
    if (reduce || window.matchMedia("(hover: hover)").matches) return;
    const opts = { duration: 7, repeat: Infinity, ease: "easeInOut" } as const;
    const a = animate(rawX, [0, 0.8, 0.8, -0.7, -0.7, 0], opts);
    const b = animate(rawY, [0, -0.3, 0.4, 0.4, -0.2, 0], opts);
    return () => {
      a.stop();
      b.stop();
    };
  }, [reduce, rawX, rawY]);

  // Blink every few seconds, at a slightly random rhythm.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2200 + Math.random() * 2800);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // Cycle the speech bubble.
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setSkill((i) => (i + 1) % SKILLS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce]);

  const { Icon, track, label } = SKILLS[skill];
  const g = (name: string) => `${id}-${name}`;

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Speech bubble */}
      <div className="absolute -top-6 left-[calc(50%+2rem)] z-10 md:-top-2 md:left-[calc(50%+5.75rem)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="relative flex items-center gap-2 whitespace-nowrap rounded-2xl rounded-bl-sm border border-brand-600/25 bg-surface-card px-3 py-2 shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--color-brand-600)_45%,transparent)]"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-night text-brand-400">
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
            <span className="flex flex-col text-left leading-tight">
              <span className="font-label text-[9px] font-bold uppercase tracking-[0.18em] text-brand-700">{track}</span>
              <span className="text-xs font-bold text-ink">{label}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        aria-label="Exambites robot mascot. Click to see the next skill"
        onClick={() => {
          setHops((h) => h + 1);
          setSkill((i) => (i + 1) % SKILLS.length);
        }}
        onPointerEnter={() => setHappy(true)}
        onPointerLeave={() => setHappy(false)}
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 14, delay: 0.45 }}
        className="relative block w-36 cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-brand-200 md:w-52"
      >
        {/* Idle float + click hop */}
        <motion.div
          key={hops}
          animate={hops ? { y: [0, -28, 0, -8, 0] } : { y: [0, -8, 0] }}
          transition={
            hops
              ? { duration: 0.7, ease: "easeOut" }
              : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
          }
          onAnimationComplete={() => hops && setHops(0)}
        >
          <svg viewBox="0 0 200 230" className="w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id={g("shell")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="[stop-color:var(--color-brand-400)]" />
                <stop offset="55%" className="[stop-color:var(--color-brand-500)]" />
                <stop offset="100%" className="[stop-color:var(--color-brand-600)]" />
              </linearGradient>
              <linearGradient id={g("body")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="[stop-color:var(--color-brand-500)]" />
                <stop offset="100%" className="[stop-color:var(--color-brand-700)]" />
              </linearGradient>
              <radialGradient id={g("visor")} cx="40%" cy="30%" r="80%">
                <stop offset="0%" className="[stop-color:color-mix(in_srgb,var(--color-brand-900)_30%,var(--color-night))]" />
                <stop offset="100%" className="[stop-color:var(--color-night)]" />
              </radialGradient>
              <clipPath id={g("visorClip")}>
                <rect x="52" y="60" width="96" height="66" rx="30" />
              </clipPath>
              <filter id={g("glow")} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ground shadow */}
            <motion.ellipse
              cx="100"
              cy="222"
              rx="52"
              ry="7"
              className="fill-brand-900"
              opacity="0.18"
              style={{ x: bodyX }}
            />

            {/* Body */}
            <motion.g style={{ x: bodyX }}>
              <rect x="62" y="150" width="76" height="62" rx="26" fill={`url(#${g("body")})`} />
              <rect x="84" y="166" width="32" height="20" rx="8" className="fill-night" opacity="0.85" />
              <motion.circle
                cx="100"
                cy="176"
                r="4"
                className="fill-brand-300"
                filter={`url(#${g("glow")})`}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              {/* Arms */}
              <rect x="44" y="160" width="20" height="38" rx="10" className="fill-brand-600" />
              <rect x="136" y="160" width="20" height="38" rx="10" className="fill-brand-600" />
              {/* Neck */}
              <rect x="88" y="138" width="24" height="16" rx="6" className="fill-brand-800" />
            </motion.g>

            {/* Head, pivoting at the neck */}
            <motion.g
              style={{ x: headX, y: headY, rotate: headRotate, transformOrigin: "100px 145px" }}
            >
              {/* Ear pods */}
              <motion.g style={{ x: earLX }}>
                <rect x="20" y="70" width="26" height="46" rx="13" className="fill-brand-800" />
                <rect x="26" y="80" width="10" height="26" rx="5" className="fill-brand-400" opacity="0.7" />
              </motion.g>
              <motion.g style={{ x: earRX }}>
                <rect x="154" y="70" width="26" height="46" rx="13" className="fill-brand-800" />
                <rect x="164" y="80" width="10" height="26" rx="5" className="fill-brand-400" opacity="0.7" />
              </motion.g>

              {/* Antenna */}
              <motion.g style={{ rotate: antennaRotate, transformOrigin: "100px 34px" }}>
                <rect x="97" y="8" width="6" height="28" rx="3" className="fill-brand-800" />
                <motion.circle
                  cx="100"
                  cy="8"
                  r="8"
                  className="fill-brand-300"
                  filter={`url(#${g("glow")})`}
                  animate={{ scale: hops ? [1, 1.6, 1] : [1, 1.15, 1] }}
                  transition={{ duration: hops ? 0.5 : 2.4, repeat: hops ? 0 : Infinity }}
                  style={{ transformOrigin: "100px 8px" }}
                />
              </motion.g>

              {/* Skull */}
              <rect x="36" y="30" width="128" height="116" rx="50" fill={`url(#${g("shell")})`} />
              <rect x="52" y="38" width="60" height="14" rx="7" fill="#fff" opacity="0.28" />

              {/* Face plate: moves further than the skull */}
              <motion.g style={{ x: faceX, y: faceY }}>
                <rect x="52" y="60" width="96" height="66" rx="30" fill={`url(#${g("visor")})`} />
                <rect x="60" y="66" width="34" height="6" rx="3" fill="#fff" opacity="0.08" />

                {/* Eyes: move furthest, so they lead the turn; clipped to the visor */}
                <g clipPath={`url(#${g("visorClip")})`}>
                  <motion.g style={{ x: eyesX, y: eyesY }}>
                    {happy ? (
                      <g className="stroke-brand-300" strokeWidth="6" strokeLinecap="round" fill="none" filter={`url(#${g("glow")})`}>
                        <path d="M70 94 q8 -10 16 0" />
                        <path d="M114 94 q8 -10 16 0" />
                      </g>
                    ) : (
                      <motion.g
                        animate={{ scaleY: blink ? 0.1 : 1 }}
                        transition={{ duration: 0.08 }}
                        style={{ transformOrigin: "100px 92px" }}
                        className="fill-brand-300"
                        filter={`url(#${g("glow")})`}
                      >
                        <rect x="71" y="80" width="15" height="24" rx="7.5" />
                        <rect x="114" y="80" width="15" height="24" rx="7.5" />
                      </motion.g>
                    )}
                    {/* Smile */}
                    <path
                      d={happy ? "M88 110 q12 10 24 0" : "M91 111 q9 5 18 0"}
                      className="stroke-brand-400"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.9"
                    />
                  </motion.g>
                </g>

                {/* Cheeks */}
                <circle cx="62" cy="134" r="6" className="fill-brand-700" opacity="0.35" />
                <circle cx="138" cy="134" r="6" className="fill-brand-700" opacity="0.35" />
              </motion.g>
            </motion.g>
          </svg>
        </motion.div>
      </motion.button>
    </div>
  );
}
