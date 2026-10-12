// Login page copy. The portal itself is not built yet.
import { Award, LineChart, type LucideIcon, MessagesSquare, PlayCircle } from "lucide-react";

export type Role = "student" | "admin";

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
    student: { label: "Student", heading: "Student login", hint: "Use the email you enrolled with." },
    admin: { label: "Admin", heading: "Admin login", hint: "For academy staff only." },
  } satisfies Record<Role, { label: string; heading: string; hint: string }>,
  noAccount: { text: "Not a student yet?", cta: "Enroll for Rs. 4,800", href: "/enroll" },
};
