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
  title: "School of Tomorrow · Crack With AI",
  description:
    "AI courses for students: AI Basics, AI Graphic Design, AI Video Editing & Filmmaking, AI Web Development, AI Digital Marketing, and Freelancing & Portfolio Building. Learn the tools, land clients and earn with AI in 90 days.",
};

// Dark is the default. Runs before first paint so a visitor who switched to
// light keeps it without a flash.
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${jakarta.variable} ${grotesk.variable} ${jetbrains.variable} antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-surface font-sans text-ink overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
