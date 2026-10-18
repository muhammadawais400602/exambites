"use client";

import { upload } from "@vercel/blob/client";
import { FileText, LoaderCircle, Paperclip, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT, FILE_TYPES, MAX_FILE_BYTES, MAX_FILES_PER_LESSON, fileType, formatBytes, safeName } from "@/lib/files";

type FileRow = { id: string; name: string; size: number; type: string };

/** Lesson files (PDF, Word, PowerPoint…). Uploads and removals save right away. */
export function LessonFiles({ lessonId, files, storageReady }: { lessonId: string; files: FileRow[]; storageReady: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function send(list: FileList) {
    setError("");
    for (const file of Array.from(list)) {
      const type = fileType(file.name, file.type);
      if (!type) { setError(`${file.name}: use PDF, Word, PowerPoint, Excel, text, ZIP or an image.`); continue; }
      if (file.size > MAX_FILE_BYTES) { setError(`${file.name} is over ${formatBytes(MAX_FILE_BYTES)}.`); continue; }
      setProgress({ name: file.name, pct: 0 });
      try {
        const blob = await upload(`lessons/${lessonId}/${safeName(file.name)}`, file, {
          access: "public",
          contentType: type,
          handleUploadUrl: "/api/admin/uploads",
          clientPayload: lessonId,
          multipart: file.size > 8 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress({ name: file.name, pct: Math.round(percentage) }),
        });
        const res = await fetch(`/api/admin/lessons/${lessonId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: blob.url, name: file.name, size: file.size, type }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!data.ok) throw new Error(data.error ?? "Couldn't save the file.");
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
      }
    }
    setProgress(null);
    router.refresh();
  }

  async function remove(f: FileRow) {
    if (!confirm(`Remove “${f.name}”? Students will no longer see it.`)) return;
    setBusyId(f.id);
    const res = await fetch(`/api/admin/lessons/${lessonId}/attachments?file=${encodeURIComponent(f.id)}`, { method: "DELETE" }).catch(() => null);
    setBusyId(null);
    if (!res?.ok) setError("Couldn't remove the file. Try again.");
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">Files</h2>
          <p className="text-xs text-ink-soft">PDF, Word, PowerPoint, Excel, text, ZIP or images, up to {formatBytes(MAX_FILE_BYTES)} each. Saved as soon as they upload.</p>
        </div>
        <button type="button" disabled={!storageReady || !!progress || files.length >= MAX_FILES_PER_LESSON} onClick={() => input.current?.click()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-brand-600/50 hover:text-ink disabled:opacity-50">
          {progress ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Upload files
        </button>
        <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files?.length) send(e.target.files); e.target.value = ""; }} />
      </div>

      {!storageReady && (
        <p className="rounded-2xl border border-brand-600/30 bg-brand-500/10 p-4 text-xs text-ink">
          File storage isn&apos;t connected yet. In Vercel open <strong>Storage → Create → Blob</strong>, connect it to this project, then redeploy.
        </p>
      )}

      {progress && (
        <div className="rounded-2xl border border-ink/10 bg-surface-card p-4" role="status">
          <div className="flex justify-between text-xs text-ink-soft"><span className="truncate">Uploading {progress.name}</span><span>{progress.pct}%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${progress.pct}%` }} /></div>
        </div>
      )}

      {files.length > 0 ? (
        <ul className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-surface-card">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 p-4">
              <FileText className="size-5 shrink-0 text-brand-700" />
              <div className="min-w-0 flex-1">
                <a href={`/api/files/${lessonId}/${f.id}`} target="_blank" rel="noreferrer" className="block truncate text-sm font-semibold text-ink hover:text-brand-700">{f.name}</a>
                <p className="text-xs text-muted">{FILE_TYPES[f.type] ?? "File"} · {formatBytes(f.size)}</p>
              </div>
              <button type="button" aria-label={`Remove ${f.name}`} disabled={busyId === f.id} onClick={() => remove(f)}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50">
                {busyId === f.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        storageReady && !progress && (
          <p className="flex items-center gap-2 rounded-3xl border border-dashed border-ink/15 p-5 text-sm text-ink-soft"><Paperclip className="size-4" /> No files yet.</p>
        )
      )}
      {error && <p role="alert" className="text-xs font-medium text-red-500">{error}</p>}
    </section>
  );
}
