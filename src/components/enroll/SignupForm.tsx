"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Lock, ShieldCheck, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { checkout, paymentMethods, sources } from "@/content/enroll";
import { EMPTY_SIGNUP, type SignupErrors, type SignupFields, type SignupResponse, validateSignup } from "@/lib/enroll";
import { formatRs, PRICE, REFERRAL_PRICE } from "@/lib/pricing";

type Fields = SignupFields;
type CodeState = "idle" | "checking" | "valid" | "invalid";

/**
 * Student sign-up. Creates the account on /api/enroll (locked until the admin
 * approves the payment), signs the student in and opens their portal, where
 * the payment instructions are waiting.
 */
export function SignupForm() {
  const id = useId();
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState<CodeState>("idle");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  // Honeypot, hidden from people; bots tend to fill every field.
  const [company, setCompany] = useState("");

  const amount = code === "valid" ? REFERRAL_PRICE : PRICE;

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === "referralCode") setCode("idle");
  };

  async function applyCode() {
    const value = fields.referralCode.trim();
    if (!value) return;
    setCode("checking");
    try {
      const res = await fetch("/api/referrals/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const out = (await res.json()) as { valid: boolean };
      setCode(out.valid ? "valid" : "invalid");
    } catch {
      setCode("idle");
    }
  }

  function showErrors(found: SignupErrors) {
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) document.getElementById(`${id}-${first}`)?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setServerError("");
    const found = validateSignup(fields);
    if (Object.keys(found).length) return showErrors(found);

    setSending(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, company }),
      });
      const out = (await res.json()) as SignupResponse;
      if (out.ok) {
        router.push("/portal");
        router.refresh();
        return;
      }
      setServerError(out.error);
      if (out.fields) showErrors(out.fields);
      if (out.fields?.referralCode) setCode("invalid");
    } catch {
      setServerError("Connection problem. Check your internet and try again.");
    }
    setSending(false);
  }

  const input =
    "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
  const ring = (k: keyof Fields) => (errors[k] ? "border-red-500/70" : "border-ink/15");
  const label = "font-label text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft";
  const aria = (k: keyof Fields) => ({
    id: `${id}-${k}`,
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-surface-card p-6 shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-brand-900)_35%,transparent)] sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Create your account</p>
          <p className="mt-1 font-display text-lg font-black uppercase tracking-tight text-ink">Your details</p>
        </div>
        <div className="text-right">
          <motion.p key={amount} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-2xl font-black text-ink">
            {formatRs(amount)}
          </motion.p>
          {code === "valid" ? (
            <p className="text-xs font-semibold text-brand-700">
              <span className="text-muted line-through">{formatRs(PRICE)}</span> referral applied
            </p>
          ) : (
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
              <Lock className="size-3 text-brand-600" /> One payment, all courses
            </p>
          )}
        </div>
      </div>

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5">
        <Field id={`${id}-name`} label="Full name" error={errors.name} labelClass={label}>
          <input {...aria("name")} autoComplete="name" placeholder="e.g. Danyal Tariq" value={fields.name}
            onChange={(e) => set("name", e.target.value)} className={`${input} ${ring("name")}`} />
        </Field>

        <Field id={`${id}-email`} label="Email" hint="You'll log in with this." error={errors.email} labelClass={label}>
          <input {...aria("email")} type="email" autoComplete="email" placeholder="name@example.com" value={fields.email}
            onChange={(e) => set("email", e.target.value)} className={`${input} ${ring("email")}`} />
        </Field>

        <Field id={`${id}-password`} label="Password" hint="At least 8 characters." error={errors.password} labelClass={label}>
          <div className="relative">
            <input {...aria("password")} type={showPassword ? "text" : "password"} autoComplete="new-password"
              placeholder="Create a password" value={fields.password} onChange={(e) => set("password", e.target.value)}
              className={`${input} pr-12 ${ring("password")}`} />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Field id={`${id}-phone`} label="Mobile number" hint="No leading 0." error={errors.phone} labelClass={label}>
          <div className="flex gap-2">
            <span className="grid shrink-0 place-items-center rounded-xl border border-ink/15 bg-surface px-3 text-sm font-semibold text-ink-soft">
              +92
            </span>
            <input {...aria("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="312 3456789"
              value={fields.phone} onChange={(e) => set("phone", e.target.value)} className={`${input} ${ring("phone")}`} />
          </div>
        </Field>

        <Field id={`${id}-referralCode`} label="Referral code (optional)" error={errors.referralCode} labelClass={label}
          hint={code === "valid" ? undefined : `Have a code? Pay ${formatRs(REFERRAL_PRICE)} instead of ${formatRs(PRICE)}.`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input {...aria("referralCode")} autoComplete="off" spellCheck={false} placeholder="e.g. FRIEND10"
                value={fields.referralCode}
                onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void applyCode();
                  }
                }}
                className={`${input} pl-11 uppercase ${code === "invalid" ? "border-red-500/70" : code === "valid" ? "border-brand-600" : ring("referralCode")}`} />
            </div>
            <button type="button" onClick={applyCode} disabled={!fields.referralCode.trim() || code === "checking"}
              className="shrink-0 rounded-xl border border-ink/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:border-brand-600/60 disabled:opacity-50">
              {code === "checking" ? <LoaderCircle className="size-4 animate-spin" /> : "Apply"}
            </button>
          </div>
          {code === "valid" && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
              <Check className="size-3.5" /> Code applied: you pay {formatRs(REFERRAL_PRICE)}.
            </p>
          )}
          {code === "invalid" && !errors.referralCode && (
            <p className="mt-1.5 text-xs font-medium text-red-500">That code is invalid, expired or fully used.</p>
          )}
        </Field>

        <Field id={`${id}-source`} label="Where did you hear about us?" error={errors.source} labelClass={label}>
          <select {...aria("source")} value={fields.source} onChange={(e) => set("source", e.target.value)}
            className={`${input} ${ring("source")} appearance-none`}>
            <option value="">Choose one</option>
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className={label}>Payment method</legend>
          <div id={`${id}-method`} tabIndex={-1} className="mt-2 flex flex-wrap gap-2 outline-none">
            {paymentMethods.map((m) => {
              const on = fields.method === m;
              return (
                <label key={m}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    on ? "border-brand-600 bg-brand-600 text-white" : "border-ink/15 bg-surface text-ink-soft hover:border-brand-600/50"
                  }`}>
                  <input type="radio" name={`${id}-method`} value={m} checked={on} onChange={() => set("method", m)} className="sr-only" />
                  {m}
                </label>
              );
            })}
          </div>
          {errors.method && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.method}</p>}
        </fieldset>

        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
            {serverError}
          </p>
        )}

        <motion.button type="submit" disabled={sending} aria-busy={sending} whileTap={{ scale: 0.98 }}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)] disabled:cursor-wait disabled:opacity-80">
          {sending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Creating your account…
            </>
          ) : (
            <>
              Create account · {formatRs(amount)}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </motion.button>

        <p className="flex items-start gap-2 text-xs text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
          Next you&apos;ll see how to pay. {checkout.policy}
        </p>
        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ id, label, hint, error, labelClass, children }: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelClass: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
