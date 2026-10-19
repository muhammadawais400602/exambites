"use client";

import { upload } from "@vercel/blob/client";
import { CheckCircle2, ClipboardList, FileText, Link2, LoaderCircle, RotateCcw, Send, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT, fileType, formatBytes, safeName } from "@/lib/files";
import type { CourseCompletion } from "@/lib/server/learning";
import { CourseCompleteDialog } from "./CourseCompleteDialog";

type File_ = { id: string; name: string; url: string; size: number; type: string };
type Sub = { id: string; text: string; link: string; files: File_[]; status: "submitted" | "graded" | "returned"; score: number | null; feedback: string; gradedByName: string | null } | null;

const MAX_FILES = 5;
const MAX_BYTES = 50 * 1024 * 1024;
const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

/** The lesson's assignment: instructions, the student's work, and the teacher's grade. */
export function AssignmentCard({ lessonId, userId, instructions, required, submission, uploadsReady }: {
  lessonId: string; userId: string; instructions: string; required: boolean; submission: Sub; uploadsReady: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(!submission || submission.status === "returned");
  const [text, setText] = useState(submission?.text ?? "");
  const [link, setLink] = useState(submission?.link ?? "");
  const [files, setFiles] = useState<File_[]>(submission?.files ?? []);
  const [progress, setProgress] = useState<string | null>(null);
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: { next: string | null; completed: boolean; completion: CourseCompletion | null } }>({});

  async function addFiles(list: FileList) {
    setState({});
    for (const f of Array.from(list)) {
      if (files.length >= MAX_FILES) { setState({ error: `Attach up to ${MAX_FILES} files.` }); break; }
      const type = fileType(f.name, f.type);
      if (!type) { setState({ error: `${f.name}: use PDF, Word, PowerPoint, Excel, text, ZIP or an image.` }); continue; }
      if (f.size > MAX_BYTES) { setState({ error: `${f.name} is over ${formatBytes(MAX_BYTES)}.` }); continue; }
      setProgress(`${f.name} 0%`);
      try {
        const blob = await upload(`submissions/${lessonId}/${userId}/${safeName(f.name)}`, f, {
          access: "public", contentType: type, handleUploadUrl: "/api/portal/uploads", clientPayload: lessonId,
          multipart: f.size > 8 * 1024 * 1024, onUploadProgress: ({ percentage }) => setProgress(`${f.name} ${Math.round(percentage)}%`),
        });
        setFiles((x) => [...x, { id: crypto.randomUUID(), name: f.name, url: blob.url, size: f.size, type }]);
      } catch (err) {
        setState({ error: `${f.name}: ${err instanceof Error ? err.message : "upload failed"}` });
      }
    }
    setProgress(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const res = await fetch(`/api/portal/lessons/${lessonId}/assignment`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, link, files }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; nextLessonId?: string | null; courseCompleted?: boolean; completion?: CourseCompletion | null } | null;
    if (!data?.ok) return setState({ error: data?.error ?? "Connection problem. Try again." });
    setEditing(false);
    setState({ done: { next: data.nextLessonId ?? null, completed: !!data.courseCompleted, completion: data.completion ?? null } });
    router.refresh();
  }

  const status = submission?.status;
  return (
    <section className="rounded-3xl border border-ink/10 bg-surface-card p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-700"><ClipboardList className="size-4" /></span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">Assignment</h2>
          <p className="text-xs text-muted">{required ? "Submit it to unlock the next lesson. " : ""}Your teacher grades it out of 100.</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{instructions}</p>

      {status === "graded" && (
        <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4" role="status">
          <p className="flex items-center gap-2 font-display text-2xl font-black text-ink"><CheckCircle2 className="size-6 text-emerald-500" /> {submission!.score}/100</p>
          {submission!.feedback && <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{submission!.feedback}</p>}
          {submission!.gradedByName && <p className="mt-2 text-xs text-muted">Graded by {submission!.gradedByName}</p>}
        </div>
      )}
      {status === "returned" && (
        <div className="mt-5 rounded-2xl border border-brand-600/40 bg-brand-500/10 p-4" role="status">
          <p className="flex items-center gap-2 text-sm font-bold text-ink"><RotateCcw className="size-4 text-brand-700" /> Your teacher asked you to redo this</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{submission!.feedback}</p>
        </div>
      )}

      {!editing && submission && (
        <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <p className="font-semibold text-ink">{status === "submitted" ? "Submitted · waiting for your teacher" : "Your work"}</p>
          {submission.text && <p className="whitespace-pre-wrap text-ink-soft">{submission.text}</p>}
          {submission.link && <a href={submission.link} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 break-all text-brand-700 hover:underline"><Link2 className="size-3.5 shrink-0" /> {submission.link}</a>}
          {submission.files.map((f) => (
            <a key={f.id} href={`/api/submissions/${submission.id}/files/${f.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-ink hover:text-brand-700">
              <FileText className="size-3.5 text-brand-700" /> {f.name} <span className="text-xs text-muted">· {formatBytes(f.size)}</span>
            </a>
          ))}
          {status === "submitted" && (
            <button type="button" onClick={() => setEditing(true)} className="mt-2 text-xs font-bold text-brand-700 hover:underline">Edit submission</button>
          )}
        </div>
      )}

      {state.done?.completion && <CourseCompleteDialog completion={state.done.completion} />}
      {state.done && (
        <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          Submitted! {state.done.completed ? <Link href="/portal" className="font-bold underline">Your next course is open →</Link> : state.done.next ? <Link href={`/portal/lessons/${state.done.next}`} className="font-bold underline">Next lesson →</Link> : null}
        </p>
      )}

      {editing && (
        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-ink/10 pt-4">
          <textarea aria-label="Your answer" rows={4} maxLength={5000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your answer or describe your work…" className={field} />
          <input aria-label="Link to your work" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (Canva, Google Drive, YouTube, website…)" className={field} />
          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm">
                  <FileText className="size-4 text-brand-700" /><span className="min-w-0 flex-1 truncate">{f.name}</span><span className="text-xs text-muted">{formatBytes(f.size)}</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))} className="text-muted hover:text-red-500"><Trash2 className="size-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
          {progress && <p className="text-xs text-ink-soft" role="status">Uploading {progress}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {uploadsReady && (
              <>
                <button type="button" disabled={!!progress || files.length >= MAX_FILES} onClick={() => input.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink disabled:opacity-50">
                  {progress ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Attach files
                </button>
                <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
              </>
            )}
            <button type="submit" disabled={state.busy || !!progress} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60">
              {state.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <><Send className="size-3.5" /> {submission ? "Submit again" : "Submit"}</>}
            </button>
          </div>
        </form>
      )}
      {state.error && <p role="alert" className="mt-3 text-xs font-medium text-red-500">{state.error}</p>}
    </section>
  );
}
