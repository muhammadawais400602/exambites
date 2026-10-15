// One place for the price. Server code charges these amounts; the website
// copy reads the labels, so changing a number here updates both.
export const PRICE = 7000;
export const REFERRAL_PRICE = 5000;

export const formatRs = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

export const priceLabel = formatRs(PRICE);
export const referralPriceLabel = formatRs(REFERRAL_PRICE);
