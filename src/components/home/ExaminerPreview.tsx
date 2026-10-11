"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const QUESTIONS = [
  {
    subject: "Biology · MDCAT",
    text: "Which part of the cell is the site of the Krebs cycle?",
    options: ["Cytoplasm", "Mitochondrial matrix", "Inner mitochondrial membrane", "Ribosome"],
    answer: 1,
    why: "Krebs cycle enzymes are dissolved in the matrix; the inner membrane hosts the electron transport chain.",
  },
  {
    subject: "Physics · NET",
    text: "A body moves in a circle at constant speed. Its acceleration is…",
    options: ["Zero", "Tangential", "Centripetal", "Variable in magnitude"],
    answer: 2,
    why: "Speed is constant but direction changes, so acceleration points to the centre: a = v²/r.",
  },
  {
    subject: "Chemistry · ECAT",
    text: "The hybridisation of carbon in ethyne (C₂H₂) is…",
    options: ["sp", "sp²", "sp³", "dsp²"],
    answer: 0,
    why: "Each carbon forms one σ and two π bonds in the triple bond, leaving two sp hybrid orbitals.",
  },
];

const TYPE_MS = 28;
const REVEAL_AFTER_MS = 1400;
const NEXT_AFTER_MS = 2600;

/** Animated mock of the Synthetic Examiner, used as the trailer poster/preview. */
export function ExaminerPreview({ playing }: { playing: boolean }) {
  const [q, setQ] = useState(0);
  const [typed, setTyped] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState(0);
  const question = QUESTIONS[q];
  const typingDone = typed >= question.text.length;

  // Typewriter → reveal answer → next question.
  useEffect(() => {
    if (!playing) return;
    if (!typingDone) {
      const id = setTimeout(() => setTyped((t) => t + 1), TYPE_MS);
      return () => clearTimeout(id);
    }
    if (!revealed) {
      const id = setTimeout(() => {
        setRevealed(true);
        setSolved((s) => s + 1);
      }, REVEAL_AFTER_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setQ((i) => (i + 1) % QUESTIONS.length);
      setTyped(0);
      setRevealed(false);
    }, NEXT_AFTER_MS);
    return () => clearTimeout(id);
  }, [playing, typed, typingDone, revealed]);

  const shown = playing ? question.text.slice(0, typed) : question.text;
  const accuracy = Math.min(99, 72 + solved * 3);

  return (
    <div className="absolute inset-0 overflow-hidden text-left bg-[radial-gradient(120%_90%_at_20%_0%,#3a2a12_0%,#17120c_45%,#0b0907_100%)]">
      {/* Grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"
      />
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative grid h-full grid-cols-1 gap-4 p-5 pt-16 sm:p-8 sm:pt-20 md:grid-cols-[1.6fr_1fr] md:items-start md:gap-6">
        {/* Question card */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-brand-200 sm:text-[11px]">
              <Sparkles className="size-3" /> Generated · {question.subject}
            </span>
            <span className="font-mono text-[10px] text-white/40 sm:text-xs">Q{solved + (revealed ? 0 : 1)}</span>
          </div>

          <p className="mt-3 min-h-[3.2em] font-sans text-sm font-semibold leading-snug text-white sm:mt-4 sm:text-lg">
            {shown}
            {playing && !typingDone && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-brand-400" />
            )}
          </p>

          <ul className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {question.options.map((opt, i) => {
                const correct = revealed && i === question.answer;
                return (
                  <motion.li
                    key={`${q}-${opt}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: !playing || typingDone ? 1 : 0.25, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: typingDone ? i * 0.08 : 0 }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors duration-300 sm:text-sm ${
                      correct
                        ? "border-brand-400 bg-brand-500/20 text-brand-100"
                        : "border-white/10 bg-white/[0.03] text-white/70"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-md font-mono text-[10px] ${
                        correct ? "bg-brand-400 text-night" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {correct ? <Check className="size-3" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="truncate">{opt}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <AnimatePresence>
            {revealed && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 hidden rounded-xl border border-brand-500/20 bg-brand-500/[0.07] p-3 text-xs leading-relaxed text-white/75 sm:block sm:text-sm"
              >
                <span className="font-bold text-brand-200">Why: </span>
                {question.why}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Stats column (hidden on small screens to keep the frame clean) */}
        <div className="hidden min-h-0 flex-col gap-4 md:flex">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="font-label text-[11px] font-bold uppercase tracking-wider text-white/50">Accuracy</p>
            <div className="mt-2 flex items-end gap-2">
              <motion.span
                key={accuracy}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-4xl font-black text-white"
              >
                {accuracy}%
              </motion.span>
              <span className="pb-1.5 text-xs font-semibold text-brand-400">▲ live</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                animate={{ width: `${accuracy}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="font-label text-[11px] font-bold uppercase tracking-wider text-white/50">Weak spots</p>
            <ul className="mt-3 space-y-2.5 text-sm text-white/75">
              {[
                ["Organic mechanisms", 38],
                ["Rotational motion", 54],
                ["Genetics ratios", 71],
              ].map(([label, pct]) => (
                <li key={label}>
                  <div className="flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-mono text-white/50">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-500/70" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
