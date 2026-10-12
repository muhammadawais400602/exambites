// Course catalogue: the homepage stack and the enroll syllabus read from here.
import { Brain, Clapperboard, Film, Globe, Handshake, type LucideIcon, Target } from "lucide-react";

export type Course = {
  title: string;
  /** Short subject label shown on the card, e.g. "Foundation". */
  category: string;
  body: string;
  /** Short label shown on the visual, like the reference's image captions. */
  tag: string;
  weeks: number;
  tools: string[];
  Icon: LucideIcon;
  /** Extra course included at no cost. */
  bonus?: boolean;
  /** Optional photo in /public, e.g. "/courses/ai-basics.jpg". Falls back to the icon visual. */
  image?: string;
};

export const coursesSection = {
  eyebrow: "The Courses",
  title: { lead: "Five courses + a bonus.", highlight: "One AI career." },
  scrollCue: "Scroll to advance",
};

export const courses: Course[] = [
  {
    title: "AI Basics",
    category: "Foundation",
    body: "Start from zero: how AI tools work, which ones to use, and how to write prompts that get useful results the first time.",
    tag: "Start here",
    weeks: 2,
    tools: ["ChatGPT", "Claude", "Gemini"],
    Icon: Brain,
  },
  {
    title: "AI Content Creation",
    category: "Canva + CapCut",
    body: "Design posts, carousels and thumbnails in Canva and edit reels and shorts in CapCut, with AI doing the heavy lifting on ideas, scripts and captions.",
    tag: "Content engine",
    weeks: 4,
    tools: ["Canva", "CapCut", "ChatGPT"],
    Icon: Clapperboard,
  },
  {
    title: "AI Digital Marketing",
    category: "Marketing",
    body: "Run social media, SEO and paid ads on Meta and Google for real businesses. Plan content, read the numbers and report results clients understand.",
    tag: "Growth & ads",
    weeks: 4,
    tools: ["Meta Ads", "Google Ads", "Search Console"],
    Icon: Target,
  },
  {
    title: "AI Web Development",
    category: "Websites",
    body: "Build fast, good-looking websites for businesses with AI-assisted design and no-code builders, from first layout to domain and handover.",
    tag: "Sites that sell",
    weeks: 4,
    tools: ["Framer", "WordPress", "v0"],
    Icon: Globe,
  },
  {
    title: "Selling & Client Communication",
    category: "Freelancing",
    body: "Find clients, pitch with confidence, price your work, write proposals and keep clients happy. Includes Fiverr, Upwork and getting paid in dollars.",
    tag: "Land the client",
    weeks: 3,
    tools: ["Fiverr", "Upwork", "LinkedIn"],
    Icon: Handshake,
  },
  {
    title: "AI Filmmaking",
    category: "Bonus course",
    body: "Turn one idea into a short film or ad: consistent characters, cinematic shots, voiceover and lip-synced dialogue, all made with AI.",
    tag: "Cinematic AI",
    weeks: 3,
    tools: ["Runway", "Kling", "ElevenLabs"],
    Icon: Film,
    bonus: true,
  },
];
