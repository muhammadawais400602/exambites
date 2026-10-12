"use client";

import { motion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight, MessageCircle, Play, Sparkles, ThumbsUp, Wallet } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { communitySection, type Post, posts } from "@/content/community";

const ADVANCE_MS = 3800;
const GAP = 28;
const MAX_CARD = 360;
const SWIPE_PX = 50;

const pad = (n: number) => String(n).padStart(2, "0");

/** Signed distance from the focused post, wrapped so the carousel loops. */
function offsetOf(i: number, index: number, n: number) {
  let d = (((i - index) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

/**
 * Carousel of community posts. One post sits in focus in the middle; the
 * rest slide right to left on a timer. Arrows, swipe and drag also move it.
 */
type CommunityProps = {
  id?: string;
  /** Heading and CTA copy; defaults to the homepage section. */
  copy?: typeof communitySection;
};

export function Community({ id = "community", copy = communitySection }: CommunityProps = {}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [cardW, setCardW] = useState(MAX_CARD);
  const n = posts.length;

  const next = useCallback(() => setIndex((i) => i + 1), []);
  const prev = useCallback(() => setIndex((i) => i - 1), []);

  // Auto-advance; restarts whenever the user moves it.
  useEffect(() => {
    const t = setTimeout(next, ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index, next]);

  // Card width follows the stage so a phone shows one card with edges peeking.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCardW(Math.min(MAX_CARD, e.contentRect.width - 48)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onPanEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) next();
    else if (info.offset.x > SWIPE_PX) prev();
  }

  const focused = ((index % n) + n) % n;

  return (
    <section id={id} className="relative bg-surface px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-label text-xs font-bold uppercase tracking-[0.22em] text-brand-700">
            {copy.eyebrow}
          </span>
          <h2 className="text-brand-gradient mt-2 font-display text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[-0.045em]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-ink-soft md:text-lg">{copy.body}</p>
        </div>

        {/* Dark panel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Community posts"
          className="relative mt-12 overflow-hidden rounded-[32px] bg-night px-4 pt-10 pb-8 shadow-[0_50px_100px_-40px_rgba(20,18,16,0.6)] md:mt-14"
        >
          <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />

          <motion.div
            ref={stageRef}
            onPanEnd={onPanEnd}
            style={{ touchAction: "pan-y" }}
            className="relative h-[540px] cursor-grab select-none active:cursor-grabbing sm:h-[520px]"
          >
            {posts.map((post, i) => (
              <Slide key={post.title} post={post} offset={offsetOf(i, index, n)} cardW={cardW} onFocus={() => setIndex(index + offsetOf(i, index, n))} />
            ))}
          </motion.div>

          {/* Controls */}
          <div className="relative mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous post"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-500 hover:text-brand-400"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span aria-live="polite" className="min-w-16 text-center font-mono text-sm text-white/60">
              <span className="font-semibold text-brand-400">{pad(focused + 1)}</span> / {pad(n)}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Next post"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-500 hover:text-brand-400"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="relative mt-5 flex justify-center">
            <a
              href={copy.cta.href}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-label text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-brand-500 hover:bg-brand-500/10"
            >
              {copy.cta.label} <ChevronRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

type SlideProps = { post: Post; offset: number; cardW: number; onFocus: () => void };

function Slide({ post, offset, cardW, onFocus }: SlideProps) {
  const dist = Math.abs(offset);
  // Cards out of view move instantly, so one wrapping from one end of the
  // loop to the other never sweeps across the stage.
  const hidden = dist >= 3;
  const active = offset === 0;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={false}
        animate={{
          x: offset * (cardW + GAP),
          scale: active ? 1 : 0.9,
          opacity: dist === 0 ? 1 : dist === 1 ? 0.55 : dist === 2 ? 0.2 : 0,
        }}
        transition={hidden ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
        style={{ width: cardW, zIndex: 10 - dist }}
        className={dist <= 1 ? "pointer-events-auto" : ""}
        aria-hidden={!active}
        onClick={active ? undefined : onFocus}
      >
        <PostCard post={post} active={active} />
      </motion.div>
    </div>
  );
}

function PostCard({ post, active }: { post: Post; active: boolean }) {
  return (
    <article
      className={`rounded-2xl border p-5 transition-colors duration-500 sm:p-6 ${
        active
          ? "border-white bg-white text-night shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
          : "cursor-pointer border-white/5 bg-night-card text-white/70"
      }`}
    >
      <header className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-sm font-black text-white">
          {post.initials}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`truncate text-sm font-bold ${active ? "text-night" : "text-white/80"}`}>{post.name}</span>
            {post.pro && (
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 font-label text-[10px] font-bold text-brand-900">Pro</span>
            )}
          </div>
          <span className={`text-xs ${active ? "text-night/50" : "text-white/40"}`}>
            {post.ago} · {post.channel}
          </span>
        </div>
      </header>

      <h3 className={`mt-4 text-[15px] font-bold leading-snug ${active ? "text-night" : "text-white/80"}`}>{post.title}</h3>
      <p className={`mt-2 line-clamp-2 text-sm leading-relaxed ${active ? "text-night/70" : "text-white/45"}`}>{post.body}</p>

      {post.media && (
        <div className={`mt-4 transition-opacity duration-500 ${active ? "" : "opacity-50"}`}>
          <Media post={post} />
        </div>
      )}

      <footer
        className={`mt-4 flex items-center gap-5 border-t pt-3 text-xs ${
          active ? "border-night/10 text-night/70" : "border-white/5 text-white/40"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="size-3.5" /> Like {post.likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" /> {post.comments} comments
        </span>
      </footer>
    </article>
  );
}

function Watermark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center font-label text-lg font-bold uppercase tracking-[0.3em] text-white/15 [transform:rotate(-18deg)]"
    >
      exambites.com
    </span>
  );
}

function Media({ post }: { post: Post }) {
  const m = post.media!;

  if (m.kind === "payout") {
    return (
      <div className="rounded-xl border border-brand-600/20 bg-gradient-to-br from-brand-50 to-brand-100 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-900">
          <span className="grid size-6 place-items-center rounded-md bg-brand-600 text-white">
            <Wallet className="size-3.5" />
          </span>
          Payment received · {m.via}
        </div>
        <p className="mt-2 font-display text-3xl font-black tracking-tight text-night">{m.amount}</p>
        <p className="mt-0.5 text-xs text-night/70">from {m.from}</p>
      </div>
    );
  }

  const scene =
    post.track === "Creator"
      ? "from-night via-brand-800 to-brand-500"
      : post.track === "Builder"
        ? "from-night via-brand-900 to-brand-400"
        : post.track === "Commerce"
          ? "from-night-card via-brand-800 to-brand-400"
          : "from-night via-brand-700 to-brand-500";

  return (
    <div className={`relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br ${scene}`}>
      <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />
      <Watermark />
      <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        {m.caption}
      </span>
      {m.kind === "video" ? (
        <>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {m.duration}
          </span>
        </>
      ) : (
        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/30 bg-white/10 text-white backdrop-blur-sm">
          <Sparkles className="size-5" />
        </span>
      )}
    </div>
  );
}
