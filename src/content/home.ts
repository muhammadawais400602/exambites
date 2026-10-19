// Homepage copy. Edit text here, not in components.

// Skill areas the courses cover; demo posts, stories and reviews are tagged with one.
import { priceLabel, referralPriceLabel } from "@/lib/pricing";
export const tracks = ["Content", "Marketing", "Web", "Selling"] as const;
export type Track = (typeof tracks)[number];

export const hero = {
  headline: ["CRACK", "WITH", "AI"],
  tagline: {
    before: "turn ai skills into ",
    highlight: "real client income",
    after: ", from zero, in 90 days.",
  },
  students: "1,200+ students inside",
  price: priceLabel,
  priceNote: `(${referralPriceLabel} with a referral code)`,
  cta: { label: "Enroll now", price: priceLabel, href: "/enroll" },
  scrollCue: { label: "Watch the trailer below", href: "#trailer" },
};

export const trailer = {
  eyebrow: "The 3 min breakdown",
  title: { lead: "See exactly how students go", from: "from ", highlight: "zero to AI income" },
  body: "A quick peek under the hood: the exact tools, prompt systems and client workflows taught in AI Basics, Graphic Design, Video Editing & Filmmaking, Web Development, Digital Marketing and Freelancing.",
  chip: "HD 4K Preview",
  caption: "AI Production Pipeline · Overview",
  duration: 180,
  meta: "Audio ON · English & Urdu Subtitles",
  scrollCue: "Scroll when ready",
  // Set to a file in /public (e.g. "/trailer.mp4") once the trailer exists.
  videoSrc: null as string | null,
};

// Jobs the animated studio preview cycles through, one per skill area.
export const studioJobs: {
  track: Track;
  tool: string;
  prompt: string;
  outputs: string[];
  payout: number;
}[] = [
  {
    track: "Content",
    tool: "Canva + CapCut · Reel",
    prompt: "Write a 30-sec reel for a local café: hook, 4 shots, captions and a Canva cover.",
    outputs: ["Hook: “Your 3pm slump ends here.”", "4 shots cut in CapCut", "Captions + Canva cover ready"],
    payout: 120,
  },
  {
    track: "Marketing",
    tool: "SEO · Content Plan",
    prompt: "Build a 30-day SEO and social plan for a skincare brand targeting Lahore.",
    outputs: ["42 keywords clustered by intent", "12 blog briefs + 30 social posts", "Posting calendar exported"],
    payout: 250,
  },
  {
    track: "Web",
    tool: "Website · Clinic",
    prompt: "Build a 5-page website for a dental clinic with services, prices and an appointment form.",
    outputs: ["Layout and copy generated", "Booking form connected", "Live on the clinic's domain"],
    payout: 400,
  },
  {
    track: "Selling",
    tool: "Proposal · Pricing",
    prompt: "Write a proposal and 3-tier quote for a bakery that wants monthly social media content.",
    outputs: ["Proposal tailored to the brief", "Basic / Standard / Premium pricing", "Sent on Upwork, client replied"],
    payout: 180,
  },
];

export const marquee = [
  "Earn With AI",
  "Earn In Dollars",
  "In Pakistan",
  "AI Basics",
  "AI Graphic Design",
  "Canva + AI Images",
  "AI Video Editing & Filmmaking",
  "CapCut + Runway",
  "AI Web Development",
  "AI Digital Marketing",
  "Social, SEO & Ads",
  "Freelancing & Portfolio Building",
  "Fiverr & Upwork",
  "Client-Ready Skills",
  "Built From Zero",
  "Lifetime Access",
];

export const inside = {
  title: { count: 1200, suffix: "+", word: "Inside" },
  subtitle: "A real community, learning and earning together",
  badge: "School of Tomorrow Community",
  card: {
    title: "School of Tomorrow",
    body: "Private · members-only courses, live workshops and client vault",
    stats: [
      { value: "1,200+", label: "Members" },
      { value: "5 + 1", label: "Courses" },
      { value: "Lifetime", label: "Access" },
    ],
    priceLabel: "One-time entry",
    price: priceLabel,
    cta: { label: "Join now", href: "/enroll" },
  },
};

