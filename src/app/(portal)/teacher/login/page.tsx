import { redirect } from "next/navigation";

/** Teachers log in on the shared /login page; old links land on its teacher tab. */
export default function TeacherLoginPage() {
  redirect("/login?as=teacher");
}
