import "server-only";
import { createHash } from "node:crypto";
import { parseVideo } from "@/lib/video";

/**
 * Player URL for a lesson video.
 *
 * YouTube: privacy-enhanced embed without related videos. Unlisted YouTube
 * videos can be shared and downloaded by anyone who has the link, so this is
 * a stop-gap until videos move to Bunny.
 *
 * Bunny Stream: with BUNNY_TOKEN_KEY set (Bunny → Stream → library → Security
 * → "Embed view token authentication"), the URL is signed and stops working
 * after a few hours, so a copied link goes stale.
 */
export function videoEmbedUrl(stored: string, pageOrigin?: string) {
  const video = parseVideo(stored);
  if (!video) return null;
  if (video.kind === "youtube") {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", iv_load_policy: "3" });
    // Lets the page read playback progress (to unlock the quiz after watching).
    if (pageOrigin) { params.set("enablejsapi", "1"); params.set("origin", pageOrigin); }
    return `https://www.youtube-nocookie.com/embed/${video.id}?${params}`;
  }
  const library = process.env.BUNNY_LIBRARY_ID;
  if (!library) return null;
  const params = new URLSearchParams({ autoplay: "false", preload: "true", responsive: "true" });
  const key = process.env.BUNNY_TOKEN_KEY;
  if (key) {
    const expires = Math.floor(Date.now() / 1000) + 4 * 60 * 60;
    params.set("token", createHash("sha256").update(key + video.id + expires).digest("hex"));
    params.set("expires", String(expires));
  }
  return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(library)}/${encodeURIComponent(video.id)}?${params}`;
}
