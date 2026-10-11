"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trailer } from "@/content/home";
import { StudioPreview } from "./StudioPreview";

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function Trailer() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [hovering, setHovering] = useState(false);
  const duration = trailer.duration;

  // Frame tilts back and grows to flat as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const frameY = useTransform(scrollYProgress, [0, 1], [80, 0]);

  // Play button follows the cursor inside the frame, rests at the centre otherwise.
  const btnX = useSpring(useMotionValue(0), { stiffness: 260, damping: 26, mass: 0.5 });
  const btnY = useSpring(useMotionValue(0), { stiffness: 260, damping: 26, mass: 0.5 });

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    btnX.set(e.clientX - (r.left + r.width / 2));
    btnY.set(e.clientY - (r.top + r.height / 2));
    setHovering(true);
  }

  function onPointerLeave() {
    btnX.set(0);
    btnY.set(0);
    setHovering(false);
  }

  function toggle() {
    const v = videoRef.current;
    if (v) {
      if (v.paused) void v.play();
      else v.pause();
      return;
    }
    setPlaying((p) => !p);
  }

  // Without a real video, advance a simulated clock while the preview runs.
  useEffect(() => {
    if (trailer.videoSrc || !playing) return;
    const id = setInterval(() => setTime((t) => (t + 1) % duration), 1000);
    return () => clearInterval(id);
  }, [playing, duration]);

  const progress = (time / duration) * 100;

  return (
    <section ref={sectionRef} id="trailer" className="relative bg-surface px-4 py-24 md:py-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-100 px-4 py-1.5 font-label text-xs font-bold uppercase tracking-[0.16em] text-brand-900"
        >
          <span className="size-1.5 rounded-full bg-brand-600" />
          {trailer.eyebrow}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-5xl text-balance font-display text-[clamp(2rem,5vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.04em] text-ink"
        >
          {trailer.title.lead}
          <br />
          {trailer.title.from}
          <span className="text-brand-gradient">{trailer.title.highlight}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 max-w-xl text-base text-ink-soft md:text-lg"
        >
          {trailer.body}
        </motion.p>

        {/* Device frame */}
        <div className="mt-14 w-full max-w-5xl" style={{ perspective: 1400 }}>
          <motion.div
            style={{ rotateX, scale, y: frameY, transformOrigin: "50% 100%" }}
            className="rounded-[28px] bg-night p-2.5 shadow-[0_50px_100px_-30px_rgba(20,18,16,0.55),0_30px_60px_-30px_rgba(217,119,6,0.35)] sm:p-3"
          >
            <div
              ref={frameRef}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              onClick={toggle}
              role="button"
              tabIndex={0}
              aria-label={playing ? "Pause trailer" : "Play trailer"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              className={`relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-white/10 outline-none focus-visible:ring-4 focus-visible:ring-brand-400 sm:aspect-video ${
                hovering ? "cursor-none" : "cursor-pointer"
              }`}
            >
              {trailer.videoSrc ? (
                <video
                  ref={videoRef}
                  src={trailer.videoSrc}
                  playsInline
                  className="absolute inset-0 size-full object-cover"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                />
              ) : (
                <StudioPreview playing={playing} />
              )}

              {/* Dim when paused */}
              <motion.div
                aria-hidden
                animate={{ opacity: playing ? 0 : 1 }}
                className="pointer-events-none absolute inset-0 bg-black/35"
              />

              {/* Top overlay */}
              <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center gap-3 sm:left-6 sm:top-6">
                <span className="rounded-md bg-black/80 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white ring-1 ring-white/10 sm:text-xs">
                  {trailer.chip}
                </span>
                <span className="hidden truncate font-mono text-xs text-white/70 sm:inline">{trailer.caption}</span>
              </div>

              {/* Cursor-following play button */}
              <motion.div
                style={{ x: btnX, y: btnY }}
                animate={{ opacity: playing && !hovering ? 0 : 1 }}
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-10 -mt-10 flex items-center gap-3 sm:-ml-12 sm:-mt-12"
              >
                <motion.span
                  animate={{ scale: hovering ? 1.08 : 1 }}
                  className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_12px_40px_rgba(217,119,6,0.6)] sm:size-24"
                >
                  {!playing && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40 [animation-duration:2s]" />
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={playing ? "pause" : "play"}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {playing ? (
                        <Pause className="size-8 fill-current" />
                      ) : (
                        <Play className="ml-1 size-8 fill-current" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.span>
                <AnimatePresence>
                  {!playing && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="hidden whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 font-mono text-xs leading-tight text-white ring-1 ring-white/15 sm:block"
                    >
                      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand-400 align-middle" />
                      Watch 3 min
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bottom bar */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-5">
                <div className="h-1 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: trailer.videoSrc ? 0.25 : 1 }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-white/75 sm:text-xs">
                  <span>
                    {fmt(time)} / {fmt(duration)}
                  </span>
                  <span className="hidden sm:inline">{trailer.meta}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <a
          href="#courses"
          className="mt-12 inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-brand-700"
        >
          {trailer.scrollCue}
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-brand-600"
          >
            <ArrowDown className="size-4" strokeWidth={2.5} />
          </motion.span>
        </a>
      </div>
    </section>
  );
}
