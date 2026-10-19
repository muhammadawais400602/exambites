// Course catalogue: the homepage stack and the enroll syllabus read from here.
import { Brain, Briefcase, Clapperboard, Globe, type LucideIcon, Palette, Target } from "lucide-react";

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
  title: { lead: "Six courses.", highlight: "One AI career." },
  scrollCue: "Scroll to advance",
};

/** In teaching order: students take them one at a time, top to bottom. */
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
    title: "AI Graphic Design",
    category: "Design",
    body: "Design social posts, carousels, thumbnails, logos and brand kits in Canva and AI image tools, and learn the design basics clients pay for.",
    tag: "Design that sells",
    weeks: 4,
    tools: ["Canva", "Midjourney", "Adobe Firefly"],
    Icon: Palette,
  },
  {
    title: "AI Video Editing & Filmmaking",
    category: "Video",
    body: "Edit reels and shorts in CapCut, then make short films and ads with AI: consistent characters, cinematic shots, voiceover and lip-synced dialogue.",
    tag: "Reels to films",
    weeks: 4,
    tools: ["CapCut", "Runway", "ElevenLabs"],
    Icon: Clapperboard,
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
    title: "AI Digital Marketing",
    category: "Marketing",
    body: "Run social media, SEO and paid ads on Meta and Google for real businesses. Plan content, read the numbers and report results clients understand.",
    tag: "Growth & ads",
    weeks: 4,
    tools: ["Meta Ads", "Google Ads", "Search Console"],
    Icon: Target,
  },
  {
    title: "Freelancing & Portfolio Building",
    category: "Freelancing",
    body: "Turn your course projects into a portfolio, set up Fiverr, Upwork and LinkedIn, pitch and price your work, keep clients happy and get paid in dollars.",
    tag: "Land the client",
    weeks: 3,
    tools: ["Fiverr", "Upwork", "Behance"],
    Icon: Briefcase,
  },
];

/**
 * Old course slugs and the course they became when the list changed to the
 * six above (the database rows are renamed, so lessons and progress stay).
 */
export const renamedCourses: Record<string, string> = {
  "ai-content-creation": "ai-graphic-design",
  "ai-filmmaking": "ai-video-editing-and-filmmaking",
  "selling-and-client-communication": "freelancing-and-portfolio-building",
};
