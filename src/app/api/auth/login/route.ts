/**
 * Placeholder for portal sign-in. Validates the request shape and answers
 * that the portal isn't open yet. Replace with real authentication (user
 * store, password hashing, session cookie) when the portal is built.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; role?: unknown; mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const reset = body.mode === "reset";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 422 });
  }
  if (!reset && String(body.password ?? "").length < 1) {
    return Response.json({ ok: false, error: "Enter your password." }, { status: 422 });
  }

  return Response.json(
    {
      ok: false,
      error: reset
        ? "Password reset opens with the student portal. Your login details will be emailed to you."
        : "The portal opens soon. Your login details will be emailed to you once it's live.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
