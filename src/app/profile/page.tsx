import { redirect } from "next/navigation";

/** The profile lives on the settings page now; keeps old links working. */
export default function ProfilePage() {
  redirect("/settings");
}
