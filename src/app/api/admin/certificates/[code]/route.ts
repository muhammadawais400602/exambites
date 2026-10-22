import { asAdmin, readJson, reply } from "@/lib/server/admin-api";
import { setCertificateRevoked } from "@/lib/server/certificates";

/** Withdraw or restore a certificate: { revoked: boolean }. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/certificates/[code]">) {
  return asAdmin(request, async (admin) => {
    const { revoked } = await readJson<{ revoked: boolean }>(request);
    const ok = await setCertificateRevoked({ id: admin.id, name: admin.name, role: "admin" }, (await ctx.params).code, !!revoked);
    return ok ? reply({ ok: true }) : reply({ ok: false, error: "Certificate not found." }, 404);
  });
}
