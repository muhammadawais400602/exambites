// Copy for the three login pages.
import { Award, LineChart, type LucideIcon, MessagesSquare, PlayCircle } from "lucide-react";
import { priceLabel } from "@/lib/pricing";
import type { Role } from "@/lib/roles";

export const loginPage = {
  eyebrow: "Exambites portal",
  title: { lead: "Welcome", highlight: "back." },
  body: "Pick up where you left off: lessons, projects, the community and your certificates, all in one place.",
  perks: [
    { Icon: PlayCircle, label: "All 6 courses, lesson by lesson" },
    { Icon: LineChart, label: "Progress saved across devices" },
    { Icon: MessagesSquare, label: "Project feedback from mentors" },
    { Icon: Award, label: "Certificates when you finish" },
  ] satisfies { Icon: LucideIcon; label: string }[],
  roles: {
    student: { heading: "Student login", hint: "Use the email you signed up with." },
    teacher: { heading: "Teacher login", hint: "Use the email the academy invited you with." },
    admin: { heading: "Admin login", hint: "Academy administrators only." },
  } satisfies Record<Role, { heading: string; hint: string }>,
  noAccount: { text: "Not a student yet?", cta: `Enroll for ${priceLabel}`, href: "/enroll" },
};
