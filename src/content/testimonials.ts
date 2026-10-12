// Testimonials page copy. Every story below is a DEMO placeholder: replace
// with real students' words (and their permission) before launch.
import type { Track } from "./home";

export const testimonialsPage = {
  eyebrow: "Proof of results · Student wall",
  title: { lead: "Real students.", highlight: "Real dollar income." },
  body: "Video stories, community posts and written reviews from Exambites students across Pakistan, learning AI skills and getting paid by clients at home and abroad.",
  stats: [
    { value: "1,200+", label: "Students", note: "Learning inside the academy" },
    { value: "4", label: "Video stories", note: "Recorded with students" },
    { value: "31+", label: "Community posts", note: "Shared wins this month" },
    { value: "$300–$1.2k", label: "Retainers", note: "Range reported by students" },
  ],
};

export type VideoStory = {
  name: string;
  initials: string;
  place: string;
  track: Track;
  quote: string;
  result: string;
  duration: string;
  /** Optional file in /public, e.g. "/stories/ashar.mp4". */
  videoSrc?: string;
};

export const videoSection = {
  eyebrow: "Video stories",
  title: { lead: "Hear it from", highlight: "the students" },
  body: "Recorded conversations with students who went from zero to paid client work in dollars.",
  hint: "Tap a story to play",
};

export const videoStories: VideoStory[] = [
  {
    name: "Ashar Khan",
    initials: "AK",
    place: "Lahore",
    track: "Builder",
    quote: "Closed my first international client three weeks after finishing the AI Automation course.",
    result: "First US client in 3 weeks",
    duration: "2:41",
  },
  {
    name: "Danish Bhatti",
    initials: "DB",
    place: "Faisalabad",
    track: "Marketer",
    quote: "I had zero technical knowledge. Now I run a stable SEO retainer that pays $1,200 a month.",
    result: "$1,200/mo SEO retainer",
    duration: "3:05",
  },
  {
    name: "Saad Butt",
    initials: "SB",
    place: "Karachi",
    track: "Commerce",
    quote: "AI product shots and ads for stores in the UK and Gulf. No studio, no camera, just a laptop.",
    result: "4 global store clients",
    duration: "2:18",
  },
  {
    name: "Waleed Ahmed",
    initials: "WA",
    place: "Islamabad",
    track: "Creator",
    quote: "My whole video studio is AI now. It replaced equipment I could never have afforded.",
    result: "AI video studio from home",
    duration: "3:32",
  },
];

export const midCta = {
  eyebrow: "Your turn",
  title: "Get the same results in 90 days.",
  body: "Follow the same courses, use the same templates and join the same community these students did.",
  primary: { label: "Enroll now · Rs. 4,800", href: "/#enroll" },
  secondary: { label: "See community posts", href: "#posts" },
};

export const postsSection = {
  eyebrow: "Community posts",
  title: "Live wins",
  body: "Unfiltered posts from inside the community: client wins, project feedback and questions, shared as they happen.",
  cta: { label: "Join the community", href: "/#enroll" },
};

export type Review = {
  name: string;
  initials: string;
  place: string;
  track: Track;
  badge: string;
  text: string;
};

export const reviewsSection = {
  eyebrow: "Written reviews",
  title: { lead: "In their", highlight: "own words" },
  body: "Short reviews in Roman Urdu and English, sent in by students after landing paid work.",
};

export const reviews: Review[] = [
  {
    name: "Ahmed",
    initials: "A",
    place: "Lahore, Punjab",
    track: "Builder",
    badge: "$1,200 retainer",
    text: "Pehle sochta tha AI sirf time pass hai. Ab har mahine $1,200 ka retainer chal raha hai, Pakistan se baith ke!",
  },
  {
    name: "Usman",
    initials: "U",
    place: "Islamabad",
    track: "Creator",
    badge: "$1,800 → $2,400",
    text: "Retainer client mil gaya. Teen mahine mein $2,400 monthly ho gaya. Course ne sab kuch clear kar diya.",
  },
  {
    name: "Sana",
    initials: "S",
    place: "Karachi, Sindh",
    track: "Commerce",
    badge: "$650 package",
    text: "Product photography wala course game changer tha. Pehla package $650 ka bika. Koi camera nahi, sirf AI!",
  },
  {
    name: "Bilal",
    initials: "B",
    place: "Faisalabad, Punjab",
    track: "Marketer",
    badge: "$900 closed",
    text: "UGC ads seekhne se pehle international client nahi milta tha. Ab $900 ka deal close kiya. Confidence aa gaya.",
  },
  {
    name: "Hira",
    initials: "H",
    place: "Rawalpindi, Punjab",
    track: "Creator",
    badge: "$1,100 / mo",
    text: "Faceless YouTube channel ab $1,100 monthly de raha hai. Ghar baithe kaam, Alhamdulillah.",
  },
  {
    name: "Zain",
    initials: "Z",
    place: "Multan, Punjab",
    track: "Builder",
    badge: "$500 chatbot",
    text: "My first chatbot was for a clinic and they paid $500. I didn't know any code when I started the course.",
  },
  {
    name: "Maryam",
    initials: "M",
    place: "Lahore, Punjab",
    track: "Marketer",
    badge: "$1,400 / mo",
    text: "Do clients ka SEO retainer chal raha hai. Course ki outreach scripts seedhi copy ki aur kaam kar gayin.",
  },
  {
    name: "Hamza",
    initials: "H",
    place: "Peshawar, KP",
    track: "Creator",
    badge: "$700 sponsor",
    text: "First sponsor on my AI video channel paid $700. Editing takes minutes now instead of hours.",
  },
  {
    name: "Areeba",
    initials: "A",
    place: "Karachi, Sindh",
    track: "Commerce",
    badge: "$300 → $1,200",
    text: "Dropshipping store ne pehle mahine $300 profit diya, doosre mahine $1,200 ki sales. Shukriya Exambites!",
  },
];

export const finalCta = {
  eyebrow: "Your story is next",
  title: "Your win could be on this wall next.",
  body: "Join 1,200+ students at the Rs. 4,800 launch price, before it moves to Rs. 9,999.",
  cta: { label: "Get instant access · Rs. 4,800", href: "/#enroll" },
  // TODO: the refund line must match your real policy (see the FAQ draft).
  notes: ["Instant course access", "Private community", "7-day refund"],
};
