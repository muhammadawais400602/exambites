import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Exambites Creative Academy · Violet",
};

/** Same homepage in the violet palette from DESIGN.md. */
export default function VioletHome() {
  return (
    <div data-palette="violet" className="min-h-dvh bg-surface text-ink">
      <HomePage />
    </div>
  );
}
