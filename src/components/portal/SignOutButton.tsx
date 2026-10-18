"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton({ to }: { to: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/session/logout", { method: "POST" }).catch(() => null);
        // A full page load drops every cached copy of the session in the browser.
        window.location.assign(to);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-600/50 hover:text-ink disabled:opacity-60"
    >
      {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />} <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
