import { Courses } from "@/components/home/Courses";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Trailer } from "@/components/home/Trailer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Trailer />
      <Marquee />
      <Courses />
      {/* Next: community, mastery, pricing, FAQ, enroll (#enroll) */}
    </main>
  );
}
