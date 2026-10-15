import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { db } from "@/lib/server/db";
import { normaliseCode } from "@/lib/server/referrals";

/** Creates a referral code with a use limit and an optional expiry date. */
export async function POST(request: Request) {
  return asAdmin(request, async (admin) => {
    const body = await readJson<{ code: string; maxUses: number; expiresAt: string | null; note: string }>(request);
    const code = normaliseCode(String(body.code ?? ""));
    const maxUses = Number(body.maxUses);
    const note = String(body.note ?? "").trim().slice(0, 120);
    if (!/^[A-Z0-9-]{3,24}$/.test(code)) return reply({ ok: false, error: "Use 3–24 letters, numbers or dashes." }, 422);
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 100_000) {
      return reply({ ok: false, error: "Uses must be a whole number from 1 to 100,000." }, 422);
    }
    let expiresAt: Date | null = null;
    if (body.expiresAt) {
      // The code works until the end of the chosen day, Pakistan time.
      expiresAt = new Date(`${body.expiresAt}T23:59:59+05:00`);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
        return reply({ ok: false, error: "Pick an expiry date in the future." }, 422);
      }
    }
    try {
      await db().collection("referralCodes").insertOne({
        code, maxUses, uses: 0, expiresAt, active: true, note, createdAt: new Date(), createdBy: admin.id,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return reply({ ok: false, error: "That code already exists." }, 409);
      throw err;
    }
    await audit(admin, "referral.created", `Created referral code ${code} (${maxUses} uses)`, { code });
    return reply({ ok: true });
  });
}
