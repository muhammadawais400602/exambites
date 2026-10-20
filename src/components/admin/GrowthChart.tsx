"use client";

import { Table2, BarChart3 } from "lucide-react";
import { useId, useState } from "react";

export type GrowthPoint = { label: string; short: string; value: number; note?: string };

/** Clean axis top just above the max: 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 or 10 × a power of ten. */
function niceMax(max: number) {
  if (max <= 0) return 4;
  const p = 10 ** Math.floor(Math.log10(max));
  return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * p).find((v) => v >= max) ?? 10 * p;
}

const compact = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(Math.round(n * 10) / 10);

/**
 * One measure per month as columns (single series, so no legend: the title
 * names it). Hover or focus a month for its exact value; the table view
 * shows every value. The last month is the current one, so far.
 */
export function GrowthChart({ title, subtitle, points, unit }: { title: string; subtitle: string; points: GrowthPoint[]; unit: "count" | "rs" }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const top = niceMax(Math.max(...points.map((p) => p.value)));
  const fmt = (n: number) => (unit === "rs" ? `Rs. ${n.toLocaleString("en-US")}` : n.toLocaleString("en-US"));
  const tick = (n: number) => (unit === "rs" ? (n ? `Rs ${compact(n)}` : "0") : compact(n));
  const last = points.length - 1;
  const empty = points.every((p) => p.value === 0);

  return (
    <section aria-labelledby={`${id}-t`} className="rounded-3xl border border-ink/10 bg-surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${id}-t`} className="font-display text-base font-black uppercase tracking-tight text-ink">{title}</h3>
          <p className="text-xs text-ink-soft">{subtitle}</p>
        </div>
        <button type="button" onClick={() => setTable((t) => !t)} aria-pressed={table}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink">
          {table ? <><BarChart3 className="size-3.5" /> Chart</> : <><Table2 className="size-3.5" /> Table</>}
        </button>
      </div>

      {table ? (
        <div className="mt-4 max-h-72 overflow-y-auto" data-lenis-prevent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <th className="py-2 font-bold">Month</th>
                <th className="py-2 text-right font-bold">{title}</th>
                {points.some((p) => p.note) && <th className="py-2 text-right font-bold">Running total</th>}
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p, i) => (
                <tr key={p.label} className="border-b border-ink/5 last:border-0">
                  <td className="py-2 text-ink-soft">{p.label}{i === 0 && <span className="ml-1 text-muted">(so far)</span>}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-ink">{fmt(p.value)}</td>
                  {p.note !== undefined && <td className="py-2 text-right tabular-nums text-ink-soft">{p.note}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5">
          <div className="relative flex h-52">
            {/* Y axis: 0, half, top */}
            <div aria-hidden className="relative w-14 shrink-0 text-[10px] tabular-nums text-muted">
              {[1, 0.5, 0].map((f) => (
                <span key={f} className="absolute right-2 -translate-y-1/2" style={{ top: `${(1 - f) * 100}%` }}>{tick(top * f)}</span>
              ))}
            </div>
            <div className="relative flex-1">
              {[0, 0.5, 1].map((f) => (
                <div key={f} aria-hidden className="absolute inset-x-0 h-px bg-ink/10" style={{ top: `${f * 100}%` }} />
              ))}
              {empty && <p className="absolute inset-0 grid place-items-center text-xs text-muted">No approved payments yet</p>}
              <ol className="relative flex h-full items-end">
                {points.map((p, i) => {
                  const h = (p.value / top) * 100;
                  const on = active === i;
                  return (
                    <li key={p.label} className="relative flex h-full flex-1 justify-center">
                      <button type="button" aria-label={`${p.label}${i === last ? " (so far)" : ""}: ${fmt(p.value)}${p.note ? `, ${p.note}` : ""}`}
                        onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                        className="group absolute inset-0 flex items-end justify-center rounded-lg outline-none focus-visible:bg-ink/5">
                        <span className={`block w-[min(24px,60%)] rounded-t-[4px] bg-brand-600 transition-opacity ${active !== null && !on ? "opacity-40" : ""}`}
                          style={{ height: p.value ? `max(${h}%, 2px)` : 0 }} />
                      </button>
                      {/* Direct label only on the current month. */}
                      {i === last && p.value > 0 && !on && (
                        <span aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1 text-[10px] max-sm:hidden font-semibold tabular-nums text-ink" style={{ bottom: `${h}%` }}>
                          {unit === "rs" ? tick(p.value) : fmt(p.value)}
                        </span>
                      )}
                      {on && (
                        <div role="tooltip" className={`pointer-events-none absolute z-10 w-max -translate-y-full rounded-xl border border-ink/10 bg-surface px-3 py-2 text-xs shadow-xl ${i > points.length / 2 ? "right-0" : "left-0"}`}
                          style={{ bottom: `calc(${h}% + 8px)` }}>
                          <p className="font-bold tabular-nums text-ink">{fmt(p.value)}</p>
                          <p className="text-ink-soft">{p.label}{i === last ? " (so far)" : ""}</p>
                          {p.note && <p className="mt-0.5 text-muted">{p.note}</p>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <ol aria-hidden className="ml-14 mt-2 flex text-[10px] text-muted">
            {points.map((p, i) => (
              <li key={p.label} className={`flex-1 text-center ${i % 2 && i !== last ? "max-sm:invisible" : ""} ${i === last ? "font-semibold text-ink-soft" : ""}`}>{p.short}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
