"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** One-time creation of the first admin, guarded by ADMIN_SETUP_TOKEN. */
export function AdminSetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ token: "", name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input =
    "w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
  const field = (k: keyof typeof form, label: string, type = "text", auto = "off") => (
    <label className="block">
      <span className="font-label text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">{label}</span>
      <input type={type} autoComplete={auto} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        className={`${input} mt-2`} />
    </label>
  );

  return (
    <form
      noValidate
      className="space-y-4 rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/admin/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const out = (await res.json().catch(() => ({ ok: false, error: "Something went wrong." }))) as { ok: boolean; error?: string };
        setBusy(false);
        if (!out.ok) return setError(out.error ?? "Something went wrong.");
        router.push("/admin");
        router.refresh();
      }}
    >
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">Create the admin</h1>
        <p className="mt-1 text-sm text-ink-soft">Works once. Use the setup token from the server settings.</p>
      </div>
      {field("token", "Setup token", "password")}
      {field("name", "Your name", "text", "name")}
      {field("email", "Email", "email", "email")}
      {field("password", "Password (12+ characters)", "password", "new-password")}
      {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}
      <button type="submit" disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-3.5 font-label text-sm font-bold uppercase tracking-[0.12em] text-white disabled:opacity-80">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <>Create admin <ArrowRight className="size-4" /></>}
      </button>
    </form>
  );
}
