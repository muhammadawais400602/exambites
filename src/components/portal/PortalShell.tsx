import { Settings } from "lucide-react";
import Link from "next/link";
import { brand } from "@/content/home";
import { HOME, LOGIN, ROLE_LABEL, type Role } from "@/lib/roles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "./Avatar";
import { PortalNav } from "./PortalNav";
import { SignOutButton } from "./SignOutButton";

const MAIN = "mx-auto max-w-6xl px-4 py-6 md:py-8";

/**
 * The portal top bar. Without `user` (while the session loads) it shows the
 * logo and tabs only, so the bar never blinks out between pages.
 */
export function PortalHeader({ role, user }: { role: Role | null; user: { name: string; image?: string | null } | null }) {
  const tabs = role === "student" || role === "teacher" ? role : null;
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface/85 backdrop-blur-xl">
      <div className={`mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-2 px-4 ${tabs ? "xl:grid-cols-[1fr_auto_1fr]" : ""}`}>
        <div className="flex min-w-0 items-center gap-3">
          <Link href={role ? HOME[role] : "/"} title="Portal home" className="truncate font-display text-base font-black tracking-tight text-ink min-[400px]:text-lg sm:text-xl">
            {brand.short}
            <span className="text-brand-600">.</span>
          </Link>
          {role && (
            <span className="hidden rounded-full bg-brand-100 px-2.5 py-1 min-[440px]:inline-block font-label text-[10px] font-bold uppercase tracking-[0.16em] text-brand-900 dark:bg-brand-500/15 dark:text-brand-300">
              {ROLE_LABEL[role]}
            </span>
          )}
        </div>
        {tabs && <div className="hidden h-full xl:block"><PortalNav role={tabs} inline /></div>}
        <div className="flex h-9 shrink-0 items-center justify-self-end gap-1.5 sm:gap-3">
          {user && role && (
            <>
              <Link href="/settings" title={`${user.name} · Edit profile`} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:pr-3 xl:pr-1">
                <Avatar name={user.name} image={user.image} size={30} />
                <span className={`hidden max-w-40 truncate sm:block ${tabs ? "xl:hidden" : ""}`}>{user.name}</span>
              </Link>
              <Link href="/settings" title="Settings" aria-label="Settings"
                className="grid size-9 place-items-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:border-brand-600/50 hover:text-ink">
                <Settings className="size-4" />
              </Link>
              <ThemeToggle />
              <SignOutButton to={LOGIN[role]} />
            </>
          )}
        </div>
      </div>
      {tabs && <div className="xl:hidden"><PortalNav role={tabs} /></div>}
    </header>
  );
}

/**
 * Page frame. Student and teacher pages (and settings) get their header from
 * the route layout (PortalFrame), which stays on screen between pages, so
 * here they only render their content. Admin pages still draw the full frame.
 */
export function PortalShell({ role, user, children }: { role: Role; user: { name: string; image?: string | null }; children: React.ReactNode }) {
  if (role !== "admin") return <>{children}</>;
  return (
    <div className="min-h-dvh bg-surface">
      <PortalHeader role={role} user={user} />
      <main className={MAIN}>{children}</main>
    </div>
  );
}

/** Layout frame for /portal, /teacher and /settings: a persistent header, and the page below it. */
export function PortalFrame({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      {header}
      <main className={MAIN}>{children}</main>
    </div>
  );
}

/** Placeholder for the page content while it loads (the header stays put). */
export function PortalLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-40 animate-pulse rounded-3xl bg-ink/[0.06]" />
      <div className="h-40 animate-pulse rounded-3xl bg-ink/[0.06]" />
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
