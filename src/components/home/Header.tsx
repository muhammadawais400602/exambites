"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, nav } from "@/content/home";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const hashOf = (href: string) => href.split("#")[1];

/**
 * Sticky glass header. Section links (/#id) light up while their section is
 * on screen; page links (/testimonials) light up on their own page.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Highlight the section link whose section is in the middle of the screen.
  useEffect(() => {
    const ids = nav.links.map((l) => hashOf(l.href)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setSection(e.target.id);
          else setSection((cur) => (cur === e.target.id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-ink/10 bg-surface/85 shadow-[0_1px_20px_-8px_color-mix(in_srgb,var(--color-brand-600)_25%,transparent)]"
          : "border-transparent bg-surface/40"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-xl font-black tracking-tight text-ink">
          {brand.short}
          <span className="text-brand-600">.</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {nav.links.map((l) => {
            const hash = hashOf(l.href);
            const on = hash ? pathname === "/" && section === hash : pathname === l.href;
            // Section links stay plain <a> so Lenis handles the smooth scroll;
            // page links use <Link> for client-side navigation.
            const Anchor = hash ? "a" : Link;
            return (
              <Anchor
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
              </Anchor>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full border border-ink/10 text-ink-soft sm:hidden"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <ThemeToggle />
          <a
            href={nav.cta.href}
            className="whitespace-nowrap rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-3.5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_-6px_color-mix(in_srgb,var(--color-brand-600)_55%,transparent)] transition-transform hover:-translate-y-px sm:px-5"
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
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink/10 bg-surface/95 sm:hidden"
          >
            <ul className="flex flex-col px-4 py-2">
              {nav.links.map((l) => {
                const Anchor = hashOf(l.href) ? "a" : Link;
                const on = !hashOf(l.href) && pathname === l.href;
                return (
                  <li key={l.href}>
                    <Anchor
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-xl px-3 py-3 text-base font-semibold ${on ? "text-brand-700" : "text-ink"}`}
                    >
                      {l.label}
                    </Anchor>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
