import { reply } from "@/lib/server/admin-api";
import { requireApiRole } from "@/lib/server/session";
import { resetStudentPassword, setStudentDisabled, updateStudent } from "@/lib/server/students";

/** Teachers (for students on their courses) and the admin manage student records here. */
async function staff(request: Request) {
  const user = await requireApiRole(request, "any");
  if (user instanceof Response) return user;
  if (user.role !== "teacher" && user.role !== "admin") return reply({ ok: false, error: "Not allowed." }, 403);
  return user;
}

/** Name and/or school details: { name?, regNo?, campus?, className?, section? }. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/students/[id]">) {
  const user = await staff(request);
  if (user instanceof Response) return user;
  const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const result = await updateStudent(user, (await ctx.params).id, body);
  return result.ok ? reply(result) : reply(result, result.status);
}

/** { action: "password", password } | { action: "disable" } | { action: "enable" }. */
export async function POST(request: Request, ctx: RouteContext<"/api/students/[id]">) {
  const user = await staff(request);
  if (user instanceof Response) return user;
  const id = (await ctx.params).id;
  const body = ((await request.json().catch(() => ({}))) ?? {}) as { action?: string; password?: unknown };
  const result =
    body.action === "password" ? await resetStudentPassword(user, id, String(body.password ?? ""))
    : body.action === "disable" || body.action === "enable" ? await setStudentDisabled(user, id, body.action === "disable")
    : { ok: false as const, error: "Invalid request.", status: 400 };
  return result.ok ? reply(result) : reply(result, result.status);
}
