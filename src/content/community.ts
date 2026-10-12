// Community section copy and demo posts. Replace with real posts later.
import type { Track } from "./home";

export const communitySection = {
  eyebrow: "See what's happening",
  title: "Community",
  body: "Inside students share wins, trade high-value prompts, and review client briefs every single day.",
  cta: { label: "Join the community", href: "/enroll" },
};

export type PostMedia =
  | { kind: "video"; caption: string; duration: string }
  | { kind: "payout"; amount: string; from: string; via: string }
  | { kind: "image"; caption: string };

export type Post = {
  name: string;
  initials: string;
  pro?: boolean;
  ago: string;
  channel: "Show Your Work" | "Wins" | "Questions" | "Prompt Vault";
  track: Track;
  title: string;
  body: string;
  media?: PostMedia;
  likes: number;
  comments: number;
};

export const posts: Post[] = [
  {
    name: "Sadia Yasir",
    initials: "SY",
    pro: true,
    ago: "3d ago",
    channel: "Show Your Work",
    track: "Creator",
    title: "My first AI video ad. Need feedback on pacing and the hook.",
    body: "Project #1 from the AI Video Creation course.",
    media: { kind: "video", caption: "Café reel · 30 sec", duration: "0:30" },
    likes: 24,
    comments: 9,
  },
  {
    name: "Hamza Ali",
    initials: "HA",
    ago: "5h ago",
    channel: "Wins",
    track: "Builder",
    title: "Closed my first chatbot client. A dental clinic in Lahore!",
    body: "WhatsApp booking bot from the AI Chatbots course. They want a second one for their other branch.",
    media: { kind: "payout", amount: "$350", from: "Smile Dental Clinic", via: "Payoneer" },
    likes: 88,
    comments: 21,
  },
  {
    name: "Zainab Qureshi",
    initials: "ZQ",
    pro: true,
    ago: "1d ago",
    channel: "Show Your Work",
    track: "Commerce",
    title: "Phone photos → studio product shots. Before and after.",
    body: "Shot on my phone at home, finished with the AI Product Shots workflow.",
    media: { kind: "image", caption: "Skincare set · white + lifestyle" },
    likes: 57,
    comments: 14,
  },
  {
    name: "Bilal Mehmood",
    initials: "BM",
    ago: "2d ago",
    channel: "Questions",
    track: "Marketer",
    title: "How do you price a monthly SEO retainer for a local business?",
    body: "Client is a furniture shop in Karachi. Thinking $150/month for 8 blog posts and on-page fixes. Too low?",
    likes: 19,
    comments: 32,
  },
  {
    name: "Ayesha Raza",
    initials: "AR",
    ago: "8h ago",
    channel: "Wins",
    track: "Creator",
    title: "First Fiverr order for AI logo design, 5 stars!",
    body: "Three concepts in Midjourney, refined in Canva, delivered in 24 hours.",
    media: { kind: "payout", amount: "$85", from: "Fiverr order #FO7821", via: "Fiverr" },
    likes: 64,
    comments: 12,
  },
  {
    name: "Usman Tariq",
    initials: "UT",
    pro: true,
    ago: "4d ago",
    channel: "Prompt Vault",
    track: "Marketer",
    title: "My prompt for 30 days of posts in one go. Steal it.",
    body: "Brand voice + audience + offer → full calendar with hooks and captions. Template in the comments.",
    likes: 142,
    comments: 47,
  },
  {
    name: "Mahnoor Khan",
    initials: "MK",
    ago: "6h ago",
    channel: "Show Your Work",
    track: "Builder",
    title: "Built a full booking website for a salon in one weekend.",
    body: "Framer + an n8n automation that sends WhatsApp reminders. Feedback welcome!",
    media: { kind: "video", caption: "Salon site walkthrough", duration: "1:12" },
    likes: 41,
    comments: 11,
  },
  {
    name: "Ali Hassan",
    initials: "AH",
    ago: "1d ago",
    channel: "Wins",
    track: "Commerce",
    title: "Dropshipping store hit its first $1,000 week.",
    body: "Found the product with AI research, ads made with AI video. Week 6 of the course.",
    media: { kind: "payout", amount: "$1,040", from: "Shopify payouts · 7 days", via: "Shopify" },
    likes: 203,
    comments: 58,
  },
  {
    name: "Fatima Noor",
    initials: "FN",
    pro: true,
    ago: "2d ago",
    channel: "Show Your Work",
    track: "Creator",
    title: "Made a 20-second jingle for a chai brand with Suno.",
    body: "Client loved it and asked for an Urdu version too.",
    media: { kind: "video", caption: "Chai jingle · Urdu + English", duration: "0:20" },
    likes: 37,
    comments: 8,
  },
  {
    name: "Saad Ahmed",
    initials: "SA",
    ago: "12h ago",
    channel: "Questions",
    track: "Builder",
    title: "n8n or Make for a client who needs lead follow-ups?",
    body: "Leads come from a Meta form, need to land in Sheets and get a WhatsApp message within 5 minutes.",
    likes: 15,
    comments: 26,
  },
  {
    name: "Hira Shah",
    initials: "HS",
    ago: "3d ago",
    channel: "Wins",
    track: "Marketer",
    title: "Signed a $400/month social media retainer!",
    body: "Pitched with a free 7-day content plan made in the Social Media Marketing course. They said yes on the call.",
    media: { kind: "payout", amount: "$400/mo", from: "Bloom Boutique", via: "Wise" },
    likes: 96,
    comments: 23,
  },
  {
    name: "Talha Iqbal",
    initials: "TI",
    pro: true,
    ago: "5d ago",
    channel: "Show Your Work",
    track: "Creator",
    title: "Short film trailer made entirely with AI. 3 weeks of work.",
    body: "Consistent characters were the hardest part. The AI Filmmaking lessons on seeds saved me.",
    media: { kind: "image", caption: "“Last Train to Murree” · poster" },
    likes: 118,
    comments: 34,
  },
];
