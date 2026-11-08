/**
 * Proves the shared rate-limiter scopes every query by `source`, so contact and
 * directory submissions have INDEPENDENT IP-based and email-based quotas.
 *
 * Strategy: mock Supabase to (a) record the exact .eq() filters applied to each
 * count query, and (b) return a per-(source,column) count from a fixture store.
 * Then assert that a saturated quota for one source does NOT block the other.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => {
  // Fixture: how many 'sent' rows exist per (source -> {ip, email} -> count).
  const store = {
    sentByIp: new Map<string, number>(),    // key: `${source}|${ipHash}`
    sentByEmail: new Map<string, number>(),  // key: `${source}|${email}`
  };
  // Capture the filters each query applied, for assertions.
  const queries: Array<Record<string, string>> = [];
  return { store, queries };
});

vi.mock('../_lib/supabase.js', () => {
  function makeQuery() {
    const filters: Record<string, string> = {};
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((col: string, val: string) => { filters[col] = val; return chain; });
    chain.gte = vi.fn(() => chain);
    (chain as unknown as { then: unknown }).then = (resolve: (v: unknown) => void) => {
      h.queries.push({ ...filters });
      // Decide which fixture map to read based on whether this query filtered
      // by ip_hash or email.
      const source = filters.source;
      let count = 0;
      if ('ip_hash' in filters) {
        count = h.store.sentByIp.get(`${source}|${filters.ip_hash}`) ?? 0;
      } else if ('email' in filters) {
        count = h.store.sentByEmail.get(`${source}|${filters.email}`) ?? 0;
      }
      return resolve({ count, error: null });
    };
    chain.insert = vi.fn(async () => ({ error: null }));
    return chain;
  }
  return { supabase: { from: vi.fn(() => makeQuery()) } };
});

import { checkRateLimits, FORM_SOURCES } from '../_lib/contact-rate-limit.ts';

beforeEach(() => {
  h.store.sentByIp.clear();
  h.store.sentByEmail.clear();
  h.queries.length = 0;
});

describe('rate-limit source scoping', () => {
  it('every query is scoped by source (ip + email)', async () => {
    await checkRateLimits({ source: FORM_SOURCES.directorySubmission, ipHash: 'ipX', email: 'a@b.com' });
    // Two queries ran (ip, then email); both carried source='directory_submission'.
    expect(h.queries.length).toBe(2);
    for (const q of h.queries) expect(q.source).toBe('directory_submission');
    // One filtered by ip_hash, one by email.
    expect(h.queries.some(q => 'ip_hash' in q)).toBe(true);
    expect(h.queries.some(q => 'email' in q)).toBe(true);
  });

  it('a saturated CONTACT ip quota does NOT block a DIRECTORY submission from the same IP', async () => {
    // Contact has hit its IP limit (3) for this IP; directory has 0.
    h.store.sentByIp.set('contact|sharedIP', 3);
    h.store.sentByIp.set('directory_submission|sharedIP', 0);

    const contact = await checkRateLimits({ source: FORM_SOURCES.contact, ipHash: 'sharedIP', email: 'c@x.com' });
    const directory = await checkRateLimits({ source: FORM_SOURCES.directorySubmission, ipHash: 'sharedIP', email: 'c@x.com' });

    expect(contact.ok).toBe(false);   // contact blocked (its own quota full)
    expect(directory.ok).toBe(true);  // directory unaffected
  });

  it('a saturated DIRECTORY ip quota does NOT block a CONTACT submission from the same IP', async () => {
    h.store.sentByIp.set('directory_submission|sharedIP', 3);
    h.store.sentByIp.set('contact|sharedIP', 0);

    const directory = await checkRateLimits({ source: FORM_SOURCES.directorySubmission, ipHash: 'sharedIP', email: 'c@x.com' });
    const contact = await checkRateLimits({ source: FORM_SOURCES.contact, ipHash: 'sharedIP', email: 'c@x.com' });

    expect(directory.ok).toBe(false);
    expect(contact.ok).toBe(true);
  });

  it('a saturated CONTACT email quota does NOT block a DIRECTORY submission from the same email', async () => {
    // Email burst limit is 1 within 10 min.
    h.store.sentByEmail.set('contact|same@person.com', 1);
    h.store.sentByEmail.set('directory_submission|same@person.com', 0);

    const contact = await checkRateLimits({ source: FORM_SOURCES.contact, ipHash: 'ipA', email: 'same@person.com' });
    const directory = await checkRateLimits({ source: FORM_SOURCES.directorySubmission, ipHash: 'ipB', email: 'same@person.com' });

    expect(contact.ok).toBe(false);   // contact email burst-limited
    expect(directory.ok).toBe(true);  // directory email quota independent
  });

  it('default source is "contact" when omitted (back-compat with existing contact.ts)', async () => {
    await checkRateLimits({ ipHash: 'ipZ', email: 'z@z.com' }); // no source arg
    for (const q of h.queries) expect(q.source).toBe('contact');
  });
});
