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
    track: "Content",
    title: "My first AI video ad. Need feedback on pacing and the hook.",
    body: "Project #1 from the AI Content Creation course, edited in CapCut.",
    media: { kind: "video", caption: "Café reel · 30 sec", duration: "0:30" },
    likes: 24,
    comments: 9,
  },
  {
    name: "Hamza Ali",
    initials: "HA",
    ago: "5h ago",
    channel: "Wins",
    track: "Web",
    title: "Closed my first website client. A dental clinic in Lahore!",
    body: "Booking website from the AI Web Development course. They want a second one for their other branch.",
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
    track: "Content",
    title: "Canva carousel for a skincare brand. Before and after.",
    body: "Their old posts vs. the set I made in the AI Content Creation course.",
    media: { kind: "image", caption: "Skincare carousel · 8 slides" },
    likes: 57,
    comments: 14,
  },
  {
    name: "Bilal Mehmood",
    initials: "BM",
    ago: "2d ago",
    channel: "Questions",
    track: "Selling",
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
    track: "Content",
    title: "First Fiverr order for AI logo design, 5 stars!",
    body: "Three concepts with AI, refined in Canva, delivered in 24 hours.",
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
    track: "Marketing",
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
    track: "Web",
    title: "Built a full booking website for a salon in one weekend.",
    body: "Built in Framer in the AI Web Development course. Feedback welcome!",
    media: { kind: "video", caption: "Salon site walkthrough", duration: "1:12" },
    likes: 41,
    comments: 11,
  },
  {
    name: "Ali Hassan",
    initials: "AH",
    ago: "1d ago",
    channel: "Wins",
    track: "Selling",
    title: "Three Upwork clients in one week. $1,040 total!",
    body: "Used the proposal templates from the Selling & Client Communication course on every pitch.",
    media: { kind: "payout", amount: "$1,040", from: "Upwork · 3 contracts", via: "Upwork" },
    likes: 203,
    comments: 58,
  },
  {
    name: "Fatima Noor",
    initials: "FN",
    pro: true,
    ago: "2d ago",
    channel: "Show Your Work",
    track: "Content",
    title: "Made a 20-second reel for a chai brand in CapCut.",
    body: "Client loved it and asked for an Urdu version too.",
    media: { kind: "video", caption: "Chai reel · Urdu + English", duration: "0:20" },
    likes: 37,
    comments: 8,
  },
  {
    name: "Saad Ahmed",
    initials: "SA",
    ago: "12h ago",
    channel: "Questions",
    track: "Web",
    title: "Framer or WordPress for a client who needs online bookings?",
    body: "Small salon, wants to take bookings and edit prices themselves. Which would you pick?",
    likes: 15,
    comments: 26,
  },
  {
    name: "Hira Shah",
    initials: "HS",
    ago: "3d ago",
    channel: "Wins",
    track: "Marketing",
    title: "Signed a $400/month social media retainer!",
    body: "Pitched with a free 7-day content plan made in the AI Digital Marketing course. They said yes on the call.",
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
    track: "Content",
    title: "Short film trailer made entirely with AI. 3 weeks of work.",
    body: "Consistent characters were the hardest part. The bonus AI Filmmaking course saved me.",
    media: { kind: "image", caption: "“Last Train to Murree” · poster" },
    likes: 118,
    comments: 34,
  },
];
