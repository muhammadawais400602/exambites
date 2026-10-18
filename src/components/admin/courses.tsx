"use client";

import { ArrowDown, ArrowUp, LoaderCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { field } from "./actions";

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors disabled:cursor-wait disabled:opacity-60";
const primary = `${btn} bg-brand-600 text-white hover:bg-brand-700`;
const ghost = `${btn} border border-ink/15 text-ink-soft hover:border-brand-600/50 hover:text-ink`;
const danger = `${btn} border border-red-500/30 text-red-500 hover:bg-red-500/10`;
const label = "text-xs font-semibold text-ink-soft";

async function send(url: string, method: string, body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; id?: string };
    return res.ok && data.ok ? { ok: true as const, data } : { ok: false as const, error: data.error ?? "Something went wrong." };
  } catch {
    return { ok: false as const, error: "Connection problem. Try again." };
  }
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--color-brand-600)]" />
      {children}
    </label>
  );
}

export function AddCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const r = await send("/api/admin/courses", "POST", { title, category });
        setBusy(false);
        if (!r.ok) return setError(r.error);
        router.push(`/admin/courses/${r.data.id}`);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:[&>input]:flex-1"
    >
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New course title" className={field} />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Label, e.g. Marketing" className={field} />
      <button type="submit" disabled={busy} className={`${primary} shrink-0 py-3`}>
        {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <><Plus className="size-3.5" /> Add course</>}
      </button>
      {error && <p role="alert" className="text-xs font-medium text-red-500 sm:basis-full">{error}</p>}
    </form>
  );
}

type CourseFields = { id: string; title: string; category: string; description: string; published: boolean; bonus: boolean; teacherIds: string[] };

