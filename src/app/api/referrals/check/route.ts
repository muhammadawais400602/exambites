import { PRICE, REFERRAL_PRICE } from "@/lib/pricing";
import { isCodeUsable } from "@/lib/server/referrals";

/** Lets the sign-up form show the discounted price before submitting. */
export async function POST(request: Request) {
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  const valid = typeof code === "string" && code.length <= 40 && (await isCodeUsable(code));
  return Response.json(
    { valid, amount: valid ? REFERRAL_PRICE : PRICE },
    { headers: { "Cache-Control": "no-store" } },
  );
}
