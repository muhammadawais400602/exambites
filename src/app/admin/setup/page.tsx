import type { Metadata } from "next";
import { AdminSetupForm } from "@/components/portal/AdminSetupForm";
import { AuthFrame } from "@/components/portal/AuthFrame";

export const metadata: Metadata = { title: "Admin setup · Exambites", robots: { index: false } };

export default function AdminSetupPage() {
  return (
    <AuthFrame>
      <AdminSetupForm />
    </AuthFrame>
  );
}
