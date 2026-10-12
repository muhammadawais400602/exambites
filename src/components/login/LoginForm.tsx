"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { loginPage, type Role } from "@/content/login";

type Mode = "login" | "reset";

/** Sign-in card with a Student/Admin switch and a forgot-password view. */
export function LoginForm() {
  const id = useId();
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ field?: "email" | "password"; text: string } | null>(null);
  const [notice, setNotice] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setNotice("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError({ field: "email", text: "Enter a valid email address." });
      document.getElementById(`${id}-email`)?.focus();
      return;
    }
    if (mode === "login" && !password) {
      setError({ field: "password", text: "Enter your password." });
      document.getElementById(`${id}-password`)?.focus();
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, remember, mode }),
      });
      const out = (await res.json()) as { ok: boolean; error?: string };
      if (!out.ok) setNotice(out.error ?? "Something went wrong. Please try again.");
    } catch {
      setNotice("Connection problem. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  }

  const copy = loginPage.roles[role];
  const input =
    "w-full rounded-xl border bg-surface py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
  const label = "font-label text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-surface-card p-6 shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-brand-900)_45%,transparent)] sm:p-8">
      {/* Role switch */}
      <div role="tablist" aria-label="Account type" className="relative grid grid-cols-2 rounded-full border border-ink/10 bg-surface p-1">
        {(Object.keys(loginPage.roles) as Role[]).map((r) => {
          const on = role === r;
          return (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setRole(r);
                setNotice("");
              }}
              className={`relative z-10 rounded-full py-2 font-label text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                on ? "text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="role-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
                />
              )}
              {loginPage.roles[r].label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${mode}-${role}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-7"
        >
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            {mode === "login" ? copy.heading : "Reset password"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {mode === "login" ? copy.hint : "Enter your email and we'll send you a reset link."}
          </p>
        </motion.div>
      </AnimatePresence>

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor={`${id}-email`} className={label}>
            Email
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error?.field === "email") setError(null);
              }}
              aria-invalid={error?.field === "email"}
              aria-describedby={error?.field === "email" ? `${id}-err` : undefined}
              className={`${input} ${error?.field === "email" ? "border-red-500/70" : "border-ink/15"}`}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mode === "login" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <label htmlFor={`${id}-password`} className={label}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id={`${id}-password`}
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error?.field === "password") setError(null);
                  }}
                  aria-invalid={error?.field === "password"}
                  aria-describedby={error?.field === "password" ? `${id}-err` : undefined}
                  className={`${input} pr-12 ${error?.field === "password" ? "border-red-500/70" : "border-ink/15"}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:text-ink"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded accent-[var(--color-brand-600)]"
                />
                Keep me signed in
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p id={`${id}-err`} className="text-xs font-medium text-red-500">
            {error.text}
          </p>
        )}

        {notice && (
          <p role="status" className="rounded-xl border border-brand-600/30 bg-brand-500/10 px-4 py-3 text-sm text-ink">
            {notice}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          whileTap={{ scale: 0.98 }}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)] disabled:cursor-wait disabled:opacity-80"
        >
          {sending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Please wait…
            </>
          ) : (
            <>
              {mode === "login" ? "Log in" : "Send reset link"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </motion.button>

        {mode === "reset" && (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-3.5" /> Back to login
          </button>
        )}
      </form>

      {role === "student" && (
        <p className="mt-7 border-t border-ink/10 pt-5 text-center text-sm text-ink-soft">
          {loginPage.noAccount.text}{" "}
          <Link href={loginPage.noAccount.href} className="font-semibold text-brand-700 hover:underline">
            {loginPage.noAccount.cta}
          </Link>
        </p>
      )}
    </div>
  );
}
