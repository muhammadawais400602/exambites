import { Suspense } from "react";
import type { Role } from "@/lib/roles";
import { currentUser } from "@/lib/server/session";
import { PortalHeader } from "./PortalShell";

/**
 * The portal header for a route layout. The logo and tabs show at once; the
 * signed-in user's picture and buttons fill in when the session is read.
 * `role` fixes the tabs (student / teacher); without it the user's own role is used.
 */
export function SessionHeader({ role }: { role?: Role }) {
  return (
    <Suspense fallback={<PortalHeader role={role ?? null} user={null} />}>
      <WithUser role={role} />
    </Suspense>
  );
}

async function WithUser({ role }: { role?: Role }) {
  const user = await currentUser();
  return <PortalHeader role={role ?? user?.role ?? null} user={user && !user.disabled ? user : null} />;
}
