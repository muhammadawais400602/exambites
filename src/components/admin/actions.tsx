"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Calls an admin API route and refreshes the page's server data on success. */
function useAdminCall() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function call(key: string, url: string, method: string, body?: unknown): Promise<false | Record<string, unknown>> {
    setBusy(key);
    setError("");
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong.");
        return false;
      }
      router.refresh();
      return data;
    } catch {
      setError("Connection problem. Try again.");
      return false;
    } finally {
      setBusy(null);
    }
  }
  return { busy, error, call };
}

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors disabled:cursor-wait disabled:opacity-60";
const primary = `${btn} bg-brand-600 text-white hover:bg-brand-700`;
const ghost = `${btn} border border-ink/15 text-ink-soft hover:border-brand-600/50 hover:text-ink`;
const danger = `${btn} border border-red-500/30 text-red-500 hover:bg-red-500/10`;
export const field =
  "w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

function Spin({ on, children }: { on: boolean; children: React.ReactNode }) {
  return on ? <LoaderCircle className="size-3.5 animate-spin" /> : <>{children}</>;
}

function ErrorText({ text }: { text: string }) {
  return text ? <p role="alert" className="text-xs font-medium text-red-500">{text}</p> : null;
}

export function EnrollmentActions({ id }: { id: string }) {
  const { busy, error, call } = useAdminCall();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const url = `/api/admin/enrollments/${id}`;

  if (rejecting) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-72">
        <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Reason (sent to the student)" className={field} />
        <div className="flex gap-2">
          <button type="button" disabled={!!busy} onClick={() => call("reject", url, "POST", { action: "reject", note })} className={danger}>
            <Spin on={busy === "reject"}>Reject</Spin>
          </button>
          <button type="button" onClick={() => setRejecting(false)} className={ghost}>Cancel</button>
        </div>
        <ErrorText text={error} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button type="button" disabled={!!busy}
          onClick={() => confirm("Approve this payment? The student gets access straight away.") && call("approve", url, "POST", { action: "approve" })}
          className={primary}>
          <Spin on={busy === "approve"}>Approve</Spin>
        </button>
        <button type="button" disabled={!!busy} onClick={() => setRejecting(true)} className={ghost}>Reject</button>
      </div>
      <ErrorText text={error} />
    </div>
  );
}

type Invite = { link: string; emailed: boolean };
const asInvite = (data: false | Record<string, unknown>): Invite | null =>
  data && typeof data.link === "string" ? { link: data.link, emailed: !!data.emailed } : null;

/** The set-password link, to copy and send by WhatsApp if the email doesn't arrive. */
function InviteLink({ invite, name }: { invite: Invite; name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" className="w-full rounded-2xl border border-brand-600/30 bg-brand-500/10 p-4 text-left sm:basis-full">
      <p className="text-xs text-ink">
        {invite.emailed ? `Invite emailed to ${name}.` : `Email couldn't be sent to ${name}.`} Send them this link to set
        their password (valid 7 days):
      </p>
      <div className="mt-2 flex gap-2">
        <input readOnly value={invite.link} onFocus={(e) => e.target.select()} className={`${field} font-mono text-xs`} />
        <button type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(invite.link);
            setCopied(true);
          }}
          className={`${primary} shrink-0`}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function AddTeacherForm() {
  const { busy, error, call } = useAdminCall();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState<{ invite: Invite; name: string } | null>(null);
  const [done, setDone] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setInvite(null);
        setDone("");
        const data = await call("add", "/api/admin/teachers", "POST", { name, email, password });
        if (!data) return;
        const got = asInvite(data);
        if (got) setInvite({ invite: got, name });
        else setDone(`${name} can log in at /login (Teacher tab) with ${email} and the password you set.`);
        setName("");
        setEmail("");
        setPassword("");
      }}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:[&>input]:flex-1"
    >
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
      <input type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (optional)" className={field} />
      <button type="submit" disabled={!!busy} className={`${primary} shrink-0 py-3`}>
        <Spin on={busy === "add"}><Plus className="size-3.5" /> Add teacher</Spin>
      </button>
      {error && <p role="alert" className="text-xs font-medium text-red-500 sm:basis-full">{error}</p>}
      {done && <p role="status" className="text-xs text-ink-soft sm:basis-full">{done}</p>}
      {invite && <InviteLink invite={invite.invite} name={invite.name} />}
    </form>
  );
}

