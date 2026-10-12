"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { checkout, paymentMethods, sources } from "@/content/enroll";
import { EMPTY_SIGNUP, type SignupErrors, type SignupFields, type SignupResponse, validateSignup } from "@/lib/enroll";

type Fields = SignupFields;
type Errors = SignupErrors;

/**
 * Two-step seat form. Step 1 validates locally, then posts to /api/enroll,
 * which records the sign-up in the Google Sheet and emails admissions.
 * Step 2 shows the seat reference and payment instructions.
 */
export function SignupForm() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  // Honeypot, hidden from people; bots tend to fill every field.
  const [company, setCompany] = useState("");

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function showErrors(found: Errors) {
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
        setReference(out.reference);
        setStep(2);
      } else {
        setServerError(out.error);
        if (out.fields) showErrors(out.fields);
      }
    } catch {
      setServerError("Connection problem. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  }

  const account = fields.method ? checkout.accounts[fields.method] : null;

  const input =
    "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
  const ring = (k: keyof Fields) => (errors[k] ? "border-red-500/70" : "border-ink/15");
  const label = "font-label text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-surface-card p-6 shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-brand-900)_35%,transparent)] sm:p-8">
      {/* Step header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-sm font-black text-white">
            {step}
          </span>
          <div>
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Step {step} of 2</p>
            <p className="font-display text-lg font-black uppercase tracking-tight text-ink">
              {step === 1 ? "Your details" : "Pay & confirm"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
          <Lock className="size-3.5 text-brand-600" /> Secure
        </span>
      </div>
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.form
            key="details"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            <Field id={`${id}-name`} label="Full name" error={errors.name} labelClass={label}>
              <input
                id={`${id}-name`}
                autoComplete="name"
                placeholder="e.g. Danyal Tariq"
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${id}-name-err` : undefined}
                className={`${input} ${ring("name")}`}
              />
            </Field>

            <Field id={`${id}-email`} label="Email" hint="Your course login is sent here." error={errors.email} labelClass={label}>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={fields.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${id}-email-err` : undefined}
                className={`${input} ${ring("email")}`}
              />
            </Field>

            <Field id={`${id}-phone`} label="Mobile number" hint="No leading 0. Used only for your enrollment." error={errors.phone} labelClass={label}>
              <div className="flex gap-2">
                <span className="grid shrink-0 place-items-center rounded-xl border border-ink/15 bg-surface px-3 text-sm font-semibold text-ink-soft">
                  +92
                </span>
                <input
                  id={`${id}-phone`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="312 3456789"
                  value={fields.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? `${id}-phone-err` : undefined}
                  className={`${input} ${ring("phone")}`}
                />
              </div>
            </Field>

            <Field id={`${id}-source`} label="Where did you hear about us?" error={errors.source} labelClass={label}>
              <select
                id={`${id}-source`}
                value={fields.source}
                onChange={(e) => set("source", e.target.value)}
                aria-invalid={!!errors.source}
                aria-describedby={errors.source ? `${id}-source-err` : undefined}
                className={`${input} ${ring("source")} appearance-none`}
              >
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
                    <label
                      key={m}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                        on
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-ink/15 bg-surface text-ink-soft hover:border-brand-600/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${id}-method`}
                        value={m}
                        checked={on}
                        onChange={() => set("method", m)}
                        className="sr-only"
                      />
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

            <motion.button
              type="submit"
              disabled={sending}
              aria-busy={sending}
              whileTap={{ scale: 0.98 }}
              className="group flex w-full disabled:cursor-wait disabled:opacity-80 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)]"
            >
              {sending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" /> Saving your seat…
                </>
              ) : (
                <>
                  Continue to payment · {checkout.amount}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>

            <p className="flex items-start gap-2 text-xs text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
              {checkout.guarantee}
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="pay"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface px-4 py-3">
              <span className="text-xs font-semibold text-ink-soft">Your seat reference</span>
              <span className="font-mono text-base font-semibold tracking-wider text-ink">{reference}</span>
            </div>

            <div className="rounded-2xl border border-brand-600/25 bg-brand-50 p-5 dark:bg-brand-500/10">
              <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
                Send via {fields.method}
              </p>
              <p className="mt-1 font-display text-3xl font-black text-ink">{checkout.amount}</p>
              {account?.number ? (
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Account title</dt>
                    <dd className="font-semibold text-ink">{account.title}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Account / IBAN</dt>
                    <dd className="font-mono font-semibold text-ink">{account.number}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">The {fields.method} account details are on their way to {fields.email}.</p>
              )}
            </div>

            <ol className="space-y-3 text-sm text-ink-soft">
              {[
                `Send ${checkout.amount} through ${fields.method} and write ${reference} in the payment note.`,
                "Our admissions team matches your payment to your reference.",
                `Your student portal login arrives at ${fields.email} within 24 hours.`,
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>

            <p className="flex items-start gap-2 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm text-ink-soft">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" />
              {`We've emailed these steps to ${fields.email}. Check spam if you don't see it.`}
            </p>

            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Check className="size-3.5 text-brand-600" /> Seat saved. Wrong email?{" "}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 font-semibold text-ink-soft underline-offset-2 hover:text-brand-700 hover:underline"
              >
                <ArrowLeft className="size-3" /> Sign up again
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  labelClass,
  children,
}: {
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
