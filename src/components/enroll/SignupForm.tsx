"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { checkout, type PaymentMethod, paymentMethods, sources } from "@/content/enroll";

type Fields = { name: string; email: string; phone: string; source: string; method: PaymentMethod | "" };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", phone: "", source: "", method: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  // Pakistani mobile without the leading 0: 3XX XXXXXXX.
  if (!/^3\d{9}$/.test(f.phone.replace(/\D/g, ""))) e.phone = "Enter a 10-digit mobile number starting with 3.";
  if (!f.source) e.source = "Pick one option.";
  if (!f.method) e.method = "Choose how you'll pay.";
  return e;
}

/**
 * Two-step seat form: details, then payment instructions.
 * Nothing is sent to a server yet; step 2 hands off to WhatsApp once a
 * number is configured in content/enroll.ts.
 */
export function SignupForm() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<1 | 2>(1);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStep(2);
  }

  const account = fields.method ? checkout.accounts[fields.method] : null;
  const waText = encodeURIComponent(
    `Assalam o Alaikum! I'd like to enroll in Exambites Creative Academy.\nName: ${fields.name}\nEmail: ${fields.email}\nWhatsApp: +92${fields.phone.replace(/\D/g, "")}\nPayment: ${fields.method} (${checkout.amount})`,
  );
  const waHref = checkout.whatsapp ? `https://wa.me/${checkout.whatsapp}?text=${waText}` : null;

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

            <Field id={`${id}-phone`} label="WhatsApp number" hint="No leading 0. For updates and your community invite." error={errors.phone} labelClass={label}>
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

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-brand-600)_65%,transparent)]"
            >
              Continue to payment · {checkout.amount}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
                <p className="mt-2 text-sm text-ink-soft">Our admissions team will send the {fields.method} account details on WhatsApp.</p>
              )}
            </div>

            <ol className="space-y-3 text-sm text-ink-soft">
              {[
                `Send ${checkout.amount} through ${fields.method}.`,
                "Share a screenshot of the receipt with us on WhatsApp.",
                `Get your course login at ${fields.email} and your community invite on WhatsApp.`,
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>

            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-label text-sm font-bold uppercase tracking-[0.12em] text-night transition-transform hover:-translate-y-px"
              >
                <MessageCircle className="size-4" /> Send receipt on WhatsApp
              </a>
            ) : (
              <p className="flex items-center gap-2 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm text-ink-soft">
                <Check className="size-4 shrink-0 text-brand-600" /> Online confirmation is being set up. Contact our admissions team with your receipt to finish enrolling.
              </p>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="size-3.5" /> Edit details
            </button>
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
