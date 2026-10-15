import Link from "next/link";
import { brand } from "@/content/home";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Centered, distraction-free frame for staff login, password reset and setup. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-surface px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(900px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-500)_18%,transparent),transparent_75%)]"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 block text-center font-display text-2xl font-black tracking-tight text-ink">
          {brand.short}
          <span className="text-brand-600">.</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
