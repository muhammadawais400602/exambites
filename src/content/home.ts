// Homepage copy. Edit text here, not in components.

export const tracks = ["Creator", "Marketer", "Builder", "Commerce"] as const;
export type Track = (typeof tracks)[number];

export const hero = {
  headline: ["CRACK", "WITH", "AI"],
  tagline: {
    before: "turn ai skills into ",
    highlight: "real client income",
    after: ", from zero, in 90 days.",
  },
  students: "1,200+ students inside",
  price: "Rs. 4,800",
  priceNote: "(jumps to Rs. 9,999 soon)",
  cta: { label: "Enroll now", price: "Rs. 4,800", href: "#enroll" },
  scrollCue: { label: "Watch the trailer below", href: "#trailer" },
};

export const trailer = {
  eyebrow: "The 3 min breakdown",
  title: { lead: "See exactly how students go", from: "from ", highlight: "zero to AI income" },
  body: "A quick peek under the hood: the exact tools, prompt systems and client workflows taught across the Creator, Marketer, Builder and Commerce tracks.",
  chip: "HD 4K Preview",
  caption: "AI Production Pipeline · Overview",
  duration: 180,
  meta: "Audio ON · English & Urdu Subtitles",
  scrollCue: "Scroll when ready",
  // Set to a file in /public (e.g. "/trailer.mp4") once the trailer exists.
  videoSrc: null as string | null,
};

// Jobs the animated studio preview cycles through, one per track.
export const studioJobs: {
  track: Track;
  tool: string;
  prompt: string;
  outputs: string[];
  payout: number;
}[] = [
  {
    track: "Creator",
    tool: "Video · Script + Shots",
    prompt: "Write a 30-sec reel for a local café: hook, 4 shots, captions and a lo-fi music cue.",
    outputs: ["Hook: “Your 3pm slump ends here.”", "4-shot storyboard generated", "Captions + lo-fi track matched"],
    payout: 120,
  },
  {
    track: "Marketer",
    tool: "SEO · Content Plan",
    prompt: "Build a 30-day SEO and social plan for a skincare brand targeting Lahore.",
    outputs: ["42 keywords clustered by intent", "12 blog briefs + 30 social posts", "Posting calendar exported"],
    payout: 250,
  },
  {
    track: "Builder",
    tool: "Automation · Chatbot",
    prompt: "Create a WhatsApp chatbot that answers FAQs and books appointments for a clinic.",
    outputs: ["FAQ knowledge base trained", "Booking flow connected to calendar", "Deployed to WhatsApp Business"],
    payout: 400,
  },
  {
    track: "Commerce",
    tool: "Store · Product Shots",
    prompt: "Turn 6 phone photos into studio product shots and write listings for a dropshipping store.",
    outputs: ["6 studio shots, white + lifestyle", "SEO product titles and descriptions", "Store page published"],
    payout: 180,
  },
];

export const marquee = [
  "Earn With AI",
  "Earn In Dollars",
  "In Pakistan",
  "AI Content Creation",
  "Video & Film",
  "Graphics & Music",
  "Social & Ads",
  "SEO & Content",
  "Web & App Building",
  "Chatbots & Automation",
  "AI Stores",
  "Product Shots",
  "AI Dropshipping",
  "Client-Ready Skills",
  "Built From Zero",
  "Lifetime Access",
  "Creator • Marketer • Builder • Commerce",
];

export const inside = {
  title: { count: 1200, suffix: "+", word: "Inside" },
  subtitle: "A real community, learning and earning together",
  badge: "Exambites Community",
  card: {
    title: "Exambites AI Academy",
    body: "Private · members-only courses, live workshops and client vault",
    stats: [
      { value: "1,200+", label: "Members" },
      { value: "19", label: "Courses" },
      { value: "Lifetime", label: "Access" },
    ],
    priceLabel: "One-time entry",
    price: "Rs. 4,800",
    cta: { label: "Join now", href: "#enroll" },
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
      "19 step-by-step courses across 4 tracks",
      "Only tested tools, no subscription overload",
      "Pre-built prompt templates & workflows",
      "Outreach, pricing and getting paid in dollars from Pakistan",
      "Direct access to a community of 1,200+ peers",
    ],
    outcome: "Average outcome: first paid client within 90 days",
  },
};
