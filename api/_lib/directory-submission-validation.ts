/**
 * Server-side validation for the business-directory submission form.
 *
 * Mirrors contact-validation.ts: returns a normalised payload on success or a
 * list of generic error codes on failure (the form shows a single user-facing
 * message, so a bot can't probe which field failed).
 *
 * All limits are enforced here server-side; the browser form's HTML attributes
 * are advisory only and are trivially bypassed by a direct POST.
 */

// Allowlists. Keep TOWNS in sync with the form's TOWN list and CATEGORIES in
// sync with data/exports/business-types.json (plus the literal 'Other' the form
// appends). These are embedded (not imported) because api/_lib cannot import
// from the Vite src/ graph — same approach as contact-validation.ts.
const ALLOWED_TOWNS = new Set([
  'Vineyard Haven',
  'Edgartown',
  'Oak Bluffs',
  'West Tisbury',
  'Chilmark',
  'Aquinnah',
]);

const ALLOWED_CATEGORIES = new Set([
  'Arts & Entertainment',
  'Beauty & Wellness',
  'Building & Construction',
  'Business & Professional Services',
  'Family, Community & Government',
  'Home Services & Trades',
  'Lodging',
  'Medical Services & Providers',
  'Restaurants, Food & Beverages',
  'Shopping & Specialty Retail',
  'Sports & Recreation',
  'Other',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose phone matcher: 7-20 chars, digits/spaces/punctuation.
const PHONE_RE = /^[\d+()\-.\s]{7,20}$/;

// Field length caps (characters). Generous for legit businesses, bounded to
// prevent oversized payloads / abuse.
const LIMITS = {
  business_name: 160,
  address: 200,
  description: 1200,
  phone: 20,
  email: 200,
  website: 300,
  contact_name: 120,
  contact_email: 200,
  notes: 1200,
} as const;

export type DirectoryInput = {
  business_name?: unknown;
  town?: unknown;
  category?: unknown;
  address?: unknown;
  description?: unknown;
  phone?: unknown;
  email?: unknown;
  website?: unknown;
  contact_name?: unknown;
  contact_email?: unknown;
  notes?: unknown;
  confirms_ownership?: unknown;
};

export type CleanDirectory = {
  business_name: string;
  town: string;
  category: string;
  address: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  contact_name: string;
  contact_email: string;
  notes: string | null;
  confirms_ownership: boolean;
};

export type ValidateResult =
  | { ok: true; clean: CleanDirectory }
  | { ok: false; errors: string[] };

/**
 * Validate a submitted website URL. Only http/https absolute URLs are allowed;
 * javascript:, data:, mailto:, relative, and malformed values are rejected.
 * Returns the normalised URL string, or null if the field was empty, or the
 * sentinel 'INVALID' if present-but-bad.
 */
function validateWebsite(raw: string): string | null | 'INVALID' {
  if (!raw) return null;
  if (raw.length > LIMITS.website) return 'INVALID';
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return 'INVALID';
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'INVALID';
  if (!u.hostname || !u.hostname.includes('.')) return 'INVALID';
  return u.toString();
}

export function validateDirectorySubmission(raw: DirectoryInput): ValidateResult {
  const errors: string[] = [];
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  const business_name = s(raw.business_name);
  const town          = s(raw.town);
  const category      = s(raw.category);
  const address       = s(raw.address);
  const description   = s(raw.description);
  const phone         = s(raw.phone);
  const email         = s(raw.email).toLowerCase();
  const websiteRaw    = s(raw.website);
  const contact_name  = s(raw.contact_name);
  const contact_email = s(raw.contact_email).toLowerCase();
  const notes         = s(raw.notes);
  const confirms_ownership = raw.confirms_ownership === 'yes' || raw.confirms_ownership === true;

  // Required fields
  if (business_name.length < 2)                 errors.push('business_name_too_short');
  if (business_name.length > LIMITS.business_name) errors.push('business_name_too_long');
  if (!ALLOWED_TOWNS.has(town))                 errors.push('town_invalid');
  if (!ALLOWED_CATEGORIES.has(category))        errors.push('category_invalid');
  if (contact_name.length < 2)                  errors.push('contact_name_too_short');
  if (contact_name.length > LIMITS.contact_name) errors.push('contact_name_too_long');
  if (!EMAIL_RE.test(contact_email))            errors.push('contact_email_invalid');
  if (contact_email.length > LIMITS.contact_email) errors.push('contact_email_too_long');

  // Optional fields — validate only if present
  if (address.length > LIMITS.address)          errors.push('address_too_long');
  if (description.length > LIMITS.description)   errors.push('description_too_long');
  if (phone && !PHONE_RE.test(phone))           errors.push('phone_invalid');
  if (email && !EMAIL_RE.test(email))           errors.push('business_email_invalid');
  if (email.length > LIMITS.email)              errors.push('business_email_too_long');
  if (notes.length > LIMITS.notes)              errors.push('notes_too_long');

  const website = validateWebsite(websiteRaw);
  if (website === 'INVALID')                    errors.push('website_invalid');

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    clean: {
      business_name,
      town,
      category,
      address: address || null,
      description: description || null,
      phone: phone || null,
      email: email || null,
      website: website === 'INVALID' ? null : website,
      contact_name,
      contact_email,
      notes: notes || null,
      confirms_ownership,
    },
  };
}