export function TeacherActions({ id, name, email, disabled }: { id: string; name: string; email: string; disabled: boolean }) {
  const { busy, error, call } = useAdminCall();
  const [invite, setInvite] = useState<Invite | null>(null);
  const url = `/api/admin/teachers/${id}`;
  return (
    <div className="flex flex-col items-end gap-1.5 sm:max-w-md">
      <div className="flex flex-wrap justify-end gap-2">
        {disabled ? (
          <button type="button" disabled={!!busy}
            onClick={async () => setInvite(asInvite(await call("restore", "/api/admin/teachers", "POST", { name, email })))}
            className={ghost}>
            <Spin on={busy === "restore"}>Restore</Spin>
          </button>
        ) : (
          <>
            <button type="button" disabled={!!busy}
              onClick={async () => {
                const password = prompt(`New password for ${name} (8+ characters). They will be signed out everywhere.`);
                if (password && (await call("password", url, "POST", { action: "password", password }))) alert(`Password updated for ${name}.`);
              }}
              className={ghost}>
              <Spin on={busy === "password"}>Set password</Spin>
            </button>
            <button type="button" disabled={!!busy}
              onClick={async () => setInvite(asInvite(await call("resend", url, "POST", { action: "resend" })))} className={ghost}>
              <Spin on={busy === "resend"}>Invite link</Spin>
            </button>
            <button type="button" disabled={!!busy}
              onClick={() => confirm(`Remove ${name}? They are signed out at once. Their answers stay.`) && call("remove", url, "DELETE")}
              className={danger}>
              <Spin on={busy === "remove"}>Remove</Spin>
            </button>
          </>
        )}
      </div>
      <ErrorText text={error} />
      {invite && <InviteLink invite={invite} name={name} />}
    </div>
  );
}

export function ReferralForm() {
  const { busy, error, call } = useAdminCall();
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("50");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (await call("create", "/api/admin/referrals", "POST", { code, maxUses: Number(maxUses), expiresAt: expiresAt || null, note })) {
          setCode("");
          setNote("");
          setExpiresAt("");
        }
      }}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr_1.4fr_auto]"
    >
      <label className="text-xs font-semibold text-ink-soft">
        Code
        <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} pattern="[A-Za-z0-9-]{3,24}" placeholder="FRIEND25" className={`${field} mt-1.5 uppercase`} />
      </label>
      <label className="text-xs font-semibold text-ink-soft">
        Max uses
        <input required type="number" min={1} max={100000} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={`${field} mt-1.5`} />
      </label>
      <label className="text-xs font-semibold text-ink-soft">
        Expires (optional)
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={`${field} mt-1.5`} />
      </label>
      <label className="text-xs font-semibold text-ink-soft">
        Note (optional)
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="e.g. Ali's referrals" className={`${field} mt-1.5`} />
      </label>
      <div className="flex flex-col justify-end gap-1.5">
        <button type="submit" disabled={!!busy} className={`${primary} py-3`}>
          <Spin on={busy === "create"}><Plus className="size-3.5" /> Create</Spin>
        </button>
      </div>
      <div className="sm:col-span-2 lg:col-span-5"><ErrorText text={error} /></div>
    </form>
  );
}

export function ReferralActions({ code, active }: { code: string; active: boolean }) {
  const { busy, error, call } = useAdminCall();
  const url = `/api/admin/referrals/${encodeURIComponent(code)}`;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button type="button" disabled={!!busy} onClick={() => call("toggle", url, "PATCH", { active: !active })} className={ghost}>
          <Spin on={busy === "toggle"}>{active ? "Pause" : "Resume"}</Spin>
        </button>
        <button type="button" disabled={!!busy} onClick={() => confirm(`Delete ${code}? Students who already used it keep their price.`) && call("delete", url, "DELETE")} className={danger}>
          <Spin on={busy === "delete"}>Delete</Spin>
        </button>
      </div>
      <ErrorText text={error} />
    </div>
  );
}
