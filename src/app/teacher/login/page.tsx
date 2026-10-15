import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";
import { AuthFrame } from "@/components/portal/AuthFrame";

export const metadata: Metadata = { title: "Teacher login · Exambites", robots: { index: false } };

export default function TeacherLoginPage() {
  return (
    <AuthFrame>
      <LoginForm role="teacher" />
    </AuthFrame>
  );
}
