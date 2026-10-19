"use client";

import { BookOpen, LayoutDashboard, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal", label: "Dashboard", Icon: LayoutDashboard, match: (p: string) => p === "/portal" },
  { href: "/portal/courses", label: "Courses", Icon: BookOpen, match: (p: string) => p.startsWith("/portal/courses") || p.startsWith("/portal/lessons") },
  { href: "/settings", label: "Profile", Icon: UserRound, match: (p: string) => p.startsWith("/settings") },
];

/** Student portal tabs under the top bar. */
export function PortalNav() {
  const path = usePathname();
  return (
    <nav aria-label="Portal" className="border-b border-ink/10 bg-surface/85 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {TABS.map(({ href, label, Icon, match }) => {
          const on = match(path);
          return (
            <li key={href}>
              <Link href={href} aria-current={on ? "page" : undefined}
                className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition-colors ${on ? "text-ink" : "text-ink-soft hover:text-ink"}`}>
                <Icon className={`size-4 ${on ? "text-brand-600" : ""}`} /> {label}
                {on && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