export function CourseForm({ course, teachers }: { course: CourseFields; teachers: { id: string; name: string }[] }) {
  const router = useRouter();
  const id = useId();
  const [v, setV] = useState(course);
  const [state, setState] = useState<{ busy?: boolean; error?: string; saved?: boolean }>({});
  const set = (patch: Partial<CourseFields>) => {
    setV((x) => ({ ...x, ...patch }));
    setState({});
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ busy: true });
        const r = await send(`/api/admin/courses/${course.id}`, "PATCH", v);
        setState(r.ok ? { saved: true } : { error: r.error });
        if (r.ok) router.refresh();
      }}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label htmlFor={`${id}-t`} className={label}>
          Title
          <input id={`${id}-t`} required value={v.title} onChange={(e) => set({ title: e.target.value })} className={`${field} mt-1.5`} />
        </label>
        <label htmlFor={`${id}-c`} className={label}>
          Label
          <input id={`${id}-c`} value={v.category} onChange={(e) => set({ category: e.target.value })} className={`${field} mt-1.5`} />
        </label>
      </div>
      <label htmlFor={`${id}-d`} className={label}>
        Description (students see this)
        <textarea id={`${id}-d`} rows={3} value={v.description} onChange={(e) => set({ description: e.target.value })} className={`${field} mt-1.5`} />
      </label>
      <fieldset>
        <legend className={label}>Teachers on this course (they see its students&apos; progress)</legend>
        {teachers.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {teachers.map((t) => {
              const on = v.teacherIds.includes(t.id);
              return (
                <label key={t.id} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${on ? "border-brand-600 bg-brand-500/10 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}>
                  <input type="checkbox" checked={on} className="size-3.5 accent-[var(--color-brand-600)]"
                    onChange={(e) => set({ teacherIds: e.target.checked ? [...v.teacherIds, t.id] : v.teacherIds.filter((x) => x !== t.id) })} />
                  {t.name}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">No teachers yet. Add them in the Teachers tab.</p>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Toggle checked={v.published} onChange={(published) => set({ published })}>Visible to students</Toggle>
        <Toggle checked={v.bonus} onChange={(bonus) => set({ bonus })}>Bonus course (opens after all other courses)</Toggle>
        <button type="submit" disabled={state.busy} className={`${primary} ml-auto`}>
          {state.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : state.saved ? "Saved" : "Save course"}
        </button>
      </div>
      {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
    </form>
  );
}

type LessonRow = { id: string; title: string; published: boolean; videoId: string; questions: number };

export function LessonList({ courseId, lessons }: { courseId: string; lessons: LessonRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(lessons);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Server data wins after a refresh (e.g. a lesson was added elsewhere).
  const [seen, setSeen] = useState(lessons);
  if (seen !== lessons) {
    setSeen(lessons);
    setRows(lessons);
  }

  async function move(i: number, by: -1 | 1) {
    const next = [...rows];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setRows(next);
    const r = await send(`/api/admin/courses/${courseId}/lessons`, "PUT", { ids: next.map((l) => l.id) });
    if (!r.ok) {
      setError(r.error);
      setRows(rows);
    } else router.refresh();
  }

  return (
    <div className="space-y-4">
      {rows.length ? (
        <ol className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-surface-card">
          {rows.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 p-4 sm:p-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/15 font-label text-xs font-bold text-ink-soft">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/courses/${courseId}/lessons/${l.id}`} className="font-semibold text-ink hover:text-brand-700">
                  {l.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {l.published ? "Visible" : "Hidden"} · {l.videoId ? "Video added" : "No video yet"} · {l.questions} question{l.questions === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className={`${ghost} !px-2.5 disabled:opacity-30`}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className={`${ghost} !px-2.5 disabled:opacity-30`}>
                  <ArrowDown className="size-3.5" />
                </button>
                <Link href={`/admin/courses/${courseId}/lessons/${l.id}`} className={ghost}>Edit</Link>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-3xl border border-ink/10 bg-surface-card p-8 text-center text-sm text-ink-soft">No lessons yet. Add the first one below.</p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const r = await send(`/api/admin/courses/${courseId}/lessons`, "POST", { title });
          setBusy(false);
          if (!r.ok) return setError(r.error);
          router.push(`/admin/courses/${courseId}/lessons/${r.data.id}`);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New lesson title" className={field} />
        <button type="submit" disabled={busy} className={`${primary} shrink-0 py-3`}>
          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <><Plus className="size-3.5" /> Add lesson</>}
        </button>
      </form>
      {error && <p role="alert" className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

type Q = { id: string; prompt: string; options: string[]; answer: number };
type LessonFields = { id: string; courseId: string; title: string; summary: string; videoId: string; notes: string; questions: Q[]; published: boolean };

let tempId = 0;
const blankQuestion = (): Q => ({ id: `new-${++tempId}`, prompt: "", options: ["", "", "", ""], answer: 0 });

export function LessonEditor({ lesson }: { lesson: LessonFields }) {
  const router = useRouter();
  const id = useId();
  const [v, setV] = useState(lesson);
  const [state, setState] = useState<{ busy?: boolean; error?: string; saved?: boolean }>({});
  const set = (patch: Partial<LessonFields>) => {
    setV((x) => ({ ...x, ...patch }));
    setState({});
  };
  const setQ = (i: number, patch: Partial<Q>) => set({ questions: v.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const blank = v.questions.findIndex((q) => !q.options[q.answer]?.trim());
    if (blank >= 0) return setState({ error: `Question ${blank + 1}: the ticked answer is empty.` });
    setState({ busy: true });
    const questions = v.questions.map((q) => ({
      ...q,
      id: q.id.startsWith("new-") ? "" : q.id,
      // Drop empty answer boxes but keep the chosen correct answer pointing at the same text.
      options: q.options.filter((o) => o.trim()),
      answer: q.options.slice(0, q.answer).filter((o) => o.trim()).length,
    }));
    const r = await send(`/api/admin/lessons/${v.id}`, "PATCH", { ...v, questions });
    setState(r.ok ? { saved: true } : { error: r.error });
    if (r.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
        <label htmlFor={`${id}-t`} className={label}>
          Lesson title
          <input id={`${id}-t`} required value={v.title} onChange={(e) => set({ title: e.target.value })} className={`${field} mt-1.5`} />
        </label>
        <label htmlFor={`${id}-s`} className={label}>
          Short summary (optional)
          <input id={`${id}-s`} value={v.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={300} className={`${field} mt-1.5`} />
        </label>
        <label htmlFor={`${id}-v`} className={label}>
          Bunny video ID
          <input id={`${id}-v`} value={v.videoId} onChange={(e) => set({ videoId: e.target.value.trim() })} placeholder="e.g. 8f3c1a2b-…  (Bunny → Stream → video → Video GUID)" className={`${field} mt-1.5 font-mono`} />
        </label>
        <label htmlFor={`${id}-n`} className={label}>
          Notes (shown under the video)
          <textarea id={`${id}-n`} rows={8} value={v.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Key points, links, prompts to copy…" className={`${field} mt-1.5`} />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">Quiz</h2>
            <p className="text-xs text-ink-soft">Students need 80% to unlock the next lesson. With no questions, they mark the lesson done after watching.</p>
          </div>
          <button type="button" onClick={() => set({ questions: [...v.questions, blankQuestion()] })} className={`${ghost} shrink-0`}>
            <Plus className="size-3.5" /> Add question
          </button>
        </div>
        {v.questions.map((q, i) => (
          <fieldset key={q.id} className="space-y-3 rounded-3xl border border-ink/10 bg-surface-card p-5">
            <div className="flex items-start gap-3">
              <span className="mt-2.5 font-label text-xs font-bold text-muted">Q{i + 1}</span>
              <textarea aria-label={`Question ${i + 1}`} rows={2} value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} placeholder="Question" className={field} />
              <button type="button" aria-label={`Delete question ${i + 1}`} onClick={() => set({ questions: v.questions.filter((_, j) => j !== i) })} className={`${danger} mt-1 !px-2.5`}>
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="grid gap-2 pl-7 sm:grid-cols-2">
              {q.options.map((o, k) => (
                <label key={k} className={`flex items-center gap-2 rounded-xl border px-2.5 ${q.answer === k ? "border-emerald-500/60 bg-emerald-500/10" : "border-transparent"}`}>
                  <input type="radio" name={`${id}-q${i}`} checked={q.answer === k} onChange={() => setQ(i, { answer: k })} aria-label={`Answer ${k + 1} is correct`} className="size-4 accent-emerald-600" />
                  <input value={o} onChange={(e) => setQ(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} placeholder={`Answer ${k + 1}`} className={`${field} !border-0 !bg-transparent !px-1 !ring-0`} />
                </label>
              ))}
            </div>
            <p className="pl-7 text-[11px] text-muted">Tick the correct answer. Leave a box empty to use fewer answers.</p>
          </fieldset>
        ))}
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-full border border-ink/10 bg-surface-card/95 p-2 pl-5 shadow-lg backdrop-blur">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={v.published} onChange={(e) => set({ published: e.target.checked })} className="size-4 accent-[var(--color-brand-600)]" />
          Visible to students
        </label>
        {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
        <div className="ml-auto flex gap-2">
          <button type="button"
            onClick={async () => {
              if (!confirm(`Delete “${v.title}”? This can't be undone.`)) return;
              const r = await send(`/api/admin/lessons/${v.id}`, "DELETE");
              if (!r.ok) return setState({ error: r.error });
              router.push(`/admin/courses/${v.courseId}`);
              router.refresh();
            }}
            className={danger}>
            Delete
          </button>
          <button type="submit" disabled={state.busy} className={primary}>
            {state.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : state.saved ? "Saved" : "Save lesson"}
          </button>
        </div>
      </div>
    </form>
  );
}
