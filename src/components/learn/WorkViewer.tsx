import { Download, ExternalLink, FileText, Link2 } from "lucide-react";
import { embedFor, fileView, officeViewer } from "@/lib/embed";
import { formatBytes } from "@/lib/files";

type File_ = { id: string; name: string; url: string; size: number; type: string };

const frame = "w-full rounded-2xl border border-ink/10 bg-white";

/**
 * A student's work shown inside the page: the link embedded when the service
 * allows it (YouTube, Google Drive / Docs / Slides, Canva, Figma, Loom, Vimeo),
 * and each file previewed (images, PDF, text, Word / PowerPoint / Excel).
 * Everything also has an "Open" button for a full view in a new tab.
 * `openHref` is the access-checked address of a file.
 */
export function WorkViewer({ link, files, openHref }: { link: string; files: File_[]; openHref: (fileId: string) => string }) {
  const embed = link ? embedFor(link) : null;
  return (
    <div className="space-y-4">
      {link && (
        <Item
          icon={<Link2 className="size-4 shrink-0 text-brand-700" />}
          title={embed ? `${embed.kind} link` : "Link"}
          sub={link}
          action={<a href={link} target="_blank" rel="noopener noreferrer nofollow" className={btn}><ExternalLink className="size-3.5" /> Open</a>}
        >
          {embed ? (
            <>
              <iframe src={embed.src} title={`${embed.kind}: student's work`} loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className={`${frame} ${embed.ratio === "video" ? "aspect-video" : "h-[70vh] min-h-96"}`} />
              <p className="mt-1.5 text-[11px] text-muted">Blank or asking to sign in? The student hasn&apos;t shared it publicly. Use Open, or ask them to share it as &ldquo;Anyone with the link&rdquo;.</p>
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-ink/15 p-4 text-xs text-ink-soft">This site can&apos;t be shown inside the page. Use <span className="font-semibold">Open</span> to view it in a new tab.</p>
          )}
        </Item>
      )}
      {files.map((f) => {
        const view = fileView(f.type);
        const open = openHref(f.id);
        return (
          <Item key={f.id} icon={<FileText className="size-4 shrink-0 text-brand-700" />} title={f.name} sub={formatBytes(f.size)}
            action={<a href={open} target="_blank" rel="noreferrer" className={btn}>{view === "download" ? <><Download className="size-3.5" /> Download</> : <><ExternalLink className="size-3.5" /> Open</>}</a>}>
            {view === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.name} loading="lazy" className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-ink/10 object-contain" />
            )}
            {view === "frame" && <iframe src={f.url} title={f.name} loading="lazy" className={`${frame} h-[75vh] min-h-96`} />}
            {view === "office" && (
              <>
                <iframe src={officeViewer(f.url)} title={f.name} loading="lazy" className={`${frame} h-[75vh] min-h-96`} />
                <p className="mt-1.5 text-[11px] text-muted">Shown with Microsoft&apos;s free Office viewer. If it doesn&apos;t load, use Open.</p>
              </>
            )}
            {view === "download" && <p className="rounded-2xl border border-dashed border-ink/15 p-4 text-xs text-ink-soft">This file type can&apos;t be previewed. Download it to check.</p>}
          </Item>
        );
      })}
    </div>
  );
}

const btn = "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink-soft hover:text-ink";

function Item({ icon, title, sub, action, children }: { icon: React.ReactNode; title: string; sub: string; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          <p className="truncate text-xs text-muted">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