export const twoPaths = {
  title: ["Two", "Paths"],
  subtitle: "Choose the journey that fits your ambitions",
  slow: {
    label: "Path 01",
    title: "The slow way",
    points: [
      "Random free tutorials on YouTube",
      "Outdated tools, endless trial and error without guidance",
      "No clear plan to land clients or get paid",
      "Months wasted wondering why your results don't match the hype",
    ],
    outcome: "Average outcome: 6–12 months of frustration",
  },
  mapped: {
    label: "Path 02",
    badge: "Recommended",
    title: "The mapped way",
    points: [
      "6 step-by-step courses, from AI Basics to your first paid client",
      "Only tested tools, no subscription overload",
      "Pre-built prompt templates & workflows",
      "Outreach, pricing and getting paid in dollars from Pakistan",
      "Direct access to a community of 1,200+ peers",
    ],
    outcome: "Average outcome: first paid client within 90 days",
  },
};

export const brand = {
  name: "School of Tomorrow",
  short: "School of Tomorrow",
  // Copyright year. Static on purpose: the page is prerendered, so reading the clock here fails the build.
  year: 2026,
};

export const enroll = {
  title: { lead: "Ready to build your", highlight: "AI business?" },
  body: "Join 1,200+ students building, scaling, and earning in dollars today.",
  // Replace with the real checkout / payment link when it exists.
  cta: { label: "Get instant access", price: priceLabel, href: "/enroll" },
  note: ["Lifetime access", "No monthly subscription"],
};

// Answers marked TODO describe a policy only you can confirm. Check them before launch.
export const faq = [
  {
    q: "Do I need any experience?",
    a: "No. Every course starts from zero, with screen recordings and copy-paste prompts. If you can use a phone and a browser, you can follow along.",
  },
  {
    q: "Are the AI tools included?",
    a: "The courses teach free and free-tier tools first, so you can start without paying for subscriptions. Where a paid tool is worth it, we show you exactly when to upgrade and what it costs.",
  },
  {
    q: "Are the 90-day earnings realistic?",
    a: "They are possible, not guaranteed. Students who finish the courses, build a portfolio and do the outreach steps land clients fastest. Your results depend on the time and effort you put in.",
  },
  {
    q: `Why is it ${priceLabel}?`,
    a: `One payment covers all six courses for life. We keep it affordable for students in Pakistan, and a referral code brings it down to ${referralPriceLabel}.`,
  },
  {
    q: "Do I need to show my face?",
    a: "No. Many of the skills, like AI video, design, automation and stores, never need you on camera. Where a face helps, you learn to use AI avatars instead.",
  },
  {
    // TODO: confirm the bonus ebook's title and contents.
    q: "What's the free bonus ebook?",
    a: "Every member gets our AI starter ebook: the prompt library, client outreach scripts and pricing templates we use, ready to copy.",
  },
  {
    q: "How do I receive USD in Pakistan?",
    a: "We walk you through Payoneer, Wise and freelance platforms like Fiverr and Upwork, and how to withdraw dollars into a Pakistani bank account legally.",
  },
  {
    // TODO: confirm how and when access is delivered.
    q: "When do I get access after payment?",
    a: "Right away. Once your payment is confirmed you get your login and community invite, usually within minutes.",
  },
  {
    q: "Is there a refund policy?",
    a: "No. Payments are non-refundable once your account is approved and you have started watching the course videos. Ask us anything before you pay.",
  },
  {
    q: "How do referral codes work?",
    a: `Enter a referral code when you sign up and the price drops from ${priceLabel} to ${referralPriceLabel}. Each code has a limited number of uses and an expiry date.`,
  },
  {
    q: "Can I watch on my phone?",
    a: "Yes. Every lesson works on phone, tablet and laptop, and your progress syncs across devices.",
  },
];

// Links start with "/" so they work from every page; on the homepage Lenis
// still scrolls smoothly because the path matches.
export const footer = {
  links: [
    { label: "Courses", href: "/#courses" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export const nav = {
  links: [
    { label: "Curriculum", href: "/#courses" },
    { label: "Testimonials", href: "/testimonials" },
  ],
  cta: { label: "Enroll now", href: "/enroll" },
  account: { label: "Log in", href: "/login" },
};
