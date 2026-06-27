#!/usr/bin/env python3
"""
Lead prioritization classifier.

Reads businesses from the registry DB and classifies each into one of six
outreach tiers based on name patterns, scraped meta descriptions, and the
existing category. See docs/LEAD-PRIORITIZATION.md for full methodology.

Usage:
    # First export from DB:
    sqlite3 data/mv_registry.db -separator $'	' "        SELECT id, business_name, category, COALESCE(subcategory,''),                COALESCE(town,''), COALESCE(website,''),                COALESCE(SUBSTR(REPLACE(REPLACE(REPLACE(short_description, CHAR(9), ' '), CHAR(10), ' '), CHAR(13), ' '),1,400),''),                COALESCE(SUBSTR(REPLACE(REPLACE(REPLACE(meta_description, CHAR(9), ' '), CHAR(10), ' '), CHAR(13), ' '),1,400),''),                COALESCE(REPLACE(REPLACE(homepage_title, CHAR(10), ' '), CHAR(13), ' '),'')         FROM businesses         WHERE COALESCE(is_duplicate,0)=0 AND COALESCE(suppress_from_directory,0)=0               AND business_status IN ('active','uncertain','unknown')         ORDER BY business_name" > /tmp/leads.tsv

    # Then run:
    python3 scripts/lead-classifier.py

Outputs:
    /tmp/lead-results.json  — full classification with per-row reasoning
    Tier counts and misclassifications printed to stderr.

Per-tier CSVs are produced by a separate script that reads lead-results.json
(see the commit that introduced docs/LEAD-PRIORITIZATION.md for the snippet).
"""

import csv, re, json, os, sys
from collections import defaultdict, Counter

# ─── VOCABULARIES (V2 — added wellness service patterns, refined fallbacks) ──

TIER1_NAME_KW = [
    r'\binn\b', r'\bhotel\b', r'\bmotel\b', r'\bresort\b',
    r'\bb\s?&\s?b\b', r'\bbed\s+(?:and|&)\s+breakfast\b',
    r'\bcottages?\b', r'\bvilla\b', r'\bsuites?\b',
    r'\bguest\s+house\b', r'\blodge\b', r'\blodging\b',
    r'\baccommodations?\b', r'\bvacation\s+rental\b',
    r'\bhospitality\b',
]
TIER1_NAME_HOUSE_MAYBE = [r'\bhouse\b']
TIER1_META_KW = [
    'hotel', 'inn', 'b&b', 'bed and breakfast', 'bed & breakfast',
    'vacation rental', 'accommodations', 'guest house', 'guest room',
    'lodging', 'cottage', 'resort', 'suite ', 'innkeeper',
    'overnight stay', 'overnight accommodation', 'check-in',
    'innkeeping', 'boutique hotel', 'beach house', 'beach hotel',
]

TIER2_NAME_KW = [
    r'\brestaurant\b', r'\bcafe\b', r'\bcoffee\b', r'\bbar\b', r'\bpub\b',
    r'\bbakery\b', r'\bbakeries\b', r'\bdeli\b',
    r'\bcatering\b', r'\bdiner\b', r'\bbistro\b', r'\bgrill\b',
    r'\bpizza\b', r'\bsteak\s+house\b', r'\bsteakhouse\b', r'\bseafood\b',
    r'\bbrewery\b', r'\bwinery\b', r'\bice\s+cream\b',
    r'\bsandwich\b', r'\bclam\s?bar\b', r'\bchowder\b',
    r'\bbuns?\b', r'\bdonuts?\b', r'\bbiscuits\b', r'\btavern\b',
    r'\beatery\b', r'\bkitchen\b', r'\bfish\s+market\b',
    r'\bclambake\b', r'\bfood\s+truck\b', r'\bjuice\b',
    r'\bchocolate', r'\bcandy\b',
]
TIER2_META_KW = [
    'restaurant', 'menu', 'dining', 'breakfast', 'lunch', 'dinner',
    'cafe', 'coffee shop', 'catering', 'takeout', 'take-out',
    'fresh bakery', 'baked goods', 'fine dining', 'cuisine', 'tapas',
    'seafood', 'sushi', 'pizza', 'brewery', 'tasting room', 'wine bar',
    'food and drink', 'eat ', 'gourmet',
]

