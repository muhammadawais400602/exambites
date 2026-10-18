/**
 * Lesson videos come from YouTube (for now) or Bunny Stream. They're stored
 * as "yt:<id>" for YouTube and as the plain Bunny video GUID otherwise.
 */
export type VideoRef = { kind: "youtube"; id: string } | { kind: "bunny"; id: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const BUNNY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads what the admin pasted: a YouTube link, a YouTube ID, or a Bunny video GUID. */
export function parseVideo(input: string): VideoRef | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith("yt:") && YT_ID.test(s.slice(3))) return { kind: "youtube", id: s.slice(3) };
  if (BUNNY_ID.test(s)) return { kind: "bunny", id: s.toLowerCase() };
  if (YT_ID.test(s)) return { kind: "youtube", id: s };
  try {
    const url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1] ?? null;
    }
    if (id && YT_ID.test(id)) return { kind: "youtube", id };
  } catch {
    // Not a URL.
  }
  return null;
}

export const storeVideo = (v: VideoRef) => (v.kind === "youtube" ? `yt:${v.id}` : v.id);

/** What the lesson editor shows for a stored value. */
export function displayVideo(stored: string) {
  const v = parseVideo(stored);
  return v?.kind === "youtube" ? `https://youtu.be/${v.id}` : stored;
}
