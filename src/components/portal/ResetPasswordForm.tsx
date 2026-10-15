"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Sets a new password from the emailed link (teacher invites use this too). */
export function ResetPasswordForm() {
  const id = useId();
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const card = "rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8";
  const input =
    "w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

  if (!token || linkError) {
    return (
      <div className={card}>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">Link expired</h1>
        <p className="mt-2 text-sm text-ink-soft">
          This password link is invalid or has expired. Ask for a new one from the login page.
        </p>
        <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={card}>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">Password set</h1>
        <p className="mt-2 text-sm text-ink-soft">You can log in with your new password now.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/login" className="text-brand-700 hover:underline">Student login</Link>
          <Link href="/teacher/login" className="text-brand-700 hover:underline">Teacher login</Link>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className={card}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 8) return setError("Use at least 8 characters.");
        if (password !== confirm) return setError("The two passwords don't match.");
        setBusy(true);
        const { error: err } = await authClient.resetPassword({ newPassword: password, token });
        setBusy(false);
        if (err) setError("This link has expired. Ask for a new one from the login page.");
        else setDone(true);
      }}
    >
      <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">Set your password</h1>
      <p className="mt-1 text-sm text-ink-soft">At least 8 characters.</p>
      <div className="mt-6 space-y-4">
        <div className="relative">
          <label htmlFor={`${id}-p`} className="sr-only">New password</label>
          <input id={`${id}-p`} type={show ? "text" : "password"} autoComplete="new-password" placeholder="New password"
            value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} pr-12`} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div>
          <label htmlFor={`${id}-c`} className="sr-only">Repeat password</label>
          <input id={`${id}-c`} type={show ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}
        <button type="submit" disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-3.5 font-label text-sm font-bold uppercase tracking-[0.12em] text-white disabled:opacity-80">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <>Save password <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </form>
  );
}
