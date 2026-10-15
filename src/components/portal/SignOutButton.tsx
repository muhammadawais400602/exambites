"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ to }: { to: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.push(to);
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-600/50 hover:text-ink disabled:opacity-60"
    >
      <LogOut className="size-3.5" /> <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
