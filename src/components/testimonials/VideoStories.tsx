"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { BadgeCheck, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type VideoStory, videoSection, videoStories } from "@/content/testimonials";

const pad = (n: number) => String(n).padStart(2, "0");

/** Four vertical video story cards; each opens a player in a lightbox. */
export function VideoStories() {
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();

  // Freeze page scroll and listen for Escape while the lightbox is open.
  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <section id="videos" className="relative bg-surface px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{videoSection.eyebrow}</span>
            <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] text-ink">
              {videoSection.title.lead} <span className="text-brand-gradient">{videoSection.title.highlight}</span>
            </h2>
            <p className="mt-3 max-w-xl text-ink-soft">{videoSection.body}</p>
          </div>
          <span className="inline-flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-600" />
            {videoSection.hint}
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {videoStories.map((story, i) => (
            <StoryCard key={story.name} story={story} index={i} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && <Lightbox story={videoStories[open]} index={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}

function StoryCard({ story, index, onOpen }: { story: VideoStory; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const px = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const rotateY = useTransform(px, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(py, [-0.5, 0.5], [7, -7]);
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--color-brand-200) 22%, transparent), transparent 55%)`;

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <div style={{ perspective: 900 }}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onOpen}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        aria-label={`Play ${story.name}'s story`}
        className="group relative block aspect-[9/16] w-full sm:aspect-[9/14] overflow-hidden rounded-2xl bg-night text-left outline-none focus-visible:ring-4 focus-visible:ring-brand-400"
      >
        {/* Backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 30%, color-mix(in srgb, var(--color-brand-500) 45%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in srgb, var(--color-brand-900) 60%, var(--color-night)), var(--color-night) 75%)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-x-0 top-[18%] select-none text-center font-display text-[7rem] font-black leading-none text-white/[0.08] sm:text-[9rem]"
        >
          {story.initials}
        </span>
        <motion.span aria-hidden style={{ background: glare }} className="absolute inset-0" />

        {/* Top chips */}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 font-label text-[9px] sm:left-3 sm:top-3 sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          Story {pad(index + 1)}
        </span>
        <span className="absolute right-2 top-2 inline-flex sm:right-3 sm:top-3 items-center gap-1 rounded-md bg-black/60 px-2 py-1 font-label text-[10px] font-bold uppercase tracking-[0.12em] text-brand-300 backdrop-blur-sm">
          <BadgeCheck className="size-3" /> <span className="hidden sm:inline">Verified</span>
        </span>

        {/* Play */}
        <span className="absolute left-1/2 top-[36%] grid size-12 sm:top-[42%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_10px_30px_color-mix(in_srgb,var(--color-brand-600)_60%,transparent)] transition-transform duration-300 group-hover:scale-110 sm:size-16">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40 [animation-duration:2.4s]" />
          <Play className="relative ml-0.5 size-6 fill-current" />
        </span>

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10 sm:p-4 sm:pt-20">
          <p className="font-display text-base font-black text-white sm:text-lg">{story.name}</p>
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">
            {story.track} · {story.place}
          </p>
          <p className="mt-2 line-clamp-2 text-xs italic sm:line-clamp-3 leading-snug text-white/80 sm:text-[13px]">“{story.quote}”</p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-white/50">
            <span className="truncate">{story.result}</span>
            <span>{story.duration}</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function Lightbox({ story, index, onClose }: { story: VideoStory; index: number; onClose: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${story.name}'s story`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-night text-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-brand-600"
        >
          <X className="size-4" />
        </button>
        <div className="relative aspect-[9/14] w-full">
          {story.videoSrc ? (
            <video src={story.videoSrc} controls autoPlay playsInline className="absolute inset-0 size-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 flex flex-col justify-end p-6"
              style={{
                background:
                  "radial-gradient(80% 60% at 50% 30%, color-mix(in srgb, var(--color-brand-500) 45%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in srgb, var(--color-brand-900) 60%, var(--color-night)), var(--color-night) 75%)",
              }}
            >
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">
                Story {pad(index + 1)} · {story.duration}
              </span>
              <p className="mt-3 font-display text-2xl font-black leading-tight">“{story.quote}”</p>
              <p className="mt-4 text-sm font-bold">{story.name}</p>
              <p className="text-xs text-white/60">
                {story.track} · {story.place}
              </p>
              <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                Video uploading soon.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
