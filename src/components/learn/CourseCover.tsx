import { BookOpen, Lock, type LucideProps } from "lucide-react";
import { createElement } from "react";
import { courses as catalogue } from "@/content/courses";
import { slugify } from "@/lib/slug";

const icons = new Map(catalogue.map((c) => [slugify(c.title), c.Icon]));

/** The catalogue icon for a course (by slug), or a book for new courses. */
export function CourseIcon({ slug, ...props }: LucideProps & { slug: string }) {
  return createElement(icons.get(slug) ?? BookOpen, props);
}

/**
 * A course's cover: the admin's picture when there is one, otherwise a
 * designed amber cover with the course icon. Locked courses are dimmed and
 * show a padlock.
 */
export function CourseCover({ title, slug, image, number, locked, bonus }: {
  title: string; slug: string; image?: string | null; number: number; locked?: boolean; bonus?: boolean;
}) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-[#120d08]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className={`absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${locked ? "grayscale" : ""}`} />
      ) : (
        <div className={`absolute inset-0 ${locked ? "grayscale" : ""}`}>
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,color-mix(in_srgb,var(--color-brand-500)_55%,transparent),transparent_60%),radial-gradient(90%_80%_at_0%_100%,color-mix(in_srgb,var(--color-brand-800)_70%,transparent),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:28px_28px]" />
          <CourseIcon slug={slug} aria-hidden className="absolute -bottom-6 -right-4 size-40 text-white/10" strokeWidth={1.2} />
          <div className="absolute inset-x-5 bottom-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{bonus ? "Bonus module" : `Module ${number}`}</p>
            <p className="mt-1 font-display text-2xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-[1.7rem]">{title}</p>
          </div>
          <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur"><CourseIcon slug={slug} className="size-5" /></span>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
        {bonus ? "Bonus" : `Course ${number}`}
      </span>
      {locked && (
        <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)]">
          <span className="grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur"><Lock className="size-5" /></span>
        </div>
      )}
    </div>
  );
}
