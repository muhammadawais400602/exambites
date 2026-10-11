import { marquee } from "@/content/home";

/**
 * Ticker ribbon scrolling right to left at a constant speed. Pure CSS so it
 * runs on the compositor and stays smooth while the page scrolls. Pauses on
 * hover; static for reduced-motion users.
 */
export function Marquee() {
  return (
    <section
      aria-label="What you learn"
      className="group relative overflow-hidden border-y border-brand-600/20 bg-brand-100/70 py-3.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent"
      />
      {/* Two identical copies; translating by -50% makes the loop seamless. */}
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {marquee.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-brand-900 md:text-sm"
              >
                <span aria-hidden className="text-brand-600">
                  ✦
                </span>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
