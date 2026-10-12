import type { Metadata } from "next";
import { Community } from "@/components/home/Community";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { FinalCta, MidCta } from "@/components/testimonials/Ctas";
import { Reviews } from "@/components/testimonials/Reviews";
import { TestimonialsHero } from "@/components/testimonials/TestimonialsHero";
import { VideoStories } from "@/components/testimonials/VideoStories";
import { postsSection } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Testimonials · Exambites Creative Academy",
  description: "Video stories, community posts and written reviews from Exambites students earning with AI skills.",
};

export default function TestimonialsPage() {
  return (
    <>
      <Header />
      <main>
        <TestimonialsHero />
        <VideoStories />
        <MidCta />
        <Community id="posts" copy={postsSection} />
        <Reviews />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
