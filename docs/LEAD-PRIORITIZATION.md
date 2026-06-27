# Lead Prioritization Audit

Generated 2026-06-27. Classifies all 304 active businesses in the directory into a 6-tier outreach priority based on their fit as networking, Wi-Fi, managed IT, and computer support clients.

## Tier Distribution

| Tier | Description | Count | CSV |
|---|---|---|---|
| **Tier 1** | Lodging (hotels, inns, B&Bs, vacation rentals) | **33** | `data/exports/leads/tier1-lodging.csv` |
| **Tier 2** | Restaurants & food service | **117** | `data/exports/leads/tier2-restaurants.csv` |
| **Tier 3** | Retail + on-premise consumer services (wellness, beauty) | **99** | `data/exports/leads/tier3-retail.csv` |
| **Tier 4** | Property professionals (contractors, caretakers, builders, plumbers, electricians) | **14** | `data/exports/leads/tier4-contractors-caretakers.csv` |
| **Tier 5** | Real estate & rental agencies | **0** | `data/exports/leads/tier5-real-estate.csv` |
| **Tier 6** | Everything else (banks, government, photographers, professional services) | **41** | `data/exports/leads/tier6-other.csv` |
| | **Total** | **304** | |

**Master CSV:** `data/exports/leads/all-leads.csv`

## Notable Findings

### Tier 5 is empty
There are no real estate agencies in the current directory. If you want to develop Tier 5 as a real outreach pipeline, the directory needs to be expanded — likely by importing from the Chamber of Commerce or Vineyard Gazette real estate sections.

### Misclassifications detected (9)
See `data/exports/leads/misclassifications.csv`. Highlights:
- **Brissette Electric Inc.** — filed as "Community", should be `home-services-and-trades`
- **Hutker Architects INC** — filed as "Healthcare", should be `building-and-construction`
- **Outermost Inn** — filed as "Restaurant", should be `lodging`
- **Vineyard Harbor Motel** — filed as "Other", should be `lodging`

These are the same kind of data bugs we fixed for the plumbers in lodging. Recommend running a one-off correction script.

### Junk records (8)
See `data/exports/leads/junk-records-needs-cleanup.csv`. Examples: "Account Suspended", "Instagram Icon", URLs as business names. These are scraping artifacts and should be deleted from the registry.

### Tier 6 manual review candidates
Some Tier 6 records may belong in Tier 2/3/4 but require human inspection of the website:
- **Donaroma's Martha's Vineyard** — nursery + landscape + floral design (likely Tier 4 landscaping)
- **Crane Appliance** — appliance sales (likely Tier 3 retail; my v3 classifier should have caught this — investigate)
- **Charles & Charles, Greenwood House, Jardin Mahoney** — unknown without website inspection
- **Tashmoo Insurance Agency** — could be its own Tier 5-adjacent insurance bucket

## Classification Methodology

Each business is classified using a layered approach:

1. **Tier 1 (Lodging)**: Name matches `inn`, `hotel`, `motel`, `resort`, `cottage`, `lodge`, `B&B`, etc. OR meta description has lodging keywords.
2. **Tier 4 (Property pros)** — *evaluated before Tier 2/3*: Name matches `plumb`, `electric`, `hvac`, `contractor`, `builder`, `landscap`, etc. We check these first because plumbers and electricians often have product-y names that could be mistaken for retail.
3. **Tier 2 (Restaurants)**: Name matches food/dining keywords.
4. **Tier 5 (Real estate)**: Name matches `real estate`, `realty`, `brokerage`, etc.
5. **Tier 3 (Retail + wellness)**: Name matches `shop`, `gallery`, `boutique`, `jewelry`, `yoga`, `spa`, `salon`, `apothecary`, etc.
6. **Fallback to current category** if no name match.
7. **Tier 6** if nothing else applies.

Each classification carries a confidence (high/medium/low) and a reasoning string. Confidence levels:

- **high** — Name directly matches the tier's vocabulary, OR multiple signals agree.
- **medium** — Meta description supports but name doesn't directly match.
- **low** — Only the existing (possibly wrong) category supports the assignment; review recommended.

## Messaging Recommendations

For each tier, here's how outreach should differ. **Do not write the emails yet — these are angles, not templates.**

### Tier 1 — Lodging

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | Guest Wi-Fi reliability is *the* top complaint on review sites. Cancelled reservations from review damage. Vacant-season network maintenance. Smart locks failing when remote. |
| **Value proposition** | "Your guests' first 5 minutes on property determine your review score. We make sure the Wi-Fi works the moment they walk in." |
| **Email angle** | Focus on **review prevention** — quote actual TripAdvisor/Google review patterns ("Wi-Fi was unusable in our room"). Mention seasonal-property monitoring for off-season. |
| **CTA** | "Free 30-minute Wi-Fi audit of one of your properties before the next booking cycle." |
| **Avoid** | Generic IT pitches. Tech jargon. Don't lead with hardware specs — lead with the guest experience. |

