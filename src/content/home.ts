// Homepage copy. Edit text here, not in components.

export const hero = {
  headline: ["CRACK", "WITH", "AI"],
  tagline: {
    before: "turn ai study into a ",
    highlight: "top 1% rank",
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
  title: { lead: "See exactly how students go", from: "from ", highlight: "zero to top 1% rank" },
  body: "A quick peek under the hood: the exact study framework, prompt architecture, and synthetic examiner workflows taught inside the academy.",
  chip: "HD 4K Preview",
  caption: "Synthetic Examiner Engine · Overview",
  duration: 180,
  meta: "Audio ON · English & Urdu Subtitles",
  scrollCue: "Scroll when ready",
  // Set to a file in /public (e.g. "/trailer.mp4") once the trailer exists.
  videoSrc: null as string | null,
};
