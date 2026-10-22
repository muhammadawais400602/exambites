import { Award } from "lucide-react";
import { brand } from "@/content/home";

export type CertificateView = {
  code: string;
  name: string;
  program: string;
  courses: string[];
  capstoneTitle: string;
  issuedAt: string;
};

const issued = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" });

/**
 * The certificate itself: a landscape A4 "paper" (same in light and dark
 * mode). Sizes are in container units so it scales with its width and prints
 * as one page. `qrSvg` is the verify QR code as SVG markup we generated.
 */
export function CertificateCard({ cert, qrSvg, verifyHost }: { cert: CertificateView; qrSvg: string; verifyHost: string }) {
  return (
    <div id="certificate" className="[container-type:inline-size] w-full">
      <div className="relative aspect-[297/210] w-full overflow-hidden rounded-[2.2cqw] bg-[#120d08] p-[3.4cqw] text-[#120d08] shadow-2xl print:rounded-none print:shadow-none [print-color-adjust:exact]">
        <div className="relative h-full rounded-[0.6cqw] border-[0.18cqw] border-[#d97706] bg-[#fbf7ef] p-[1.1cqw]">
          <div className="flex h-full flex-col items-center rounded-[0.3cqw] [&>*]:shrink-0 border-[0.1cqw] border-[#d97706]/70 px-[5cqw] pb-[3cqw] pt-[3.4cqw] text-center">
            <span className="grid size-[7.5cqw] shrink-0 place-items-center rounded-full bg-[#120d08] ring-[0.5cqw] ring-[#d97706]/25">
              <Award className="size-[4cqw] text-[#f59e0b]" strokeWidth={1.6} />
            </span>
            <p className="mt-[1.8cqw] font-display text-[1.9cqw] font-black uppercase tracking-[0.42em] text-[#b45309]">{brand.name}</p>
            <h1 className="mt-[1.2cqw] whitespace-nowrap font-display text-[4.3cqw] font-black uppercase leading-none tracking-[-0.01em]">Certificate of Completion</h1>
            <p className="mt-[1.6cqw] text-[1.7cqw] text-[#5c5248]">This certifies that</p>
            <p className="mt-[0.8cqw] max-w-full truncate px-[2cqw] font-display text-[5cqw] font-black leading-tight text-[#b45309]">{cert.name}</p>
            <div className="mt-[0.6cqw] h-[0.1cqw] w-[38%] bg-[#120d08]/20" />
            <p className="mt-[1.6cqw] max-w-[80%] text-[1.75cqw] leading-snug text-[#3d342b]">
              has successfully completed the <span className="font-bold text-[#120d08]">{cert.program}</span>: {cert.courses.length} courses and the capstone project
              <span className="font-semibold text-[#120d08]"> &ldquo;{cert.capstoneTitle}&rdquo;</span>.
            </p>
            <p className="mt-[1cqw] max-w-[86%] text-[1.15cqw] uppercase leading-relaxed tracking-[0.12em] text-[#7a6e62]">{cert.courses.join("  ·  ")}</p>

            <div className="mt-auto flex w-full items-end justify-between gap-[2cqw] text-left">
              <div className="text-[1.25cqw] uppercase leading-[1.7] tracking-[0.08em] text-[#5c5248]">
                <p>Issued · {issued(cert.issuedAt)}</p>
                <p>ID · <span className="font-semibold text-[#120d08]">{cert.code}</span></p>
                <p>Verify · {verifyHost}/verify</p>
              </div>
              <div className="flex items-center gap-[1.2cqw]">
                <p className="text-right text-[1.25cqw] uppercase leading-[1.4] tracking-[0.08em] text-[#5c5248]">Scan to<br />verify</p>
                <div className="rounded-[0.6cqw] border-[0.1cqw] border-[#120d08]/15 bg-white p-[0.7cqw]">
                  {/* Our own SVG (qrcode library output), not user input. */}
                  <div aria-label={`QR code to verify certificate ${cert.code}`} role="img" className="size-[9cqw] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
