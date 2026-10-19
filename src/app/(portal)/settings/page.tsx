import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, PortalLoading } from "@/components/portal/PortalShell";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { HOME } from "@/lib/roles";
import { getProfile } from "@/lib/server/profile";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Settings · School of Tomorrow", robots: { index: false } };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const phone = String(user.phone ?? "").replace(/^\+92/, "");
  return (
    <>
      <Link href={HOME[user.role]} className="text-xs font-semibold text-muted hover:text-brand-700">← Back</Link>
      <div className="mb-6 mt-3">
        <PageTitle eyebrow="Account" title="Settings" />
      </div>
      <ProfileForm
        initial={{ name: user.name, phone, ...profile }}
        image={user.image ?? null}
        email={user.email}
        showPhone={user.role === "student"}
      />
    </>
  );
}
