import type { Metadata } from "next";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Suspense } from "react";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginSwitch } from "@/components/login/LoginSwitch";
import { LoginShowcase } from "@/components/login/LoginShowcase";

export const metadata: Metadata = {
  title: "Log in · School of Tomorrow",
  description: "Log in to the School of Tomorrow student and teacher portal.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-surface px-4 pt-28 pb-20 md:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-200)_50%,transparent),transparent_75%)] dark:opacity-20"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <LoginShowcase />
          </div>
          <div className="order-1 lg:order-2">
            <Suspense fallback={<LoginForm role="student" />}>
              <LoginSwitch />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
