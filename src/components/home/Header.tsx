"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, nav } from "@/content/home";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Sticky glass header with scroll-spy links, theme toggle and enroll button. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Highlight the link whose section is in the middle of the screen.
  useEffect(() => {
    const ids = nav.links.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-ink/10 bg-surface/85 shadow-[0_1px_20px_-8px_color-mix(in_srgb,var(--color-brand-600)_25%,transparent)]"
          : "border-transparent bg-surface/40"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#top" className="font-display text-xl font-black tracking-tight text-ink">
          {brand.short}
          <span className="text-brand-600">.</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {nav.links.map((l) => {
            const on = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={on ? "true" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  on ? "text-brand-700 dark:text-brand-300" : "text-ink-soft hover:text-ink"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full bg-brand-100 dark:bg-brand-500/15"
                  />
                )}
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href={nav.cta.href}
            className="rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-2 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_-6px_color-mix(in_srgb,var(--color-brand-600)_55%,transparent)] transition-transform hover:-translate-y-px sm:px-5"
          >
            {nav.cta.label}
          </a>
          <a
            href={nav.account.href}
            aria-label={nav.account.label}
            className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white"
          >
            <User className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
