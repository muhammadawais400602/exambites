"use client";

import { ArrowRight, PartyPopper, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CourseCompletion } from "@/lib/server/learning";
import { CourseCover } from "./CourseCover";

const COLORS = ["#f59e0b", "#fbbf24", "#d97706", "#fde68a", "#10b981", "#ffffff"];

/**
 * Pops up when a student finishes their whole course: congratulates them and
 * sends them on to the course that just opened.
 */
export function CourseCompleteDialog({ completion }: { completion: CourseCompletion }) {
  const ref = useRef<HTMLDialogElement>(null);
  const confetti = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const box = confetti.current;
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pieces = Array.from({ length: 42 }, (_, n) => {
      const el = document.createElement("span");
      const size = 6 + Math.random() * 6;
      Object.assign(el.style, {
        position: "absolute", left: `${50 + (Math.random() - 0.5) * 20}%`, top: "28%", width: `${size}px`, height: `${size * 0.45}px`,
        background: COLORS[n % COLORS.length], borderRadius: "2px", pointerEvents: "none",
      });
      box.appendChild(el);
      const dx = (Math.random() - 0.5) * 520, dy = -120 - Math.random() * 200;
      el.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx * 0.7}px, ${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${dx}px, ${dy + 520}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
        ],
        { duration: 1800 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      );
      return el;
    });
    return () => pieces.forEach((el) => el.remove());
  }, []);

  const close = () => ref.current?.close();
  const { course, next } = completion;
  return (
    <dialog ref={ref} aria-labelledby="course-done-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      className="m-auto w-[min(92vw,30rem)] overflow-visible rounded-3xl border border-brand-600/30 bg-surface-card p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      <div ref={confetti} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" />
      <div className="relative p-6 text-center sm:p-8">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink">
          <X className="size-4" />
        </button>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30">
          <Trophy className="size-8" />
        </span>
        <p className="mt-4 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Course complete</p>
        <h2 id="course-done-title" className="mt-1 font-display text-3xl font-black uppercase leading-none tracking-tight text-ink">Congratulations!</h2>
        <p className="mt-3 text-sm text-ink-soft">You finished <span className="font-bold text-ink">{course.title}</span>. Great work — keep the momentum going.</p>

        {next ? (
          <>
            <p className="mt-6 text-left font-label text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">Up next · now unlocked</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-ink/10 text-left">
              <CourseCover title={next.title} slug={next.slug} image={next.image} number={next.number} bonus={next.bonus} />
            </div>
            <Link href={`/portal/courses/${next.slug}`} onClick={close}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">
              Start {next.title} <ArrowRight className="size-4" />
            </Link>
            <Link href="/portal" onClick={close} className="mt-3 inline-block text-xs font-bold text-ink-soft hover:text-ink">Back to dashboard</Link>
          </>
        ) : (
          <>
            <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-ink">
              <PartyPopper className="size-4 text-emerald-500" /> You&apos;ve completed every course in the program!
            </p>
            <Link href="/portal" onClick={close}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">
              Go to dashboard <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </dialog>
  );
}

/** A course finished while the student was away (teacher approved the last assignment): show the popup once. */
export function PendingCelebration({ completion }: { completion: CourseCompletion }) {
  useEffect(() => {
    fetch("/api/portal/celebration", { method: "POST" }).catch(() => null);
  }, []);
  return <CourseCompleteDialog completion={completion} />;
}
