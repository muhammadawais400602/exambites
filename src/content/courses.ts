// Course catalogue shown in the homepage "Courses" stack. Edit here.
import {
  AppWindow,
  Bot,
  Camera,
  Clapperboard,
  Code,
  Film,
  Globe,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Music,
  Palette,
  PenLine,
  Search,
  Smartphone,
  Store,
  Target,
  TrendingUp,
  Truck,
  Workflow,
} from "lucide-react";
import type { Track } from "./home";

export type Course = {
  track: Track;
  title: string;
  body: string;
  /** Short label shown on the visual, like the reference's image captions. */
  tag: string;
  weeks: number;
  tools: string[];
  Icon: LucideIcon;
  /** Optional photo in /public, e.g. "/courses/ai-video.jpg". Falls back to the icon visual. */
  image?: string;
};

export const coursesSection = {
  eyebrow: "The Courses",
  title: { lead: "Nineteen courses.", highlight: "One AI career." },
  scrollCue: "Scroll to advance",
};

export const courses: Course[] = [
  // Creator
  {
    track: "Creator",
    title: "Social Media Content",
    body: "Plan, script and batch a month of posts, reels and carousels in one sitting. Hooks, captions and posting rhythms that grow real accounts.",
    tag: "Content engine",
    weeks: 3,
    tools: ["ChatGPT", "Canva", "CapCut"],
    Icon: Smartphone,
  },
  {
    track: "Creator",
    title: "AI Video Creation",
    body: "Turn a script into a finished video with AI scenes, voiceover and captions. Ads, explainers and shorts that clients pay for.",
    tag: "Text to video",
    weeks: 4,
    tools: ["Runway", "Kling", "ElevenLabs"],
    Icon: Clapperboard,
  },
  {
    track: "Creator",
    title: "AI Graphic Design",
    body: "Logos, brand kits, posters and thumbnails from prompts, then polished by hand. Build a portfolio that wins your first design gigs.",
    tag: "Brand studio",
    weeks: 3,
    tools: ["Midjourney", "Firefly", "Canva"],
    Icon: Palette,
  },
  {
    track: "Creator",
    title: "AI Music Production",
    body: "Compose jingles, background tracks and full songs with AI, then mix and master them for ads, reels and podcasts.",
    tag: "Sound lab",
    weeks: 3,
    tools: ["Suno", "Udio", "BandLab"],
    Icon: Music,
  },
  {
    track: "Creator",
    title: "AI Filmmaking",
    body: "Consistent characters, cinematic camera moves and lip-synced dialogue. Direct a short film or commercial from a single idea.",
    tag: "Cinematic AI",
    weeks: 5,
    tools: ["Midjourney", "Runway", "Hedra"],
    Icon: Film,
  },
  // Marketer
  {
    track: "Marketer",
    title: "Digital Marketing",
    body: "Funnels, offers and paid ads on Meta, TikTok and Google. Read the numbers, cut waste and scale what works for real clients.",
    tag: "Growth funnels",
    weeks: 4,
    tools: ["Meta Ads", "Google Ads", "GA4"],
    Icon: Target,
  },
  {
    track: "Marketer",
    title: "SEO With AI",
    body: "Keyword research, topic clusters and on-page fixes in hours, not weeks. Rank local businesses and sell monthly SEO retainers.",
    tag: "Search rankings",
    weeks: 4,
    tools: ["Semrush", "Search Console", "Claude"],
    Icon: Search,
  },
  {
    track: "Marketer",
    title: "Content Writing",
    body: "Blogs, emails, landing pages and scripts that sound human and convert. Prompt systems that keep a brand's voice on every piece.",
    tag: "Copy that sells",
    weeks: 3,
    tools: ["Claude", "ChatGPT", "Grammarly"],
    Icon: PenLine,
  },
  {
    track: "Marketer",
    title: "Social Media Marketing",
    body: "Run brand accounts end to end: strategy, calendars, community, influencer deals and monthly reports clients actually read.",
    tag: "Brand growth",
    weeks: 3,
    tools: ["Meta Suite", "Buffer", "Notion"],
    Icon: Megaphone,
  },
  // Builder
  {
    track: "Builder",
    title: "Web Development",
    body: "Ship fast, good-looking websites for businesses using AI-assisted design and no-code builders. Hosting, domains and handover included.",
    tag: "Sites that sell",
    weeks: 4,
    tools: ["Framer", "WordPress", "v0"],
    Icon: Globe,
  },
  {
    track: "Builder",
    title: "App Development",
    body: "Build working mobile and web apps with AI app builders: logins, databases and payments, without years of coding first.",
    tag: "Idea to app",
    weeks: 5,
    tools: ["Lovable", "FlutterFlow", "Supabase"],
    Icon: AppWindow,
  },
  {
    track: "Builder",
    title: "AI Automation",
    body: "Connect apps so leads, invoices and follow-ups run on their own. Sell automations that save businesses hours every week.",
    tag: "Workflows on autopilot",
    weeks: 4,
    tools: ["n8n", "Make", "Zapier"],
    Icon: Workflow,
  },
  {
    track: "Builder",
    title: "AI Chatbots",
    body: "Train chatbots on a business's own data for WhatsApp, Instagram and websites. Support, sales and bookings handled 24/7.",
    tag: "Bots that book",
    weeks: 3,
    tools: ["Voiceflow", "OpenAI API", "WhatsApp API"],
    Icon: Bot,
  },
  {
    track: "Builder",
    title: "AI Coding",
    body: "Write real code with an AI pair programmer. JavaScript, Python and APIs from scratch, so you can build anything the no-code tools can't.",
    tag: "Code with AI",
    weeks: 6,
    tools: ["Cursor", "Claude Code", "GitHub"],
    Icon: Code,
  },
  // Commerce
  {
    track: "Commerce",
    title: "Online Store Setup",
    body: "Launch a branded store on Shopify or Daraz in a weekend: theme, products, payments and delivery set up for Pakistan and abroad.",
    tag: "Store launch",
    weeks: 2,
    tools: ["Shopify", "Daraz", "Payoneer"],
    Icon: Store,
  },
  {
    track: "Commerce",
    title: "E-commerce Marketing",
    body: "Product ads, email flows and influencer campaigns that turn visitors into buyers. Lift conversion and average order value.",
    tag: "Sales growth",
    weeks: 3,
    tools: ["Meta Ads", "Klaviyo", "TikTok Shop"],
    Icon: TrendingUp,
  },
  {
    track: "Commerce",
    title: "Store Management",
    body: "Inventory, orders, returns and customer service on autopilot with AI. Run a store, or manage stores for clients, in a few hours a day.",
    tag: "Operations",
    weeks: 3,
    tools: ["Shopify", "Gorgias", "Sheets"],
    Icon: LayoutDashboard,
  },
  {
    track: "Commerce",
    title: "AI Product Shots",
    body: "Turn phone photos into studio-quality product images and lifestyle scenes. No studio, no photographer, ready for any listing.",
    tag: "Studio quality",
    weeks: 2,
    tools: ["Photoroom", "Flair", "Firefly"],
    Icon: Camera,
  },
  {
    track: "Commerce",
    title: "AI Dropshipping",
    body: "Find winning products, build the store and run the ads, with AI doing the research. Sell worldwide without holding stock.",
    tag: "Sell worldwide",
    weeks: 4,
    tools: ["AutoDS", "Shopify", "Minea"],
    Icon: Truck,
  },
];
