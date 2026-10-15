import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";
import { AuthFrame } from "@/components/portal/AuthFrame";

export const metadata: Metadata = { title: "Admin login · Exambites", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <AuthFrame>
      <LoginForm role="admin" />
    </AuthFrame>
  );
}
