import { Community } from "./Community";
import { Courses } from "./Courses";
import { Enroll } from "./Enroll";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Inside } from "./Inside";
import { Marquee } from "./Marquee";
import { Trailer } from "./Trailer";
import { TwoPaths } from "./TwoPaths";

/** The full homepage. */
export function HomePage() {
  return (
    <>
      <Header />
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
