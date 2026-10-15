import "server-only";
import { createHash } from "node:crypto";

/**
 * Bunny Stream player URL for a lesson video. With BUNNY_TOKEN_KEY set (Bunny →
 * Stream → library → Security → "Embed view token authentication"), the URL is
 * signed and stops working after a few hours, so a copied link goes stale.
 */
export function videoEmbedUrl(videoId: string) {
  const library = process.env.BUNNY_LIBRARY_ID;
  if (!library || !videoId) return null;
  const params = new URLSearchParams({ autoplay: "false", preload: "true", responsive: "true" });
  const key = process.env.BUNNY_TOKEN_KEY;
  if (key) {
    const expires = Math.floor(Date.now() / 1000) + 4 * 60 * 60;
    params.set("token", createHash("sha256").update(key + videoId + expires).digest("hex"));
    params.set("expires", String(expires));
  }
  return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(library)}/${encodeURIComponent(videoId)}?${params}`;
}
