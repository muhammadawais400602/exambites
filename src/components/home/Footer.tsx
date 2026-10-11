import { brand, footer } from "@/content/home";

export function Footer() {
  return (
    <footer className="bg-night px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 font-display text-base font-black text-white">
            E
          </span>
          <span className="font-label text-sm font-bold uppercase tracking-[0.14em]">{brand.name}</span>
        </a>
        <p className="order-3 text-center text-xs text-white/45 md:order-none">
          © {brand.year} {brand.name}. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 text-sm text-white/70">
          {footer.links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-brand-400">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