### Tier 2 — Restaurants & Food Service

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | POS goes down during dinner rush. Credit card processing fails. Online ordering buggy on busy nights. Guest Wi-Fi turns customers away. Background music (Sonos) fails. Cameras unreliable. |
| **Value proposition** | "A Friday night POS outage costs you four-figure revenue and your reputation. We make sure your tech is as reliable as your kitchen." |
| **Email angle** | Concrete cost-of-downtime framing. Mention specific systems (Square, Toast, Resy) if you know what they use. Mention guest Wi-Fi as a hospitality factor. |
| **CTA** | "Free network health check before the dinner shift this Friday." (Time-pressure angle works here.) |
| **Avoid** | Long emails. Pre-shift restaurant owners have 30 seconds. Get to the value in two sentences. |

### Tier 3 — Retail + Wellness/Beauty

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | POS terminal issues during checkout. Credit card processing. Inventory sync between systems. In-store cameras for shrinkage. Background music/Sonos. Guest Wi-Fi expected by upscale shoppers. |
| **Value proposition** | "When checkout fails on a busy Saturday, the customer walks. Reliable POS, network, and cameras keep the day moving." |
| **Email angle** | Lead with one specific concrete pain. Wellness/yoga sub-segment — focus on class scheduling, booking software, guest Wi-Fi for clients in the lobby. |
| **CTA** | "10-minute walkthrough of your network and POS setup at no cost." |
| **Avoid** | One-size-fits-all retail pitch. The yoga studio's needs are different from the jewelry boutique's. Segment the email body by subcategory if possible. |

### Tier 4 — Property Professionals (Contractors, Caretakers)

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | They're not buying networking for *themselves* — they're being asked by clients for recommendations. They lose credibility when they don't have a trusted referral. |
| **Value proposition** | **Reframe entirely.** Don't sell them networking. Offer to be their networking referral partner. |
| **Email angle** | "I'm not pitching you anything. I'm the local Wi-Fi and smart home guy your clients keep asking you about. When that comes up next, here's who I am and what I do." Then ONE paragraph about you. Then offer to do a free site walk on a property they manage so they can see your work. |
| **CTA** | "Coffee or a quick call — happy to be on your shortlist when the question comes up." |
| **Avoid** | Selling. Selling. Selling. These people are referral channels, not customers. |

### Tier 5 — Real Estate & Rental Agencies

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | Their listings have to compete on amenities — Wi-Fi is now table stakes. Bad Wi-Fi at a vacation rental = bad review = listing drops in search. |
| **Value proposition** | "We help your rental homeowner-clients deliver the Wi-Fi guests expect — without the homeowner having to think about it." |
| **Email angle** | Frame it as **how-we-help-your-clients-look-better**. Mention seasonal setup, remote troubleshooting, the homeowner-doesn't-have-to-be-there-for-the-fix angle. |
| **CTA** | "Want to test us on one of your tougher properties this off-season? On us." |
| **Avoid** | Selling them as the customer. They're a referral channel, like Tier 4. |

### Tier 6 — Everything Else

| Aspect | Recommendation |
|---|---|
| **Primary pain points** | Highly variable. Many are non-commercial (government, nonprofits, civic). |
| **Value proposition** | Largely irrelevant — most aren't great IT prospects. Photographers may be exceptions (event/wedding Wi-Fi setup). |
| **Email angle** | Don't blast Tier 6. Treat as one-off opportunities. |
| **CTA** | None — review individually. |
| **Avoid** | Spending equal outreach time here. Tier 6 is a parking lot, not a target. |

## How to Use This

1. **Review the misclassifications CSV** and approve corrections you agree with — many will need a one-off DB update.
2. **Delete the junk records** (or move them to a separate "needs investigation" state).
3. **For each tier you actively work**, open its CSV, sort by confidence (high first), and start outreach with the high-confidence rows.
4. **Re-run this audit periodically** as the directory grows or business data is updated. The classifier is in `scripts/lead-classifier.py` (to be committed alongside this doc).

## Sources of Evidence Used

| Signal | Source | Weight in classifier |
|---|---|---|
| Business name | DB `business_name` column | Highest — names are the strongest single signal |
| Meta description | Scraped from each business's website (`meta_description` column) | High — written by the business itself |
| Short description | Templated; `short_description` column | Low — many are auto-generated junk |
| Current category | `category` column | Fallback only — we've seen this be wrong (e.g. plumbers in Lodging) |
| Subcategory | `subcategory` column | Mostly unused; few rows populated |
| Website domain | `website` column | Not currently used as a classification signal — could be added |

## Limitations

- **Real estate is empty.** Directory has no `realty`/`brokerage`/`Sotheby's`-type listings. Tier 5 outreach pipeline needs the directory expanded first.
- **Tier 6 is heterogeneous.** It includes legitimate non-IT-buyers (council on aging, fire department) alongside maybe-IT-buyers (photographers, appliance stores, nurseries). Manual review of the 41-row Tier 6 CSV is recommended before any outreach.
- **Confidence is rule-based, not statistical.** It's a transparent heuristic, not a model. If you find frequent mistakes in a pattern, the classifier rules should be tightened.
- **Plumbers/electricians went into Tier 4 even though they're often small businesses with their own IT needs.** Per your spec, Tier 4 messaging is referral-focused. If you want to also sell *to* them (their office IT), that's a Tier 4-sub-segment we can split out.
