import { IdCard, UserRound } from "lucide-react";

const field =
  "w-full rounded-full border border-ink/15 bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

/**
 * Check a certificate by its ID and the name printed on it (plain GET form,
 * works without JavaScript). Both must match for it to count as genuine.
 */
export function VerifyForm({ code = "", name = "" }: { code?: string; name?: string }) {
  return (
    <form action="/verify" method="get" className="grid gap-3">
      <label className="relative block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-soft">Certificate ID</span>
        <IdCard className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-muted" />
        <input name="code" defaultValue={code} required placeholder="SOT-26-XXXX-XXXX" autoComplete="off" spellCheck={false}
          className={`${field} font-mono uppercase placeholder:normal-case`} />
      </label>
      <label className="relative block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-soft">Name on the certificate</span>
        <UserRound className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-muted" />
        <input name="name" defaultValue={name} required minLength={2} maxLength={80} placeholder="e.g. Ali Raza Khan" autoComplete="off" className={field} />
      </label>
      <button type="submit" className="mt-1 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">Check certificate</button>
    </form>
  );
}
