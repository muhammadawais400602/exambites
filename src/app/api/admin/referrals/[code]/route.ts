import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { normaliseCode } from "@/lib/server/referrals";

/** Pauses or resumes a code. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/referrals/[code]">) {
  return asAdmin(request, async (admin) => {
    const code = normaliseCode((await ctx.params).code);
    const { active } = await readJson<{ active: boolean }>(request);
    if (typeof active !== "boolean") return reply({ ok: false, error: "Invalid request." }, 400);
    const res = await db().collection("referralCodes").updateOne({ code }, { $set: { active } });
    if (!res.matchedCount) return reply({ ok: false, error: "Code not found." }, 404);
    await audit(admin, "referral.updated", `${active ? "Resumed" : "Paused"} referral code ${code}`, { code });
    return reply({ ok: true });
  });
}

/** Deletes a code. Past sign-ups keep a record of the code they used. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/referrals/[code]">) {
  return asAdmin(request, async (admin) => {
    const code = normaliseCode((await ctx.params).code);
    const res = await db().collection("referralCodes").deleteOne({ code });
    if (!res.deletedCount) return reply({ ok: false, error: "Code not found." }, 404);
    await audit(admin, "referral.deleted", `Deleted referral code ${code}`, { code });
    return reply({ ok: true });
  });
}
