"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { loginPage } from "@/content/login";
import { HOME, LOGIN, ROLE_LABEL, type Role } from "@/lib/roles";

type Mode = "login" | "reset";

/**
 * Sign-in card for one role. Logging in with an account of a different role
 * signs straight back out and points to the right login page.
 */
export function LoginForm({ role }: { role: Role }) {
  const id = useId();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ field?: "email" | "password"; text: string; href?: string } | null>(null);
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
      if (mode === "reset") {
        await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/reset-password" });
        // Same answer whether or not the email exists, so accounts can't be probed.
        setNotice("If that email has an account, a reset link is on its way. Check your inbox and spam.");
        return;
      }
      const { data, error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: remember,
      });
      if (signInError) {
        const text =
          signInError.status === 429
            ? "Too many attempts. Wait a minute and try again."
            : signInError.status === 403
              ? signInError.message ?? "This account is deactivated."
              : "Wrong email or password.";
        setError({ text });
        return;
      }
      const actual = ((data?.user as { role?: Role } | undefined)?.role ?? "student") as Role;
      if (actual !== role) {
        await authClient.signOut();
        setError({
          text: `This is the ${ROLE_LABEL[role].toLowerCase()} login. Your account is a ${ROLE_LABEL[actual].toLowerCase()} account.`,
          href: LOGIN[actual],
        });
        return;
      }
      router.push(HOME[role]);
      router.refresh();
    } catch {
      setError({ text: "Connection problem. Check your internet and try again." });
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">{ROLE_LABEL[role]}</span>
          <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-ink">
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
            <input id={`${id}-email`} type="email" autoComplete="email" placeholder="name@example.com" value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error?.field === "email") setError(null);
              }}
              aria-invalid={error?.field === "email"}
              aria-describedby={error ? `${id}-err` : undefined}
              className={`${input} ${error?.field === "email" ? "border-red-500/70" : "border-ink/15"}`} />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mode === "login" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="flex items-center justify-between">
                <label htmlFor={`${id}-password`} className={label}>
                  Password
                </label>
                <button type="button" onClick={() => switchMode("reset")} className="text-xs font-semibold text-brand-700 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input id={`${id}-password`} type={show ? "text" : "password"} autoComplete="current-password" placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error?.field === "password") setError(null);
                  }}
                  aria-invalid={error?.field === "password"}
                  aria-describedby={error ? `${id}-err` : undefined}
                  className={`${input} pr-12 ${error?.field === "password" ? "border-red-500/70" : "border-ink/15"}`} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:text-ink">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 rounded accent-[var(--color-brand-600)]" />
                Keep me signed in
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p id={`${id}-err`} role="alert" className="text-sm font-medium text-red-500">
            {error.text}{" "}
            {error.href && (
              <Link href={error.href} className="font-semibold underline">
                Go to that login
              </Link>
            )}
          </p>
        )}

        {notice && (
          <p role="status" className="rounded-xl border border-brand-600/30 bg-brand-500/10 px-4 py-3 text-sm text-ink">
            {notice}
          </p>
        )}

        <motion.button type="submit" disabled={sending} aria-busy={sending} whileTap={{ scale: 0.98 }}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)] disabled:cursor-wait disabled:opacity-80">
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
          <button type="button" onClick={() => switchMode("login")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand-700">
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
