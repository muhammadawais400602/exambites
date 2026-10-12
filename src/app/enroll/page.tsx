import type { Metadata } from "next";
import { HelpBox, Seat, Syllabus } from "@/components/enroll/EnrollSections";
import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";

export const metadata: Metadata = {
  title: "Enroll · Exambites Creative Academy",
  description: "Lock your seat at the Rs. 4,800 launch price: 5 AI courses plus a bonus, lifetime access and the Exambites community.",
};

export default function EnrollPage() {
  return (
    <>
      <Header />
      <main>
        <Seat />
        <Syllabus />
        <Faq />
        <HelpBox />
      </main>
      <Footer />
    </>
  );
}
