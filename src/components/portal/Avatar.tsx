/** Profile picture with an initials fallback. Plain <img>: avatars are tiny and served by our API. */
export function Avatar({ name, image, size = 36, className = "" }: { name: string; image?: string | null; size?: number; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) };
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" width={size} height={size} style={style} className={`shrink-0 rounded-full object-cover ring-1 ring-ink/10 ${className}`} />
  ) : (
    <span aria-hidden style={style} className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 font-label font-bold text-white ${className}`}>
      {initials}
    </span>
  );
}
