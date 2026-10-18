"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/roles";
import { LoginForm } from "./LoginForm";

const TABS: { role: Role; label: string }[] = [
  { role: "student", label: "Student" },
  { role: "teacher", label: "Teacher" },
];

/** One login page for students and teachers, with a tab for each. `?as=teacher` opens the teacher tab. */
export function LoginSwitch() {
  const params = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("as") === "teacher" ? "teacher" : "student");

  function pick(next: Role) {
    setRole(next);
    const url = new URL(window.location.href);
    if (next === "teacher") url.searchParams.set("as", "teacher");
    else url.searchParams.delete("as");
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div role="tablist" aria-label="Log in as" className="mx-auto mb-4 flex w-fit gap-1 rounded-full border border-ink/10 bg-surface-card p-1">
        {TABS.map((t) => (
          <button key={t.role} type="button" role="tab" aria-selected={role === t.role} onClick={() => pick(t.role)}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-colors ${role === t.role ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <LoginForm key={role} role={role} />
      </div>
    </div>
  );
}
