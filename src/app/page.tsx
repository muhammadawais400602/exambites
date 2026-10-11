import { Community } from "@/components/home/Community";
import { Courses } from "@/components/home/Courses";
import { Enroll } from "@/components/home/Enroll";
import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { Hero } from "@/components/home/Hero";
import { Inside } from "@/components/home/Inside";
import { Marquee } from "@/components/home/Marquee";
import { Trailer } from "@/components/home/Trailer";
import { TwoPaths } from "@/components/home/TwoPaths";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Trailer />
        <Marquee />
        <Courses />
        <Community />
        <Inside />
        <TwoPaths />
        <Enroll />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
