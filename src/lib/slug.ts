/** URL-safe slug from a title, e.g. "Selling & Client Communication" → "selling-and-client-communication". */
export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
