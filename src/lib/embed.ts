import { parseVideo } from "./video";

/**
 * Turns a link a student pasted into something we can show inside the page:
 * the service's own embed/preview address. Returns null for links that can't
 * be embedded (most websites block it); those get an "Open" button instead.
 */
export type Embed = { kind: string; src: string; ratio: "video" | "doc" };

export function embedFor(link: string): Embed | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  const yt = parseVideo(link);
  if (yt?.kind === "youtube") return { kind: "YouTube", src: `https://www.youtube-nocookie.com/embed/${yt.id}?rel=0`, ratio: "video" };

  if (host === "drive.google.com") {
    const id = parts[0] === "file" && parts[1] === "d" ? parts[2] : url.searchParams.get("id");
    if (parts[0] === "drive" && parts[1] === "folders" && parts[2]) return { kind: "Google Drive folder", src: `https://drive.google.com/embeddedfolderview?id=${parts[2]}#grid`, ratio: "doc" };
    if (id) return { kind: "Google Drive", src: `https://drive.google.com/file/d/${id}/preview`, ratio: "doc" };
  }
  if (host === "docs.google.com" && parts[1] === "d" && parts[2]) {
    const id = parts[2];
    if (parts[0] === "document") return { kind: "Google Docs", src: `https://docs.google.com/document/d/${id}/preview`, ratio: "doc" };
    if (parts[0] === "spreadsheets") return { kind: "Google Sheets", src: `https://docs.google.com/spreadsheets/d/${id}/preview`, ratio: "doc" };
    if (parts[0] === "presentation") return { kind: "Google Slides", src: `https://docs.google.com/presentation/d/${id}/embed`, ratio: "video" };
    if (parts[0] === "forms") return { kind: "Google Forms", src: `https://docs.google.com/forms/d/${id}/viewform?embedded=true`, ratio: "doc" };
  }
  if ((host === "canva.com" || host.endsWith(".canva.com")) && parts[0] === "design" && parts[1]) {
    // canva.com/design/<id>/<share token>/view — the token is what makes a shared link work.
    const token = parts[2] && !["edit", "view", "watch"].includes(parts[2]) ? `/${parts[2]}` : "";
    return { kind: "Canva", src: `https://www.canva.com/design/${parts[1]}${token}/view?embed`, ratio: "video" };
  }
  if (host === "figma.com" && ["file", "design", "proto", "board"].includes(parts[0])) {
    return { kind: "Figma", src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(link)}`, ratio: "doc" };
  }
  if (host === "loom.com" && parts[0] === "share" && parts[1]) return { kind: "Loom", src: `https://www.loom.com/embed/${parts[1]}`, ratio: "video" };
  if (host === "vimeo.com" && /^\d+$/.test(parts[0] ?? "")) return { kind: "Vimeo", src: `https://player.vimeo.com/video/${parts[0]}`, ratio: "video" };
  return null;
}

const OFFICE = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

/**
 * How an uploaded file is shown: image, PDF / text in the browser, Office
 * files through Microsoft's free viewer (it fetches the file from its public
 * storage address), anything else as a download.
 */
export function fileView(type: string): "image" | "frame" | "office" | "download" {
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf" || type === "text/plain" || type === "text/csv") return "frame";
  if (OFFICE.has(type)) return "office";
  return "download";
}

export const officeViewer = (blobUrl: string) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}`;
