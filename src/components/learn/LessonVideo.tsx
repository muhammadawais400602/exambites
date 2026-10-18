"use client";

import { Lock, PlayCircle } from "lucide-react";
import { createContext, use, useEffect, useMemo, useRef, useState } from "react";

/**
 * Lesson video + watch tracking. The quiz (wrapped in <QuizGate>) opens once
 * the student has actually played most of the video: the player is polled
 * every second and only seconds that played count, so skipping ahead doesn't.
 */
const WATCHED_SHARE = 0.9;

type Watch = { required: boolean; watched: boolean; pct: number; failed?: boolean };
const WatchContext = createContext<Watch>({ required: false, watched: true, pct: 100 });

type Player = { time: () => number; duration: () => number; playing: () => boolean };

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLIFrameElement, opts: { events: { onReady: () => void } }) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
    playerjs?: { Player: new (el: HTMLIFrameElement) => PlayerJs };
  }
}
type YTPlayer = { getCurrentTime: () => number; getDuration: () => number; getPlayerState: () => number };
type PlayerJs = { on: (e: string, cb: (d?: { seconds: number; duration: number }) => void) => void };

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("player script failed"));
    document.head.appendChild(s);
  });
}

async function youtubePlayer(iframe: HTMLIFrameElement): Promise<Player> {
  if (!window.YT?.Player) {
    const ready = new Promise<void>((r) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); r(); };
    });
    await loadScript("https://www.youtube.com/iframe_api");
    if (!window.YT?.Player) await ready;
  }
  return new Promise((resolve) => {
    const p = new window.YT!.Player(iframe, {
      events: { onReady: () => resolve({ time: () => p.getCurrentTime(), duration: () => p.getDuration(), playing: () => p.getPlayerState() === 1 }) },
    });
  });
}

async function bunnyPlayer(iframe: HTMLIFrameElement): Promise<Player> {
  await loadScript("https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js");
  const p = new window.playerjs!.Player(iframe);
  const state = { t: 0, d: 0, playing: false };
  p.on("ready", () => {
    p.on("timeupdate", (d) => { if (d) { state.t = d.seconds; state.d = d.duration; } });
    p.on("play", () => { state.playing = true; });
    p.on("pause", () => { state.playing = false; });
    p.on("ended", () => { state.playing = false; });
  });
  return { time: () => state.t, duration: () => state.d, playing: () => state.playing };
}

export function LessonWatch({ lessonId, required, initiallyWatched, children }: { lessonId: string; required: boolean; initiallyWatched: boolean; children: React.ReactNode }) {
  const [state, setState] = useState<Watch>({ required, watched: !required || initiallyWatched, pct: initiallyWatched ? 100 : 0 });
  // Stable, so progress updates don't restart the tracker.
  const setter = useMemo(() => ({ lessonId, setState }), [lessonId]);
  return (
    <WatchContext value={state}>
      <WatchSetter.Provider value={setter}>{children}</WatchSetter.Provider>
    </WatchContext>
  );
}

const WatchSetter = createContext<{ lessonId: string; setState: React.Dispatch<React.SetStateAction<Watch>> } | null>(null);

export function LessonVideo({ src, kind, title, watermark }: { src: string; kind: "youtube" | "bunny"; title: string; watermark: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const setter = use(WatchSetter);
  const watch = use(WatchContext);

  useEffect(() => {
    if (!setter || !watch.required || watch.watched || !ref.current) return;
    const { lessonId, setState } = setter;
    const seen = new Set<number>();
    let started = false;
    let finishing = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopped = false;
    const beacon = (event: "start" | "complete", duration: number) =>
      fetch(`/api/portal/lessons/${lessonId}/watch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, duration }) })
        .then((r) => r.json() as Promise<{ ok?: boolean }>)
        .catch(() => ({ ok: false }));

    (kind === "youtube" ? youtubePlayer(ref.current) : bunnyPlayer(ref.current))
      .then((player) => {
        if (stopped) return;
        timer = setInterval(async () => {
          const d = player.duration();
          if (!player.playing() || !d) return;
          if (!started) { started = true; beacon("start", d); }
          seen.add(Math.floor(player.time()));
          const pct = Math.min(100, Math.round((seen.size / Math.ceil(d)) * 100));
          setState((s) => (s.watched ? s : { ...s, pct }));
          if (pct >= WATCHED_SHARE * 100 && !finishing) {
            finishing = true;
            const res = await beacon("complete", d);
            if (res.ok) {
              clearInterval(timer);
              setState((s) => ({ ...s, watched: true, pct: 100 }));
            } else finishing = false;
          }
        }, 1000);
      })
      .catch(() => setState((s) => ({ ...s, failed: true })));
    return () => { stopped = true; clearInterval(timer); };
  }, [setter, watch.required, watch.watched, kind]);
  // (watch.watched flips once, when the quiz unlocks; the tracker stops then.)

  return (
    <div className="relative mt-6 aspect-video overflow-hidden rounded-3xl border border-ink/10 bg-black">
      <iframe ref={ref} src={src} title={title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full border-0" />
      {/* Who is watching, so screen recordings can be traced back to an account. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <span className="watermark absolute font-mono text-xs text-white/25">{watermark}</span>
      </div>
    </div>
  );
}

/** Shows the quiz once the video is watched; until then a progress note. */
export function QuizGate({ children }: { children: React.ReactNode }) {
  const watch = use(WatchContext);
  if (watch.watched) return <>{children}</>;
  return (
    <div className="rounded-3xl border border-ink/10 bg-surface-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-brand-500/10 text-brand-700"><Lock className="size-4" /></span>
        <div>
          <p className="font-display text-lg font-black uppercase tracking-tight text-ink">Quiz locked</p>
          <p className="text-sm text-ink-soft">
            {watch.failed
              ? "The video tracker didn't load. Check your connection and refresh the page."
              : "Watch the video to unlock it. Skipping ahead doesn't count."}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <PlayCircle className="size-4 text-muted" />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={watch.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Video watched">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500 transition-[width] duration-700" style={{ width: `${watch.pct}%` }} />
        </div>
        <span className="shrink-0 whitespace-nowrap text-right text-xs font-bold text-ink-soft">{watch.pct}% watched</span>
      </div>
    </div>
  );
}
