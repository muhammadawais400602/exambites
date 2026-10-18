import { getAuth } from "@/lib/server/auth";

/**
 * Signs the current session out and clears its cookie. Unlike the client
 * sign-out, it works on any address the site is served from (it needs no
 * trusted-origin match), so a stale BETTER_AUTH_URL or an extra domain can't
 * leave someone stuck signed in. Cross-site requests are refused.
 */
export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ ok: false, error: "Not allowed." }, { status: 403 });
  }
  const res = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  try {
    const out = await getAuth().api.signOut({ headers: request.headers, asResponse: true });
    for (const cookie of out.headers.getSetCookie()) res.headers.append("Set-Cookie", cookie);
  } catch (err) {
    // No session to end: still a successful sign-out from the user's point of view.
    console.warn("[logout]", err);
  }
  return res;
}
