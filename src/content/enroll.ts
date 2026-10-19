// Enroll page copy. Items marked TODO need real details before launch.
import { priceLabel, referralPriceLabel } from "@/lib/pricing";
import { BadgeCheck, Bot, FileText, Infinity as InfinityIcon, type LucideIcon, Users, Wallet, Wrench, Zap } from "lucide-react";

export const enrollPage = {
  eyebrow: "Secure enrollment · Batch 04",
  title: { lead: "Lock your seat.", highlight: "Start earning with AI." },
  trust: ["Verified payments", "1,200+ students inside", "Launch price locked"],
};

export const offer = {
  label: "One payment, all courses",
  price: priceLabel,
  referral: `${referralPriceLabel} with a referral code`,
  terms: "One-time fee · Lifetime access",
  body: "A complete, step-by-step program built for Pakistani students, creators and freelancers to learn AI skills and get paid in dollars by clients at home and abroad.",
  features: [
    { Icon: FileText, title: "6 courses", body: "AI Basics, Graphic Design, Video Editing & Filmmaking, Web Development, Digital Marketing, and Freelancing & Portfolio Building." },
    { Icon: Zap, title: "Income playbooks", body: "Tested ways to find, pitch and keep clients in Pakistan, the Gulf, UK and US." },
    { Icon: Wallet, title: "Get paid in USD", body: "Step-by-step setup for Payoneer, Wise, Fiverr and Upwork withdrawals." },
    { Icon: Bot, title: "Prompt library", body: "Ready-made prompts for ChatGPT, Claude, Midjourney and more, organised by course." },
    { Icon: Wrench, title: "Free-tool first", body: "Start without paying for subscriptions; upgrade only when a client pays for it." },
    { Icon: Users, title: "Private community", body: "Mentors and peers who review your work and answer questions every day." },
  ] satisfies { Icon: LucideIcon; title: string; body: string }[],
  // DEMO quote: replace with a real student's words.
  quote: {
    text: "Closed a $1,400 monthly client in Dubai within 22 days of finishing the AI Graphic Design course.",
    name: "Ahmed Z.",
    note: "Batch 02 · Karachi",
  },
  guarantees: [
    { Icon: Zap, title: "Access within 24 hours", body: "Course login and community invite after payment" },
    { Icon: InfinityIcon, title: "Lifetime updates", body: "New lessons and tools at no extra cost" },
    { Icon: BadgeCheck, title: "Certificate", body: "Completion certificate for every track" },
  ] satisfies { Icon: LucideIcon; title: string; body: string }[],
};

export const sources = ["Instagram", "TikTok", "YouTube", "Facebook", "A friend", "Google search", "Other"];

/** Pakistani payment methods offered at checkout. */
export const paymentMethods = ["Raast", "Meezan Bank", "JazzCash", "Easypaisa", "NayaPay"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const checkout = {
  amount: priceLabel,
  // TODO: add the real account title and number for each method. While a
  // value is empty, step 2 says the details will be emailed.
  accounts: {
    Raast: { title: "", number: "" },
    "Meezan Bank": { title: "", number: "" },
    JazzCash: { title: "", number: "" },
    Easypaisa: { title: "", number: "" },
    NayaPay: { title: "", number: "" },
  } satisfies Record<PaymentMethod, { title: string; number: string }>,
  policy: "Payments are non-refundable once your account is approved and you start watching.",
};

export const syllabus = {
  eyebrow: "Syllabus",
  title: { lead: "Six courses,", highlight: "one path" },
  body: "Built for paid client work from day one: learn the tools, make the work, then sell it.",
};

export const helpBox = {
  title: "Still have questions before you join?",
  body: "Not sure which track to start with, or how payment works? The FAQ above covers it, and your seat reference is emailed to you after you sign up.",
  cta: `Lock your seat · ${priceLabel}`,
};
