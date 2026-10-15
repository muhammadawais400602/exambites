import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFrame } from "@/components/portal/AuthFrame";
import { ResetPasswordForm } from "@/components/portal/ResetPasswordForm";

export const metadata: Metadata = { title: "Set password · Exambites", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthFrame>
      {/* Reads ?token= from the URL, which is only known at request time. */}
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-ink/[0.06]" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthFrame>
  );
}
