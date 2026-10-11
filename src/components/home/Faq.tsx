"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { faq } from "@/content/home";

/** Accordion of common questions; one answer open at a time. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <section id="faq" className="relative bg-surface-card px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-brand-gradient text-center font-display text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[-0.045em]">
          FAQ
        </h2>

        <ul className="mt-12 border-t border-ink/10">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const panel = `${id}-${i}`;
            return (
              <motion.li
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.04 }}
                className="border-b border-ink/10"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span
                    className={`font-label text-sm font-bold uppercase tracking-[0.06em] transition-colors sm:text-[15px] ${
                      isOpen ? "text-brand-700" : "text-ink group-hover:text-brand-700"
                    }`}
                  >
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${
                      isOpen ? "bg-brand-600 text-white" : "text-brand-600 group-hover:bg-brand-100"
                    }`}
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panel}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 pr-12 text-sm leading-relaxed text-ink-soft sm:text-base">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
