import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Exambites Academy · Crack Your Exam With AI",
  description:
    "Turn AI-powered exam prep into a top 1% rank in 90 days. MDCAT, MCAT, NET, ECAT and SAT.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${jakarta.variable} ${grotesk.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-dvh bg-surface font-sans text-ink overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
