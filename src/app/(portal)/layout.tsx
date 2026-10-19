import { PortalFrame } from "@/components/portal/PortalShell";
import { SessionHeader } from "@/components/portal/SessionHeader";

/**
 * Student portal, teacher portal and settings share this layout, so the
 * header stays on screen when moving between their pages; only the content
 * below it reloads.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalFrame header={<SessionHeader />}>{children}</PortalFrame>;
}