# Tier 3: Retail + on-premise consumer services (POS/Wi-Fi/cameras)
TIER3_NAME_KW = [
    r'\bboutique\b', r'\bgallery\b', r'\bstore\b', r'\bshop\b', r'\bshoppe\b',
    r'\bjewelry\b', r'\bjewelers?\b', r'\bclothing\b', r'\bapparel\b',
    r'\boutfitters?\b', r'\bgift', r'\bsouvenir', r'\bgrocer', r'\bgrocery\b',
    r'\bpharmacy\b', r'\bapothecary\b', r'\bdrug\b',
    r'\bbike\s+(?:shop|rental)\b', r'\bbicycle\b', r'\bsurf\s+shop\b',
    r'\bhardware\b', r'\bspecialty\s+(?:foods?|retail)\b',
    r'\bbookstore\b', r'\bbooks?\b',
    r'\btoys?\b', r'\bantiques?\b', r'\bvintage\b',
    r'\bflowers?\b', r'\bflorist\b', r'\bgarden\s+center\b',
    r'\bwine\s+(?:&\s+)?spirits?\b', r'\bliquor\b', r'\bpackage\s+store\b',
    r'\bbutcher\b', r'\bcheese\b',
    r'\boptician', r'\beyewear\b',
    # On-premise consumer services (similar IT needs to retail):
    r'\byoga\b', r'\bpilates\b', r'\bcrossfit\b', r'\bfitness\b', r'\bgym\b',
    r'\bsalon\b', r'\bspa\b', r'\bappliance\b', r'\bnursery\b', r'\bmuseum\b', r'\bglassworks\b', r'\bpottery\b', r'\bbarber\b', r'\bhair\b', r'\bbeauty\b',
    r'\bmassage\b', r'\bphysical\s+therapy\b', r'\bchiropractor', r'\bdental\b',
    r'\bdentist', r'\boptometr', r'\baesthetic',
]
TIER3_META_KW = [
    'gift shop', 'specialty store', 'boutique', 'jewelry store',
    'apparel', 'clothing', 'bookstore', 'pharmacy', 'apothecary',
    'liquor store', 'package store', 'bike rental', 'bike shop',
    'gallery', 'souvenirs', 'home goods', 'retail',
    'shop online', 'online store', 'merchandise',
    'yoga studio', 'pilates studio', 'fitness studio', 'health club',
    'massage therapy', 'spa treatments', 'salon services',
]

TIER4_NAME_KW = [
    r'\bcaretak', r'\bproperty\s+manag', r'\bestate\s+manag',
    r'\bhome\s+watch\b', r'\bconcierge\b',
    r'\bgeneral\s+contractor\b', r'\bbuilder\b', r'\bbuilders\b',
    r'\bconstruction\b',
    r'\bplumb', r'\bheating\b', r'\belectric\b', r'\belectrician',
    r'\bhvac\b', r'\bcarpentry\b', r'\bcarpenters?\b',
    r'\broofing\b', r'\bpaint(?:ing|ers?)\b',
    r'\blandscap', r'\blawn\b', r'\bgutter\b',
    r'\bmasonry\b', r'\bhandyman\b', r'\bspray',
    r'\bfencing\b', r'\bremodel',
    r'\bdesign\s+(?:&\s+)?build\b', r'\barchitect', r'\benergy\s+design\b', r'\btile\s+company\b',
]
TIER4_META_KW = [
    'plumbing', 'heating', 'hvac', 'electrical', 'electrician',
    'carpentry', 'roofing', 'painting', 'landscaping', 'masonry',
    'general contractor', 'home contractor', 'construction',
    'home builder', 'property manager', 'caretaker', 'estate manager',
    'home watch', 'concierge service', 'architect',
]

