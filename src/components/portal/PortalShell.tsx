import { Settings } from "lucide-react";
import Link from "next/link";
import { brand } from "@/content/home";
import { HOME, LOGIN, ROLE_LABEL, type Role } from "@/lib/roles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "./Avatar";
import { PortalNav } from "./PortalNav";
import { SignOutButton } from "./SignOutButton";

/** Minimal frame shared by the student, teacher and admin portals. */
export function PortalShell({ role, user, children }: { role: Role; user: { name: string; image?: string | null }; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={HOME[role]} title="Portal home" className="font-display text-xl font-black tracking-tight text-ink">
              {brand.short}
              <span className="text-brand-600">.</span>
            </Link>
            <span className="hidden rounded-full bg-brand-100 px-2.5 py-1 min-[440px]:inline-block font-label text-[10px] font-bold uppercase tracking-[0.16em] text-brand-900 dark:bg-brand-500/15 dark:text-brand-300">
              {ROLE_LABEL[role]}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link href="/settings" title="Edit profile" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:pr-3">
              <Avatar name={user.name} image={user.image} size={30} />
              <span className="hidden max-w-40 truncate sm:block">{user.name}</span>
            </Link>
            <Link href="/settings" title="Settings" aria-label="Settings"
              className="grid size-9 place-items-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:border-brand-600/50 hover:text-ink">
              <Settings className="size-4" />
            </Link>
            <ThemeToggle />
            <SignOutButton to={LOGIN[role]} />
          </div>
        </div>
        {role === "student" && <PortalNav />}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}

/** Placeholder shown while a portal page loads the session. */
export function PortalLoading() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="h-16 border-b border-ink/10" />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-ink/10" />
        <div className="h-40 animate-pulse rounded-3xl bg-ink/[0.06]" />
        <div className="h-40 animate-pulse rounded-3xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

/** Shared heading for portal pages. */
export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-label text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-[-0.03em] text-ink md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
