import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { certificateByCode } from "@/lib/server/certificates";

/** Link preview when a verify link is shared (LinkedIn, Facebook, WhatsApp, X). */
export const alt = "School of Tomorrow certificate of completion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "src/assets/fonts", file));

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const [cert, black, medium] = await Promise.all([
    certificateByCode(decodeURIComponent((await params).code)).catch(() => null),
    font("montserrat-latin-900-normal.woff"),
    font("montserrat-latin-500-normal.woff"),
  ]);
  const valid = cert && !cert.revoked;
  const col = { display: "flex", flexDirection: "column", alignItems: "center" } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#120d08", padding: 34, fontFamily: "Montserrat" }}>
        <div style={{ ...col, flex: 1, justifyContent: "center", background: "#fbf7ef", border: "4px solid #d97706", borderRadius: 18, padding: 44, textAlign: "center" }}>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 900, letterSpacing: 9, color: "#b45309" }}>SCHOOL OF TOMORROW</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 56, fontWeight: 900, color: "#120d08", letterSpacing: -1 }}>CERTIFICATE OF COMPLETION</div>
          {valid ? (
            <div style={col}>
              <div style={{ display: "flex", marginTop: 26, fontSize: 26, fontWeight: 500, color: "#5c5248" }}>awarded to</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: cert.name.length > 22 ? 58 : 74, fontWeight: 900, color: "#b45309" }}>{cert.name.slice(0, 40)}</div>
              <div style={{ display: "flex", marginTop: 14, fontSize: 26, fontWeight: 500, color: "#3d342b" }}>{`${cert.program} · ${cert.courses.length} courses + capstone`}</div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 30, padding: "10px 24px", borderRadius: 999, background: "#d1fae5", color: "#065f46", fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <circle cx="12" cy="12" r="11" fill="#10b981" />
                  <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {`VERIFIED · ${cert.code}`}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", marginTop: 30, fontSize: 28, fontWeight: 500, color: "#5c5248" }}>Check a certificate at schooloftomorrow.si/verify</div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Montserrat", data: black, weight: 900, style: "normal" }, { name: "Montserrat", data: medium, weight: 500, style: "normal" }] },
  );
}
