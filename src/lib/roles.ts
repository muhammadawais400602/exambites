// Shared by server and browser code.
export type Role = "admin" | "teacher" | "student";

/** Where each role lands after logging in. */
export const HOME: Record<Role, string> = { admin: "/admin", teacher: "/teacher", student: "/portal" };
/** Each role's login page. The admin one is not linked from the website. */
export const LOGIN: Record<Role, string> = { admin: "/admin/login", teacher: "/login?as=teacher", student: "/login" };
export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", teacher: "Teacher", student: "Student" };
