"use client";

import { Ban, BarChart3, Eye, EyeOff, KeyRound, LoaderCircle, MoreHorizontal, Pencil, Search, UserCheck, UserPen, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/portal/Avatar";

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  disabled: boolean;
  regNo: string;
  campus: string;
  className: string;
  section: string;
  courseId: string;
  courseTitle: string;
  status: "studying" | "completed";
};

type Patch = Partial<Pick<StudentRecord, "name" | "regNo" | "campus" | "className" | "section" | "disabled">>;

const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";
const control = "rounded-xl border border-ink/15 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-600";
const primary = "inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60";
const ghost = "inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink-soft hover:text-ink";

async function send(id: string, method: "PATCH" | "POST", body: Record<string, unknown>) {
  const res = await fetch(`/api/students/${id}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  return data?.ok ? null : (data?.error ?? "Connection problem. Try again.");
}

const progressHref = (s: StudentRecord, admin: boolean) => (admin ? `/admin/students/${s.id}` : `/teacher/courses/${s.courseId}/students/${s.id}`);

/** The teacher's (or admin's) student list: search, filter, inline Reg No edit and account actions. */
export function StudentTable({ students, admin = false }: { students: StudentRecord[]; admin?: boolean }) {
  const [rows, setRows] = useState(students);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "reg">("az");
  const [dialog, setDialog] = useState<{ kind: "edit" | "password" | "disable"; student: StudentRecord } | null>(null);

  const update = (id: string, patch: Patch) => setRows((r) => r.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const classes = useMemo(() => [...new Set(rows.map((s) => s.className).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [rows]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((s) => !needle || [s.name, s.regNo, s.email].some((v) => v.toLowerCase().includes(needle)))
      .filter((s) => !cls || s.className === cls)
      .filter((s) => !status || (status === "disabled" ? s.disabled : !s.disabled && s.status === status))
      .sort((a, b) =>
        sort === "reg" ? (a.regNo || "￿").localeCompare(b.regNo || "￿", undefined, { numeric: true })
        : sort === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
  }, [rows, q, cls, status, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">Search students</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, reg no, email…" className={`${control} w-full pl-9`} />
        </label>
        <select aria-label="Class" value={cls} onChange={(e) => setCls(e.target.value)} className={control}>
          <option value="">All classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={control}>
          <option value="">All statuses</option>
          <option value="studying">Studying</option>
          <option value="completed">Completed</option>
          <option value="disabled">Disabled</option>
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={control}>
          <option value="az">Name (A → Z)</option>
          <option value="za">Name (Z → A)</option>
          <option value="reg">Reg No</option>
        </select>
      </div>
      <p className="mt-3 text-xs text-muted">{shown.length === rows.length ? `${rows.length} student${rows.length === 1 ? "" : "s"}` : `${shown.length} of ${rows.length} students`}</p>

      <div className="relative mt-2 overflow-x-auto rounded-3xl border border-ink/10 bg-surface-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Reg No</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-12 px-2 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className={`border-b border-ink/5 last:border-0 hover:bg-ink/[0.025] ${s.disabled ? "opacity-60" : ""}`}>
                <td className="px-4 py-2.5">
                  <Link href={progressHref(s, admin)} className="flex items-center gap-2.5 font-semibold text-ink hover:text-brand-700">
                    <Avatar name={s.name} image={s.image} size={30} />
                    <span className="truncate">{s.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5"><RegNoCell student={s} onSaved={(regNo) => update(s.id, { regNo })} /></td>
                <td className="px-4 py-2.5 text-ink-soft">
                  {s.className || s.section ? [s.className, s.section && `Sec ${s.section}`].filter(Boolean).join(" · ") : "—"}
                  {s.campus && <span className="block text-[11px] text-muted">{s.campus}</span>}
                </td>
                <td className="max-w-56 truncate px-4 py-2.5 text-ink-soft" title={s.email}>{s.email}</td>
                <td className="max-w-44 truncate px-4 py-2.5 text-ink-soft" title={s.courseTitle}>{s.courseTitle}</td>
                <td className="px-4 py-2.5"><StatusBadge s={s} /></td>
                <td className="px-2 py-2.5">
                  <RowMenu student={s} progress={progressHref(s, admin)} onPick={(kind) => setDialog({ kind, student: s })} />
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-soft">{rows.length ? "No students match." : "No students on your courses yet."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {dialog && <StudentDialog {...dialog} onClose={() => setDialog(null)} onDone={(patch) => update(dialog.student.id, patch)} />}
    </div>
  );
}

function StatusBadge({ s }: { s: StudentRecord }) {
  const [text, cls] = s.disabled
    ? ["Disabled", "bg-red-500/15 text-red-500"]
    : s.status === "studying"
      ? ["Studying", "bg-brand-500/15 text-brand-700"]
      : ["Completed", "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"];
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{text}</span>;
}

/** Reg No with a pencil: click to edit, Enter or click away to save, Escape to cancel. */
function RegNoCell({ student, onSaved }: { student: StudentRecord; onSaved: (regNo: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(student.regNo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = useRef(false);

  async function save() {
    if (done.current) return;
    done.current = true;
    const v = value.trim();
    if (v === student.regNo) return setEditing(false);
    setBusy(true);
    const err = await send(student.id, "PATCH", { regNo: v });
    setBusy(false);
    if (err) { done.current = false; return setError(err); }
    onSaved(v);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button type="button" onClick={() => { setValue(student.regNo); setError(""); done.current = false; setEditing(true); }}
        aria-label={`Edit Reg No for ${student.name}`} className="group inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
        <span className={student.regNo ? "" : "text-muted"}>{student.regNo || "—"}</span>
        <Pencil className="size-3 text-muted group-hover:text-brand-700" />
      </button>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-1">
        <input autoFocus value={value} maxLength={40} aria-label={`Reg No for ${student.name}`} disabled={busy}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { done.current = true; setEditing(false); } }}
          onBlur={save} className="w-32 rounded-lg border border-brand-600 bg-surface px-2 py-1 text-sm text-ink outline-none" />
        {busy && <LoaderCircle className="size-3.5 animate-spin text-muted" />}
      </div>
      {error && <p role="alert" className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function RowMenu({ student, progress, onPick }: { student: StudentRecord; progress: string; onPick: (k: "edit" | "password" | "disable") => void }) {
  // Fixed position so the menu isn't clipped by the table's scroll box.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const away = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);
  function toggle() {
    if (pos) return setPos(null);
    const r = btn.current!.getBoundingClientRect();
    const h = 180, w = 192;
    setPos({ top: r.bottom + h + 8 > window.innerHeight ? r.top - h - 4 : r.bottom + 4, left: Math.max(8, r.right - w) });
  }
  const item = "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-ink/5";
  const pick = (k: "edit" | "password" | "disable") => { setPos(null); onPick(k); };
  return (
    <>
      <button ref={btn} type="button" onClick={toggle} aria-label={`Actions for ${student.name}`} aria-expanded={!!pos}
        className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink">
        <MoreHorizontal className="size-4" />
      </button>
      {pos && (
        <div ref={menu} role="menu" style={{ top: pos.top, left: pos.left }} className="fixed z-50 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-surface-card py-1 text-ink shadow-xl">
          <Link role="menuitem" href={progress} className={item}><BarChart3 className="size-4 text-muted" /> View progress</Link>
          <button role="menuitem" type="button" onClick={() => pick("edit")} className={item}><UserPen className="size-4 text-muted" /> Edit profile</button>
          <button role="menuitem" type="button" onClick={() => pick("password")} disabled={student.disabled} className={`${item} disabled:opacity-40`}><KeyRound className="size-4 text-muted" /> Reset password</button>
          <button role="menuitem" type="button" onClick={() => pick("disable")} className={`${item} ${student.disabled ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {student.disabled ? <><UserCheck className="size-4" /> Enable account</> : <><Ban className="size-4" /> Disable account</>}
          </button>
        </div>
      )}
    </>
  );
}

