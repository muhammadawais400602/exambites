import { Search } from "lucide-react";

/** Type a certificate ID to check it (plain GET form, works without JavaScript). */
export function VerifyForm({ value = "" }: { value?: string }) {
  return (
    <form action="/verify" method="get" className="flex gap-2">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Certificate ID</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input name="code" defaultValue={value} required placeholder="SOT-26-XXXX-XXXX" autoComplete="off" spellCheck={false}
          className="w-full rounded-full border border-ink/15 bg-surface py-3 pl-10 pr-4 font-mono text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-muted focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15" />
      </label>
      <button type="submit" className="shrink-0 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">Check</button>
    </form>
  );
}
