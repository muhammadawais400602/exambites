// Shared by the seat form (client) and /api/enroll (server), so both enforce
// the same rules. Keep this file free of React and Node-only imports.
import { type PaymentMethod, paymentMethods, sources } from "@/content/enroll";

export type SignupFields = {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode: string;
  source: string;
  method: PaymentMethod | "";
};

export type SignupErrors = Partial<Record<keyof SignupFields, string>>;

export const EMPTY_SIGNUP: SignupFields = {
  name: "",
  email: "",
  phone: "",
  password: "",
  referralCode: "",
  source: "",
  method: "",
};

/** Digits only, without a leading 0 or the 92 country code. */
export function normalisePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("92")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

export function validateSignup(f: SignupFields): SignupErrors {
  const e: SignupErrors = {};
  const name = f.name.trim();
  if (name.length < 2 || name.length > 80) e.name = "Enter your full name.";
  const email = f.email.trim();
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
  // Pakistani mobile: 3XX XXXXXXX.
  if (!/^3\d{9}$/.test(normalisePhone(f.phone))) e.phone = "Enter a 10-digit mobile number starting with 3.";
  if (f.password.length < 8) e.password = "Use at least 8 characters.";
  else if (f.password.length > 128) e.password = "Use at most 128 characters.";
  if (f.referralCode.trim().length > 40) e.referralCode = "That code is too long.";
  if (!sources.includes(f.source)) e.source = "Pick one option.";
  if (!paymentMethods.includes(f.method as PaymentMethod)) e.method = "Choose how you'll pay.";
  return e;
}

/** What the API returns to the form. */
export type SignupResponse =
  | { ok: true; reference: string; amount: number }
  | { ok: false; error: string; fields?: SignupErrors };
