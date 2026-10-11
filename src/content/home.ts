// Homepage copy. Edit text here, not in components.

export const tracks = ["Creator", "Marketer", "Builder", "Commerce"] as const;
export type Track = (typeof tracks)[number];

export const hero = {
  headline: ["EARN", "WITH", "AI"],
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
