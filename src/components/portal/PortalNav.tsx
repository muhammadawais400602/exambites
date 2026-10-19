"use client";

import { BookOpen, LayoutDashboard, Trophy, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STUDENT_TABS = [
  { href: "/portal", label: "Dashboard", Icon: LayoutDashboard, match: (p: string) => p === "/portal" },
  { href: "/portal/courses", label: "Courses", Icon: BookOpen, match: (p: string) => p.startsWith("/portal/courses") || p.startsWith("/portal/lessons") },
  { href: "/portal/capstone", label: "Capstone", Icon: Trophy, match: (p: string) => p.startsWith("/portal/capstone") },
  { href: "/settings", label: "Profile", Icon: UserRound, match: (p: string) => p.startsWith("/settings") },
];

const TEACHER_TABS = [
  { href: "/teacher", label: "My courses", Icon: BookOpen, match: (p: string) => p === "/teacher" || p.startsWith("/teacher/courses") },
  { href: "/teacher/students", label: "Students", Icon: Users, match: (p: string) => p.startsWith("/teacher/students") },
  { href: "/teacher/capstones", label: "Capstones", Icon: Trophy, match: (p: string) => p.startsWith("/teacher/capstones") },
  { href: "/settings", label: "Profile", Icon: UserRound, match: (p: string) => p.startsWith("/settings") },
];

/**
 * Portal tabs (students and teachers). `inline` sits in the middle of the
 * header on wide screens; otherwise it's a row under the header.
 */
export function PortalNav({ role = "student", inline = false }: { role?: "student" | "teacher"; inline?: boolean }) {
  const path = usePathname();
  const TABS = role === "teacher" ? TEACHER_TABS : STUDENT_TABS;
  return (
    <nav aria-label="Portal" className={inline ? "h-full" : "border-t border-ink/10"}>
      <ul className={inline ? "flex h-full items-stretch gap-1" : "mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4"}>
        {TABS.map(({ href, label, Icon, match }) => {
          const on = match(path);
          return (
            <li key={href} className="flex">
              <Link href={href} aria-current={on ? "page" : undefined}
                className={`relative flex items-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition-colors ${inline ? "" : "py-3"} ${on ? "text-ink" : "text-ink-soft hover:text-ink"}`}>
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
