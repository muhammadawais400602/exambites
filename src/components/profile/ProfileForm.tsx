"use client";

import { Camera, Eye, EyeOff, Globe, LoaderCircle, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/portal/Avatar";

type Fields = {
  name: string;
  phone: string;
  city: string;
  bio: string;
  skills: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  website: string;
};

const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
const label = "text-xs font-semibold text-ink-soft";
const card = "rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6";
const primary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60";

/** Shrinks a picked photo to a 256px square WebP in the browser, so uploads stay tiny. */
async function squareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) throw new Error("Couldn't read that picture.");
  return blob;
}

export function ProfileForm({ initial, image, email, showPhone }: { initial: Fields; image: string | null; email: string; showPhone: boolean }) {
  const router = useRouter();
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(initial);
  const [pic, setPic] = useState(image);
  const [picBusy, setPicBusy] = useState(false);
  const [state, setState] = useState<{ busy?: boolean; error?: string; saved?: boolean }>({});
  const set = (patch: Partial<Fields>) => {
    setV((x) => ({ ...x, ...patch }));
    setState({});
  };

  async function upload(file: File) {
    setPicBusy(true);
    setState({});
    try {
      const blob = await squareWebp(file);
      const res = await fetch("/api/profile/avatar", { method: "PUT", headers: { "Content-Type": "image/webp" }, body: blob });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; image?: string };
      if (!data.ok) throw new Error(data.error ?? "Upload failed.");
      setPic(data.image ?? null);
      router.refresh();
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setPicBusy(false);
    }
  }

  async function removePic() {
    setPicBusy(true);
    await fetch("/api/profile/avatar", { method: "DELETE" }).catch(() => null);
    setPic(null);
    setPicBusy(false);
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const body = showPhone ? v : { ...v, phone: undefined };
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setState(data?.ok ? { saved: true } : { error: data?.error ?? "Connection problem. Try again." });
    if (data?.ok) router.refresh();
  }

  const input = (key: keyof Fields, text: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label htmlFor={`${id}-${key}`} className={label}>
      {text}
      <input id={`${id}-${key}`} value={v[key]} onChange={(e) => set({ [key]: e.target.value })} className={`${field} mt-1.5`} {...props} />
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      <div className="space-y-6">
        <section className={`${card} text-center`}>
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            <Globe className="mr-1 inline size-3" /> Everyone sees this
          </p>
          <div className="relative mx-auto mt-4 w-fit">
            <Avatar name={v.name || "?"} image={pic} size={112} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={picBusy} aria-label="Change picture"
              className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-surface-card hover:bg-brand-700 disabled:opacity-60">
              {picBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
          </div>
          <p className="mt-4 font-display text-xl font-black uppercase tracking-tight text-ink">{v.name || "Your name"}</p>
          {pic && (
            <button type="button" onClick={removePic} disabled={picBusy} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-red-500">
              <Trash2 className="size-3" /> Remove picture
            </button>
          )}
        </section>
        <PasswordCard />
      </div>

      <form onSubmit={save} className={`${card} grid gap-4`}>
        {input("name", "Name (public)", { required: true, maxLength: 60, autoComplete: "name" })}
        <p className="-mt-1 flex items-center gap-1.5 border-b border-ink/10 pb-4 text-[11px] text-muted">
          <Lock className="size-3" /> Everything below is private: only you and the academy admin can see it.
        </p>
        <label className={label}>
          Email (used to log in)
          <input value={email} readOnly disabled className={`${field} mt-1.5 opacity-60`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {showPhone && input("phone", "Mobile number", { inputMode: "tel", placeholder: "3001234567" })}
          {input("city", "City", { maxLength: 60, placeholder: "e.g. Lahore" })}
        </div>
        <label htmlFor={`${id}-bio`} className={label}>
          About you
          <textarea id={`${id}-bio`} rows={4} maxLength={600} value={v.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="What you do, what you want to achieve…" className={`${field} mt-1.5`} />
        </label>
        {input("skills", "Skills and interests", { maxLength: 200, placeholder: "e.g. Canva, video editing, Meta ads" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {input("linkedin", "LinkedIn", { placeholder: "linkedin.com/in/…" })}
          {input("instagram", "Instagram", { placeholder: "instagram.com/…" })}
          {input("facebook", "Facebook", { placeholder: "facebook.com/…" })}
          {input("website", "Website or portfolio", { placeholder: "fiverr.com/… or your site" })}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
          <button type="submit" disabled={state.busy} className={`${primary} ml-auto`}>
            {state.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : state.saved ? "Saved" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordCard() {
  const id = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: boolean }>({});
  return (
    <form
      className={`${card} grid gap-3`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (next.length < 8) return setState({ error: "Use at least 8 characters." });
        setState({ busy: true });
        const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
        if (error) return setState({ error: error.status === 400 || error.status === 401 ? "Current password is wrong." : error.message ?? "Couldn't change the password." });
        setCurrent("");
        setNext("");
        setState({ done: true });
      }}
    >
      <h2 className="font-display text-base font-black uppercase tracking-tight text-ink">Change password</h2>
      <label htmlFor={`${id}-c`} className={label}>
        Current password
        <input id={`${id}-c`} type={show ? "text" : "password"} autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); setState({}); }} className={`${field} mt-1.5`} required />
      </label>
      <label htmlFor={`${id}-n`} className={label}>
        New password (8+ characters)
        <div className="relative mt-1.5">
          <input id={`${id}-n`} type={show ? "text" : "password"} autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); setState({}); }} className={`${field} pr-11`} required />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted hover:text-ink">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
      {state.done && <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">Password changed. Other devices were signed out.</p>}
      <button type="submit" disabled={state.busy} className={primary}>
        {state.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : "Update password"}
      </button>
    </form>
  );
}
