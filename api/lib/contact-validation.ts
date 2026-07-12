/**
 * Server-side validation for the contact form.
 *
 * Returns a normalised payload on success, or a list of error codes on failure.
 * Error codes are intentionally generic — the form shows a single user-facing
 * message, not field-level errors, so spammers can't probe the validator.
 */

const ALLOWED_TOWNS = new Set([
  'Aquinnah',
  'Chilmark',
  'Edgartown',
  'Oak Bluffs',
  'Vineyard Haven',
  'West Tisbury',
  'Other / Not sure',
]);

const ALLOWED_PROJECT_TYPES = new Set([
  'Apple Repair & Support',
  'Wi-Fi & Network Installation',
  'Smart Home & Sonos',
  'TV, Audio & Home Tech',
  'Business IT Support',
  '3D Printing & Custom Fabrication',
  'Something else / not sure',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose phone matcher: 7-20 chars, mostly digits/spaces/punctuation
const PHONE_RE = /^[\d+()\-.\s]{7,20}$/;

export type ContactInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  town?: unknown;
  project_type?: unknown;
  message?: unknown;
};

export type CleanContact = {
  name: string;
  email: string;
  phone: string | null;
  town: string | null;
  project_type: string;
  message: string;
};

export function validateContact(raw: ContactInput): {
  ok: true; clean: CleanContact;
} | {
  ok: false; errors: string[];
} {
  const errors: string[] = [];
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  const name = s(raw.name);
  const email = s(raw.email).toLowerCase();
  const phone = s(raw.phone);
  const town = s(raw.town);
  const project_type = s(raw.project_type);
  const message = s(raw.message);

  if (name.length < 2)               errors.push('name_too_short');
  if (name.length > 120)             errors.push('name_too_long');
  if (!EMAIL_RE.test(email))         errors.push('email_invalid');
  if (email.length > 200)            errors.push('email_too_long');
  if (phone && !PHONE_RE.test(phone)) errors.push('phone_invalid');
  if (town && !ALLOWED_TOWNS.has(town)) errors.push('town_invalid');
  if (project_type && !ALLOWED_PROJECT_TYPES.has(project_type)) errors.push('project_type_invalid');
  if (message.length < 15)           errors.push('message_too_short');
  if (message.length > 5000)         errors.push('message_too_long');

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    clean: {
      name,
      email,
      phone: phone || null,
      town: town || null,
      project_type: project_type || 'Something else / not sure',
      message,
    },
  };
}

// ----------------------------------------------------------------------------
// Spam scoring
// ----------------------------------------------------------------------------

/**
 * Heuristic spam score 0..100. Block at >= 60.
 *
 * Conservative on legitimate signals (long messages, business names, capital
 * letters) and weighted toward bot-shape heuristics (gibberish, identical-fill
 * patterns, no-vowel strings, link spam).
 */
export function spamScore(input: {
  clean: CleanContact;
  honeypotFilled: boolean;
  tooFast: boolean;
  townInvalid: boolean;
}): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (input.honeypotFilled) { score += 80; reasons.push('honeypot'); }
  if (input.tooFast)        { score += 50; reasons.push('too_fast'); }
  if (input.townInvalid)    { score += 15; reasons.push('town_invalid'); }

  const nameLooksGibberish    = looksGibberish(input.clean.name);
  const messageLooksGibberish = looksGibberish(input.clean.message);
  if (nameLooksGibberish && messageLooksGibberish) {
    score += 40;
    reasons.push('gibberish_name_and_message');
  }

  // Link-stuffed messages
  const linkCount = (input.clean.message.match(/https?:\/\//gi) || []).length;
  if (linkCount >= 3) { score += 25; reasons.push('many_links'); }
  else if (linkCount >= 5) { score += 50; reasons.push('link_stuffing'); }

  // Common spam keywords (cheap, additive only — no false positive triggers
  // for plumbers, electricians, or legitimate businesses)
  if (/\b(viagra|crypto|forex|seo services|backlinks|guest post)\b/i.test(input.clean.message)) {
    score += 30;
    reasons.push('spam_keywords');
  }

  // Cyrillic / non-Latin in a service area where ~all customers write English
  if (/[Ѐ-ӿ]/.test(input.clean.name + input.clean.message)) {
    score += 25;
    reasons.push('non_latin_script');
  }

  return { score, reasons };
}

function looksGibberish(s: string): boolean {
  if (!s) return true;
  const lower = s.toLowerCase();
  // No vowels at all in a 6+ char string → almost certainly random
  if (lower.length >= 6 && !/[aeiouy]/.test(lower)) return true;
  // 5+ consonants in a row → very rare in English/Portuguese (the common
  // languages on Martha's Vineyard)
  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(lower)) return true;
  // Mostly numbers/symbols
  const letters = (lower.match(/[a-z]/g) || []).length;
  const total = lower.length;
  if (total > 4 && letters / total < 0.4) return true;
  return false;
}