TIER5_NAME_KW = [
    r'\breal\s+estate\b', r'\brealtors?\b', r'\brealty\b',
    r'\bbrokerage\b', r'\bvacation\s+rentals?\b', r'\brental\s+agency\b',
    r'\bsotheby', r'\bcompass\b',
]
TIER5_META_KW = [
    'real estate', 'realtor', 'brokerage', 'property listings',
    'rental agency', 'home for sale', 'real estate agent',
    'listings', 'rental properties',
]

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def any_match(patterns, text):
    return [p for p in patterns if re.search(p, text, re.IGNORECASE)]

def kw_hits(words, text):
    t = (text or '').lower()
    return [w for w in words if w in t]

def safe_truncate(s, n):
    if not s: return ''
    s = s.strip()
    return s[:n] + '…' if len(s) > n else s

# ─── CLASSIFIER ───────────────────────────────────────────────────────────────

def classify(row):
    business_id, name, category, subcategory, town, website, short_desc, meta_desc, homepage_title = row
    name_l = (name or '').lower()
    text_pool = ' '.join([short_desc or '', meta_desc or '', homepage_title or '']).lower()

    reasons = []
    # Junk-record detection (bad scraping artifacts)
    JUNK_PATTERNS = [r"^account\s+suspended$", r"^instagram\s+icon$", r"^mass\.gov", r"^secure\.", r"^http", r"^www\.", r"^kkon$", r"^johnkeene$", r"^martha$", r"^trust$"]
    for jp in JUNK_PATTERNS:
        if re.search(jp, name_l):
            return ("Tier 6", "low", f"JUNK RECORD: matches /{jp}/", "")


    # Tier 1 – Lodging
    t1_name = any_match(TIER1_NAME_KW, name_l)
    t1_house = any_match(TIER1_NAME_HOUSE_MAYBE, name_l)
    t1_meta = kw_hits(TIER1_META_KW, text_pool)

    if t1_name:
        reasons.append(f"name matches lodging ({', '.join(t1_name[:2])})")
        suggested = 'lodging' if category != 'Lodging' else None
        return ('Tier 1', 'high', '; '.join(reasons), suggested)
    if t1_house and t1_meta:
        reasons.append(f"name has 'house' + meta confirms lodging ({', '.join(t1_meta[:2])})")
        suggested = 'lodging' if category != 'Lodging' else None
        return ('Tier 1', 'high', '; '.join(reasons), suggested)
    if len(t1_meta) >= 2:
        reasons.append(f"meta mentions lodging signals: {t1_meta[:3]}")
        suggested = 'lodging' if category != 'Lodging' else None
        return ('Tier 1', 'medium', '; '.join(reasons), suggested)

    # Tier 4 – Property Pros (check before 2/3)
    t4_name = any_match(TIER4_NAME_KW, name_l)
    t4_meta = kw_hits(TIER4_META_KW, text_pool)
    if t4_name:
        reasons.append(f"name matches property/contractor ({', '.join(t4_name[:2])})")
        if any(re.search(r'plumb|heating|hvac|electric', p) for p in t4_name):
            suggested = 'home-services-and-trades' if 'Home Services' not in category else None
        elif any(re.search(r'construction|builder|masonry|architect|energy\s+design', p) for p in t4_name):
            suggested = 'building-and-construction' if 'Building' not in category else None
        else:
            suggested = None
        return ('Tier 4', 'high', '; '.join(reasons), suggested)
    if t4_meta:
        reasons.append(f"meta mentions contractor work: {t4_meta[:3]}")
        return ('Tier 4', 'medium', '; '.join(reasons), None)

    # Tier 2 – Restaurants
    t2_name = any_match(TIER2_NAME_KW, name_l)
    t2_meta = kw_hits(TIER2_META_KW, text_pool)
    if t2_name:
        reasons.append(f"name matches food/dining ({', '.join(t2_name[:2])})")
        return ('Tier 2', 'high', '; '.join(reasons), None)
    if len(t2_meta) >= 2 and 'restaurant' in (category or '').lower():
        reasons.append(f"meta confirms restaurant ({t2_meta[:3]})")
        return ('Tier 2', 'high', '; '.join(reasons), None)

    # Tier 5 – Real Estate
    t5_name = any_match(TIER5_NAME_KW, name_l)
    t5_meta = kw_hits(TIER5_META_KW, text_pool)
    if t5_name:
        reasons.append(f"name matches real estate ({', '.join(t5_name[:2])})")
        return ('Tier 5', 'high', '; '.join(reasons), None)
    if any(k in text_pool for k in ['real estate', 'realtor', 'brokerage']):
        reasons.append(f"meta indicates real estate")
        return ('Tier 5', 'medium', '; '.join(reasons), None)

    # Tier 3 – Retail + on-premise services
    t3_name = any_match(TIER3_NAME_KW, name_l)
    t3_meta = kw_hits(TIER3_META_KW, text_pool)
    if t3_name:
        reasons.append(f"name matches retail/wellness ({', '.join(t3_name[:2])})")
        return ('Tier 3', 'high', '; '.join(reasons), None)
    if len(t3_meta) >= 1 and category in ['Shopping & Specialty Retail', 'Shopping & Retail',
                                            'Shopping', 'Retail', 'Boutique', 'Gallery',
                                            'Health & Wellness', 'Beauty & Wellness']:
        reasons.append(f"current category=retail/wellness + meta supports ({t3_meta[:2]})")
        return ('Tier 3', 'high', '; '.join(reasons), None)

    # Fallback by current category
    cat_l = (category or '').lower()
    if 'restaurant' in cat_l or 'food' in cat_l or 'beverage' in cat_l:
        return ('Tier 2', 'low', 'fallback: current category is restaurant/food', None)
    if 'shopping' in cat_l or 'retail' in cat_l or 'boutique' in cat_l or 'gallery' in cat_l:
        return ('Tier 3', 'low', 'fallback: current category is shopping/retail', None)
    if 'health' in cat_l or 'wellness' in cat_l or 'beauty' in cat_l or 'spa' in cat_l:
        return ('Tier 3', 'low', 'fallback: current category is wellness/beauty', None)
    if 'lodging' in cat_l or 'inn' in cat_l:
        return ('Tier 1', 'low', 'fallback: current category is lodging', None)
    if 'real estate' in cat_l:
        return ('Tier 5', 'low', 'fallback: current category is real estate', None)
    if any(k in cat_l for k in ['contractor', 'construction', 'home services', 'building']):
        return ('Tier 4', 'low', 'fallback: current category is contractor', None)

    return ('Tier 6', 'low', 'no clear tier signal', None)

# ─── DRIVE ────────────────────────────────────────────────────────────────────

with open('/tmp/leads.tsv') as f:
    rows = list(csv.reader(f, delimiter='\t'))

results = []
for row in rows:
    if len(row) < 9: continue
    business_id, name, category, subcategory, town, website, short_desc, meta_desc, homepage_title = row
    tier, conf, reason, suggested = classify(row)
    results.append({
        'id': business_id,
        'name': name,
        'town': town,
        'current_category': category,
        'subcategory': subcategory,
        'website': website,
        'meta_excerpt': safe_truncate(meta_desc, 200),
        'tier': tier,
        'confidence': conf,
        'reasoning': reason,
        'suggested_category': suggested or '',
    })

print(f"Classified {len(results)} businesses", file=sys.stderr)

with open('/tmp/lead-results.json', 'w') as f:
    json.dump(results, f, indent=2)

tier_counts = Counter(r['tier'] for r in results)
print("\nTier distribution:", file=sys.stderr)
for t in sorted(tier_counts):
    print(f"  {t}: {tier_counts[t]}", file=sys.stderr)

miscls = [r for r in results if r['suggested_category']]
print(f"\nMisclassification flags: {len(miscls)}", file=sys.stderr)
