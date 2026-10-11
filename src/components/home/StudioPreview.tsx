"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { studioJobs, tracks } from "@/content/home";

const TYPE_MS = 24;
const OUTPUT_MS = 750;
const NEXT_AFTER_MS = 2600;
const START_EARNED = 640;

/** Animated mock of an AI client job running, used as the trailer poster/preview. */
export function StudioPreview({ playing }: { playing: boolean }) {
  const [j, setJ] = useState(0);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(0); // outputs completed
  const [earned, setEarned] = useState(START_EARNED);
  const job = studioJobs[j];
  const typingDone = typed >= job.prompt.length;
  const delivered = done >= job.outputs.length;

  // Type prompt → complete outputs one by one → deliver → next job.
  useEffect(() => {
    if (!playing) return;
    if (!typingDone) {
      const id = setTimeout(() => setTyped((t) => t + 1), TYPE_MS);
      return () => clearTimeout(id);
    }
    if (!delivered) {
      const id = setTimeout(() => {
        setDone((d) => d + 1);
        if (done + 1 === job.outputs.length) setEarned((e) => e + job.payout);
      }, OUTPUT_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setJ((i) => (i + 1) % studioJobs.length);
      setTyped(0);
      setDone(0);
    }, NEXT_AFTER_MS);
    return () => clearTimeout(id);
  }, [playing, typed, typingDone, done, delivered, job]);

  const shownPrompt = playing ? job.prompt.slice(0, typed) : job.prompt;
  const shownDone = playing ? done : 0;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_20%_0%,color-mix(in_srgb,var(--color-brand-900)_45%,var(--color-night))_0%,var(--color-night-card)_45%,var(--color-night)_100%)] text-left">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"
      />
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative grid h-full grid-cols-1 gap-4 p-5 pt-16 sm:p-8 sm:pt-20 md:grid-cols-[1.6fr_1fr] md:items-start md:gap-6">
        {/* Job card */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate whitespace-nowrap rounded-full bg-brand-500/15 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-brand-200 sm:text-[11px]">
              <Sparkles className="size-3 shrink-0" /> {job.track} · {job.tool}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-white/40 sm:text-xs">Job {j + 1}/{studioJobs.length}</span>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 sm:mt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">Prompt</p>
            <p className="mt-1 min-h-[3.2em] text-sm font-medium leading-snug text-white sm:text-base">
              {shownPrompt}
              {playing && !typingDone && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-brand-400" />
              )}
            </p>
          </div>

          <ul className="mt-3 space-y-2 sm:mt-4">
            {job.outputs.map((out, i) => {
              const complete = i < shownDone;
              const running = playing && typingDone && i === done && !delivered;
              return (
                <motion.li
                  key={`${j}-${out}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: complete || running || !playing ? 1 : 0.3, x: 0 }}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors duration-300 sm:text-sm ${
                    complete ? "border-brand-500/40 bg-brand-500/10 text-brand-100" : "border-white/10 bg-white/[0.03] text-white/65"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md ${
                      complete ? "bg-brand-400 text-night" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {complete ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : running ? (
                      <LoaderCircle className="size-3 animate-spin" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-white/40" />
                    )}
                  </span>
                  <span className="truncate">{out}</span>
                </motion.li>
              );
            })}
          </ul>

          <AnimatePresence>
            {playing && delivered && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-night"
              >
                <span className="text-xs font-bold sm:text-sm">Delivered to client</span>
                <span className="font-display text-base font-black sm:text-lg">+${job.payout}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats column (hidden on small screens to keep the frame clean) */}
        <div className="hidden min-h-0 flex-col gap-4 md:flex">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="font-label text-[11px] font-bold uppercase tracking-wider text-white/50">Earned this month</p>
            <div className="mt-2 flex items-end gap-2">
              <motion.span
                key={earned}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-4xl font-black text-white"
              >
                ${earned.toLocaleString("en-US")}
              </motion.span>
              <span className="inline-flex items-center gap-1 pb-1.5 text-xs font-semibold text-brand-400">
                <TrendingUp className="size-3.5" /> live
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="font-label text-[11px] font-bold uppercase tracking-wider text-white/50">Skill tracks</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {tracks.map((t, i) => {
                const active = t === job.track;
                const pct = [82, 64, 71, 58][i];
                return (
                  <li key={t}>
                    <div className="flex justify-between text-xs">
                      <span className={active ? "font-bold text-brand-200" : "text-white/70"}>{t}</span>
                      <span className="font-mono text-white/50">{pct}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-colors ${active ? "bg-brand-400" : "bg-brand-500/50"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
