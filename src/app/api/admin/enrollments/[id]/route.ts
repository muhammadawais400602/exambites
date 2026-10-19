import { formatRs } from "@/lib/pricing";
import { asAdmin, objectId, readJson, reply } from "@/lib/server/admin-api";
import { audit } from "@/lib/server/audit";
import { toId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendEmail, siteUrl } from "@/lib/server/email";

/** Approve or reject a pending payment. Approving unlocks the student's portal. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/enrollments/[id]">) {
  return asAdmin(request, async (admin) => {
    const id = objectId((await ctx.params).id);
    const { action, note } = await readJson<{ action: "approve" | "reject"; note: string }>(request);
    if (!id || (action !== "approve" && action !== "reject")) return reply({ ok: false, error: "Invalid request." }, 400);

    const status = action === "approve" ? "approved" : "rejected";
    const enrollment = await db()
      .collection("enrollments")
      .findOneAndUpdate(
        { _id: id, status: "pending" },
        { $set: { status, decidedAt: new Date(), decidedBy: admin.id, note: String(note ?? "").slice(0, 500) } },
        { returnDocument: "after" },
      );
    if (!enrollment) return reply({ ok: false, error: "This payment was already handled." }, 409);

    const student = await db().collection("user").findOne({ _id: toId(enrollment.userId) });
    const who = student?.name ?? "Student";
    await audit(admin, action === "approve" ? "enrollment.approved" : "enrollment.rejected",
      `${action === "approve" ? "Approved" : "Rejected"} ${who}'s payment (${formatRs(enrollment.amount)}, ${enrollment.reference})`,
      { enrollmentId: String(id), userId: enrollment.userId });

    if (student?.email) {
      await sendEmail({
        to: student.email,
        subject: action === "approve" ? "Your School of Tomorrow account is active" : "About your School of Tomorrow payment",
        text:
          action === "approve"
            ? `Assalam o Alaikum ${who},\n\nWe received your payment (${enrollment.reference}). Your account is active and AI Basics is unlocked.\n\nLog in: ${siteUrl()}/login\n\nSchool of Tomorrow`
            : `Assalam o Alaikum ${who},\n\nWe couldn't match a payment to your reference ${enrollment.reference}.${note ? `\n\nNote from the academy: ${note}` : ""}\n\nReply to this email if you've already paid.\n\nSchool of Tomorrow`,
      }).catch((err) => console.error("[enroll] decision email failed", err));
    }
    return reply({ ok: true, status });
  });
}
