"use client";

import { upload } from "@vercel/blob/client";
import { Award, BadgeDollarSign, CheckCircle2, Hourglass, ImagePlus, Link2, LoaderCircle, Rocket, Send, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatBytes, safeName } from "@/lib/files";

type Kind = "project" | "earning";
type File_ = { id: string; name: string; url: string; size: number; type: string };
export type CapstoneView = {
  id: string; kind: Kind; title: string; description: string; link: string; files: File_[];
  status: "submitted" | "approved" | "rejected"; feedback: string; reviewedByName: string | null;
} | null;

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

const KINDS = [
  { value: "project" as const, label: "Project", hint: "Something you built: a website, designs, videos, an ad campaign…", Icon: Rocket },
  { value: "earning" as const, label: "Proof of earning", hint: "Your first income: a payment, an order, a client's message…", Icon: BadgeDollarSign },
];

/** The student's capstone: pick project or proof of earning, add a link and/or screenshots, see the teacher's decision. */
export function CapstoneForm({ userId, capstone, uploadsReady }: { userId: string; capstone: CapstoneView; uploadsReady: boolean }) {
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(!capstone || capstone.status === "rejected");
  const [kind, setKind] = useState<Kind>(capstone?.kind ?? "project");
  const [title, setTitle] = useState(capstone?.title ?? "");
  const [description, setDescription] = useState(capstone?.description ?? "");
  const [link, setLink] = useState(capstone?.link ?? "");
  const [files, setFiles] = useState<File_[]>(capstone?.files ?? []);
  const [progress, setProgress] = useState<string | null>(null);
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});

  async function addFiles(list: FileList) {
    setState({});
    let count = files.length;
    for (const f of Array.from(list)) {
      if (count >= MAX_FILES) { setState({ error: `Add up to ${MAX_FILES} screenshots.` }); break; }
      if (!TYPES.includes(f.type)) { setState({ error: `${f.name}: use a PNG, JPG, WebP or PDF.` }); continue; }
      if (f.size > MAX_BYTES) { setState({ error: `${f.name} is over ${formatBytes(MAX_BYTES)}.` }); continue; }
      setProgress(`${f.name} 0%`);
      try {
        const blob = await upload(`capstone/${userId}/${safeName(f.name)}`, f, {
          access: "public", contentType: f.type, handleUploadUrl: "/api/portal/uploads", clientPayload: "capstone",
          onUploadProgress: ({ percentage }) => setProgress(`${f.name} ${Math.round(percentage)}%`),
        });
        count++;
        setFiles((x) => [...x, { id: crypto.randomUUID(), name: f.name, url: blob.url, size: f.size, type: f.type }]);
      } catch (err) {
        setState({ error: `${f.name}: ${err instanceof Error ? err.message : "upload failed"}` });
      }
    }
    setProgress(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const res = await fetch("/api/portal/capstone", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, title, description, link, files }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!data?.ok) return setState({ error: data?.error ?? "Connection problem. Try again." });
    setState({});
    setEditing(false);
    router.refresh();
  }

  const status = capstone?.status;
  return (
    <section className="rounded-3xl border border-ink/10 bg-surface-card p-6 sm:p-8">
      {status === "approved" && (
        <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5" role="status">
          <p className="flex items-center gap-2 font-display text-2xl font-black uppercase tracking-tight text-ink"><CheckCircle2 className="size-6 text-emerald-500" /> Capstone approved</p>
          <p className="mt-1 text-sm text-ink-soft">Congratulations — you&apos;ve completed the whole program.</p>
          {capstone!.feedback && <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{capstone!.feedback}</p>}
          {capstone!.reviewedByName && <p className="mt-2 text-xs text-muted">By {capstone!.reviewedByName}</p>}
          <Link href="/portal/certificate" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            <Award className="size-4" /> View your certificate
          </Link>
        </div>
      )}
      {status === "rejected" && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4" role="status">
          <p className="flex items-center gap-2 text-sm font-bold text-ink"><XCircle className="size-4 text-red-500" /> Not approved yet — please update and submit again</p>
          {capstone!.feedback && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{capstone!.feedback}</p>}
          {capstone!.reviewedByName && <p className="mt-2 text-xs text-muted">By {capstone!.reviewedByName}</p>}
        </div>
      )}
      {status === "submitted" && !editing && (
        <div className="mb-6 flex items-start gap-2 rounded-2xl border border-brand-600/40 bg-brand-500/10 p-4" role="status">
          <Hourglass className="mt-0.5 size-4 shrink-0 text-brand-700" />
          <p className="text-sm text-ink"><span className="font-bold">Submitted — waiting for a teacher to review it.</span> You can still edit it until then.</p>
        </div>
      )}

      {!editing && capstone ? (
        <div className="space-y-3 text-sm">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">{capstone.kind === "earning" ? "Proof of earning" : "Project"}</p>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">{capstone.title}</h2>
          {capstone.description && <p className="whitespace-pre-wrap text-ink-soft">{capstone.description}</p>}
          {capstone.link && <a href={capstone.link} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 break-all font-semibold text-brand-700 hover:underline"><Link2 className="size-4 shrink-0" /> {capstone.link}</a>}
          <Shots files={capstone.files.map((f) => ({ ...f, href: `/api/capstones/${capstone.id}/files/${f.id}` }))} />
          {status === "submitted" && <button type="button" onClick={() => setEditing(true)} className="text-xs font-bold text-brand-700 hover:underline">Edit capstone</button>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold text-ink-soft">What are you submitting?</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {KINDS.map(({ value, label, hint, Icon }) => (
                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${kind === value ? "border-brand-600 bg-brand-500/10" : "border-ink/10 hover:border-ink/25"}`}>
                  <input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="sr-only" />
                  <Icon className={`mt-0.5 size-5 shrink-0 ${kind === value ? "text-brand-600" : "text-muted"}`} />
                  <span><span className="block text-sm font-bold text-ink">{label}</span><span className="text-xs text-ink-soft">{hint}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs font-semibold text-ink-soft">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder={kind === "earning" ? "e.g. My first Fiverr order — Rs 8,000" : "e.g. Website for a local bakery"} className={`${field} mt-1.5`} />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            Tell us about it
            <textarea rows={5} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={kind === "earning" ? "Who paid you, for what, and how you found the client…" : "What you made, which tools you used, what you learned…"} className={`${field} mt-1.5`} />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            {kind === "earning" ? "Link (optional): profile, order or client's page" : "Project link"}
            <input value={link} onChange={(e) => setLink(e.target.value)} maxLength={500} placeholder="https://…" className={`${field} mt-1.5`} />
          </label>
          <p className="-mt-3 text-[11px] text-muted">Google Drive, Docs, Canva or Figma? Set sharing to <span className="font-semibold">Anyone with the link</span> so your teacher can see it.</p>
          <div>
            <p className="text-xs font-semibold text-ink-soft">Screenshots <span className="font-normal text-muted">(up to {MAX_FILES}, PNG/JPG/WebP/PDF, 10 MB each)</span></p>
            {files.length > 0 && (
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {files.map((f) => (
                  <li key={f.id} className="group relative overflow-hidden rounded-xl border border-ink/10 bg-ink/[0.03]">
                    {f.type.startsWith("image/")
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={f.url} alt={f.name} className="aspect-video w-full object-cover" />
                      : <div className="grid aspect-video place-items-center text-xs font-bold text-ink-soft">PDF</div>}
                    <p className="truncate px-2 py-1 text-[11px] text-ink-soft">{f.name}</p>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))}
                      className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-red-600"><Trash2 className="size-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
            {progress && <p className="mt-2 text-xs text-ink-soft" role="status">Uploading {progress}</p>}
            {uploadsReady ? (
              <>
                <button type="button" disabled={!!progress || files.length >= MAX_FILES} onClick={() => picker.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink disabled:opacity-50">
                  {progress ? <LoaderCircle className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />} Add screenshots
                </button>
                <input ref={picker} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
              </>
            ) : (
              <p className="mt-1 text-xs text-muted">Screenshot uploads aren&apos;t switched on yet — add a link for now.</p>
            )}
          </div>
          {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={state.busy || !!progress} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {state.busy ? <LoaderCircle className="size-4 animate-spin" /> : <><Send className="size-4" /> {capstone ? "Submit again" : "Submit capstone"}</>}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/** Screenshot thumbnails that open full size. */
export function Shots({ files }: { files: (File_ & { href: string })[] }) {
  if (!files.length) return null;
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {files.map((f) => (
        <li key={f.id}>
          <a href={f.href} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-ink/10 hover:border-brand-600/50">
            {f.type.startsWith("image/")
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={f.url} alt={f.name} className="aspect-video w-full object-cover" />
              : <div className="grid aspect-video place-items-center bg-ink/[0.03] text-xs font-bold text-ink-soft">PDF</div>}
            <p className="truncate px-2 py-1 text-[11px] text-ink-soft">{f.name}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}
