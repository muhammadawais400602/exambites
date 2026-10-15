"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Starts a course. Only one course is open at a time, so it asks first. */
export function ChooseCourse({ courseId, title }: { courseId: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button type="button" disabled={busy}
        onClick={async () => {
          if (!confirm(`Start ${title}? You can only take one course at a time, and switch after you finish it.`)) return;
          setBusy(true);
          setError("");
          const res = await fetch("/api/portal/next-course", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) }).catch(() => null);
          const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; slug?: string } | null;
          setBusy(false);
          if (!data?.ok) return setError(data?.error ?? "Connection problem. Try again.");
          router.push(`/portal/courses/${data.slug}`);
          router.refresh();
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand-600/50 px-3.5 py-2 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white disabled:opacity-60">
        {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : "Start this course"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
