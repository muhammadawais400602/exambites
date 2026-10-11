import { Community } from "@/components/home/Community";
import { Courses } from "@/components/home/Courses";
import { Hero } from "@/components/home/Hero";
import { Inside } from "@/components/home/Inside";
import { Marquee } from "@/components/home/Marquee";
import { Trailer } from "@/components/home/Trailer";
import { TwoPaths } from "@/components/home/TwoPaths";

export default function Home() {
  return (
    <main>
      <Hero />
      <Trailer />
      <Marquee />
      <Courses />
      <Community />
      <Inside />
      <TwoPaths />
      {/* Next: mastery, FAQ, enroll (#enroll) */}
    </main>
  );
}