/** Edit profile, reset password, or disable/enable, in a modal. Also used on the admin's student page. */
export function StudentDialog({ kind, student, onClose, onDone }: {
  kind: "edit" | "password" | "disable"; student: StudentRecord; onClose: () => void; onDone?: (patch: Patch) => void;
}) {
  const router = useRouter();
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const [v, setV] = useState({ name: student.name, regNo: student.regNo, campus: student.campus, className: student.className, section: student.section });
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: string }>({});
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    if (kind === "edit") {
      const err = await send(student.id, "PATCH", v);
      if (err) return setState({ error: err });
      onDone?.(v);
      router.refresh();
      return ref.current?.close();
    }
    if (kind === "password") {
      if (password.length < 8) return setState({ error: "Use at least 8 characters." });
      const err = await send(student.id, "POST", { action: "password", password });
      if (err) return setState({ error: err });
      return setState({ done: `Password changed. Give it to ${student.name.split(" ")[0]}; they've been signed out on other devices.` });
    }
    const err = await send(student.id, "POST", { action: student.disabled ? "enable" : "disable" });
    if (err) return setState({ error: err });
    onDone?.({ disabled: !student.disabled });
    router.refresh();
    ref.current?.close();
  }

  const title = kind === "edit" ? "Edit profile" : kind === "password" ? "Reset password" : student.disabled ? "Enable account" : "Disable account";
  const input = (key: keyof typeof v, label: string, max: number, placeholder = "") => (
    <label htmlFor={`${id}-${key}`} className="text-xs font-semibold text-ink-soft">
      {label}
      <input id={`${id}-${key}`} value={v[key]} maxLength={max} placeholder={placeholder} required={key === "name"}
        onChange={(e) => { setV((x) => ({ ...x, [key]: e.target.value })); setState({}); }} className={`${field} mt-1.5`} />
    </label>
  );
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }} aria-labelledby={`${id}-t`}
      className="m-auto w-[min(92vw,28rem)] rounded-3xl border border-ink/10 bg-surface-card p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm">
      <form onSubmit={submit} className="grid gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={`${id}-t`} className="font-display text-xl font-black uppercase tracking-tight text-ink">{title}</h2>
            <p className="text-xs text-muted">{student.name} · {student.email}</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-ink/5"><X className="size-4" /></button>
        </div>

        {kind === "edit" && (
          <>
            {input("name", "Name", 60)}
            <div className="grid gap-4 sm:grid-cols-2">
              {input("regNo", "Registration number", 40, "e.g. 2024-0153")}
              {input("campus", "Campus", 80, "e.g. Main Campus")}
              {input("className", "Class", 40, "e.g. Class 1")}
              {input("section", "Section", 20, "e.g. B")}
            </div>
          </>
        )}
        {kind === "password" && !state.done && (
          <label htmlFor={`${id}-p`} className="text-xs font-semibold text-ink-soft">
            New password (8+ characters)
            <div className="relative mt-1.5">
              <input id={`${id}-p`} type={show ? "text" : "password"} autoComplete="new-password" value={password} required
                onChange={(e) => { setPassword(e.target.value); setState({}); }} className={`${field} pr-11`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted hover:text-ink">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
        )}
        {kind === "disable" && (
          <p className="text-sm text-ink-soft">
            {student.disabled ? "They'll be able to log in again." : "They'll be signed out and can't log in until the account is enabled again. Their progress is kept."}
          </p>
        )}

        {state.error && <p role="alert" className="text-xs font-medium text-red-500">{state.error}</p>}
        {state.done && <p role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-ink">{state.done}</p>}
        <div className="flex justify-end gap-2">
          {state.done ? (
            <button type="button" onClick={() => ref.current?.close()} className={primary}>Done</button>
          ) : (
            <>
              <button type="button" onClick={() => ref.current?.close()} className={ghost}>Cancel</button>
              <button type="submit" disabled={state.busy}
                className={kind === "disable" && !student.disabled ? `${primary} bg-red-600 hover:bg-red-700` : primary}>
                {state.busy ? <LoaderCircle className="size-4 animate-spin" /> : kind === "edit" ? "Save" : kind === "password" ? "Set password" : student.disabled ? "Enable" : "Disable"}
              </button>
            </>
          )}
        </div>
      </form>
    </dialog>
  );
}

/** The same actions as buttons, for a single student's page. */
export function StudentActions({ student }: { student: StudentRecord }) {
  const [s, setS] = useState(student);
  const [kind, setKind] = useState<"edit" | "password" | "disable" | null>(null);
  const btn = "inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-bold text-ink-soft hover:text-ink";
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setKind("edit")} className={btn}><UserPen className="size-3.5" /> Edit profile</button>
      <button type="button" onClick={() => setKind("password")} disabled={s.disabled} className={`${btn} disabled:opacity-40`}><KeyRound className="size-3.5" /> Reset password</button>
      <button type="button" onClick={() => setKind("disable")} className={`${btn} ${s.disabled ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
        {s.disabled ? <><UserCheck className="size-3.5" /> Enable account</> : <><Ban className="size-3.5" /> Disable account</>}
      </button>
      {kind && <StudentDialog kind={kind} student={s} onClose={() => setKind(null)} onDone={(patch) => setS((x) => ({ ...x, ...patch }))} />}
    </div>
  );
}
