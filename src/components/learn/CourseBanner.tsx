import { CourseIcon } from "./CourseCover";

/** Wide course banner for the lesson screen: the cover picture, or a designed strip. */
export function CourseBanner({ title, slug, image }: { title: string; slug: string; image?: string | null }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-3xl border border-ink/10 bg-[#120d08] sm:h-36">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_120%_at_90%_0%,color-mix(in_srgb,var(--color-brand-500)_55%,transparent),transparent_65%),radial-gradient(50%_120%_at_0%_100%,color-mix(in_srgb,var(--color-brand-800)_70%,transparent),transparent_70%)]" />
          <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:28px_28px]" />
          <CourseIcon slug={slug} aria-hidden className="absolute -right-6 top-1/2 size-48 -translate-y-1/2 text-white/10" strokeWidth={1.2} />
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-display text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">{title}</p>
        </>
      )}
    </div>
  );
}
