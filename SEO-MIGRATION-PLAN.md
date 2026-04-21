# SEO Migration Plan: anythingitechmv.com

## Phase 1: Old Site Inventory

### Core Service Pages (HIGH PRIORITY)

| URL | Title | H1 | Topic | Intent | Priority |
|-----|-------|----|----|--------|----------|
| `/` | Anything iTech Martha's Vineyard | - | Home/Landing | Brand landing | HIGH |
| `/services/` | Services | Services | Service overview | Navigation | HIGH |
| `/iphone-repair/` | iPhone Repair Services | iPhone Repair Services | iPhone repair | Service | HIGH |
| `/mac-repair-services/` | Mac Repair & Services | Mac Repair & Services | Mac/PC repair | Service | HIGH |
| `/network-services-2/` | Network Services | Network Services | Networking/WiFi | Service | HIGH |
| `/remote-support/` | Remote Support | Remote Support | Remote assistance | Service | MEDIUM |
| `/contact/` | Contact | Contact | Contact info | Conversion | HIGH |
| `/about-us/` | About Us | About Us | Company info | Trust | MEDIUM |
| `/network-services/` | The Team | The Team | Team/Staff | Trust | MEDIUM |
| `/happy-clients/` | Happy Clients | Happy Clients | Client list | Trust | MEDIUM |

### Blog/Tech Tips - ALL 14 POSTS (MEDIUM PRIORITY)

| URL | Title | Topic | Date |
|-----|-------|-------|------|
| `/tech-tips/` | Tech Tips | Blog index | - |
| `/why-i-built-is-the-ferry-running/` | Why I Built Is the Ferry Running? | Local app | 2026-01 |
| `/wi-fi-coverage-for-large-properties/` | Strong Wi-Fi Coverage for Large MV Properties | WiFi/Networking | 2024-10 |
| `/office-wireless-network-installation/` | Guide to Choosing Right Wireless Network for Office | Business WiFi | 2024-10 |
| `/professional-wireless-network-installation/` | Why Professional Wireless Installation Beats DIY | WiFi services | 2024-10 |
| `/future-proof-luxury-wireless-network-marthas-vineyard/` | Future-Proof Home Wireless for Smart Home | Smart home WiFi | 2024-10 |
| `/luxury-home-wireless-network-marthas-vineyard/` | Why High-End MV Home Needs Cutting-Edge Wireless | Luxury WiFi | 2024-10 |
| `/marthas-vineyard-network-installations/` | Most Powerful WiFi Network Solutions on MV | WiFi services | 2024-10 |
| `/common-quick-fixes/` | Common Quick Fixes | Mac troubleshooting | 2018-02 |
| `/something-broken-iphone-ya-gonna-call-louis-hall/` | iPhone Broken? Who Ya Gonna Call? | iPhone repair | 2017-06 |
| `/malicious-ios-popups/` | Malicious iOS Popups | Security/iOS | 2017-06 |
| `/anything-apple-jingle/` | Anything Apple Jingle | Brand/Fun | 2017-05 |
| `/weekly-tip-start-taking-advantage-cloud/` | Weekly Tip: Start taking advantage of the cloud! | Cloud services | 2017-05 |
| `/year-louis-hall-anything-apple-marthas-vineyard/` | Here All Year: Louis Hall of Anything Apple | Interview/Profile | 2017-05 |
| `/the-end-of-an-era/` | The End of an Era | Company news | 2017-05 |

---

## Phase 2: New URL Structure

### Service Pages (Primary)

| New URL | Service | Maps From |
|---------|---------|-----------|
| `/services` | Service overview | `/services/` |
| `/services/apple-repair` | iPhone & Mac repair | `/iphone-repair/`, `/mac-repair-services/` |
| `/services/wifi-network` | WiFi & networking | `/network-services-2/`, WiFi blog posts |
| `/services/smart-home` | Smart home tech | NEW (content exists) |
| `/services/tv-audio` | TV & audio systems | NEW (content exists) |
| `/services/business-it` | Business IT services | Partial from `/network-services-2/` |

### Information Pages

| New URL | Purpose | Maps From |
|---------|---------|-----------|
| `/` | Home | `/` |
| `/about` | About company | `/about-us/`, `/network-services/` (team), `/happy-clients/` |
| `/contact` | Contact | `/contact/` |

### Blog/Resources

| New URL | Purpose | Maps From |
|---------|---------|-----------|
| `/blog` | Blog index | `/tech-tips/` |
| `/blog/[slug]` | Individual posts | Keep original slugs |

### Business Directory (NEW - separate concern)

| New URL | Purpose |
|---------|---------|
| `/marthas-vineyard` | Directory home |
| `/marthas-vineyard/[town]` | Town pages |
| `/marthas-vineyard/[type]` | Business type pages |

---

## Phase 3: Page-to-Page Mapping

### Service Page Redirects

| Old URL | New URL | Redirect | Content Migration | SEO Risk |
|---------|---------|----------|-------------------|----------|
| `/` | `/` | - | Redesign | LOW |
| `/services/` | `/services` | 301 | Keep structure | LOW |
| `/iphone-repair/` | `/services/apple-repair` | 301 | Merge with Mac | MEDIUM |
| `/mac-repair-services/` | `/services/apple-repair` | 301 | Merge with iPhone | MEDIUM |
| `/network-services-2/` | `/services/wifi-network` | 301 | Rewrite | LOW |
| `/remote-support/` | `/services/apple-repair` | 301 | Add as section | LOW |
| `/contact/` | `/contact` | 301 | Keep | LOW |
| `/about-us/` | `/about` | 301 | Merge with team | LOW |
| `/network-services/` | `/about` | 301 | Merge (team content) | LOW |
| `/happy-clients/` | `/about` | 301 | Add clients section | LOW |

### Blog Post Redirects

| Old URL | New URL | Notes |
|---------|---------|-------|
| `/tech-tips/` | `/blog` | 301 |
| `/why-i-built-is-the-ferry-running/` | `/blog/why-i-built-is-the-ferry-running` | 301 |
| `/wi-fi-coverage-for-large-properties/` | `/blog/wi-fi-coverage-for-large-properties` | 301 |
| `/office-wireless-network-installation/` | `/blog/office-wireless-network-installation` | 301 |
| `/professional-wireless-network-installation/` | `/blog/professional-wireless-network-installation` | 301 |
| `/future-proof-luxury-wireless-network-marthas-vineyard/` | `/blog/future-proof-luxury-wireless-network-marthas-vineyard` | 301 |
| `/luxury-home-wireless-network-marthas-vineyard/` | `/blog/luxury-home-wireless-network-marthas-vineyard` | 301 |
| `/marthas-vineyard-network-installations/` | `/blog/marthas-vineyard-network-installations` | 301 |
| `/common-quick-fixes/` | `/blog/common-quick-fixes` | 301 |
| `/something-broken-iphone-ya-gonna-call-louis-hall/` | `/blog/something-broken-iphone-ya-gonna-call-louis-hall` | 301 |
| `/malicious-ios-popups/` | `/blog/malicious-ios-popups` | 301 |

---

## Phase 4: High-Value Pages to Preserve

### CRITICAL - Must Preserve SEO Signals

1. **`/iphone-repair/`**
   - WHY: Primary service page, likely ranks for "iPhone repair Martha's Vineyard"
   - PRESERVE: Screen repair pricing, speed claims ("15 minutes"), local references
   - IMPROVE: Add structured data, clearer CTAs

2. **`/mac-repair-services/`**
   - WHY: Primary service page for Mac/PC
   - PRESERVE: Service list, Apple certification mention, troubleshooting expertise
   - IMPROVE: Consolidate with iPhone for "Apple Repair" mega-page

3. **`/network-services-2/`**
   - WHY: Networking is a key service differentiator (Ubiquiti expertise)
   - PRESERVE: Ubiquiti partnership, enterprise-level positioning, business/residential split
   - IMPROVE: Separate residential vs business tiers

4. **WiFi Blog Posts (2024)**
   - WHY: Recent, keyword-rich content targeting "Martha's Vineyard WiFi"
   - PRESERVE: All location signals, technical depth
   - IMPROVE: Cross-link to service page

---

## Phase 5: Content Extraction (Normalized)

### iPhone Repair Service Content

**Headline:** iPhone Repair Services

**Core Services:**
- Screen replacement (15-minute turnaround)
- Power port replacement
- Camera repairs (front and rear)
- Speaker replacement
- Liquid damage assessment
- Software repair / boot loop fix
- iCloud setup

**Key Benefits:**
- Faster than Apple Store
- Competitive pricing
- Local on-island service
- Appointment-based (no waiting)

**Location Signals:**
- Martha's Vineyard
- "From Vineyard Haven to Aquinnah"

**Trust Signals:**
- Apple Certified (ACMT since 2012)
- Transparent pricing

---

### Mac Repair Service Content

**Headline:** Mac Repair & Services

**Core Services:**
- Mac and PC troubleshooting
- Logic board replacement
- Screen/LCD replacement
- RAM upgrades
- Hard drive replacement
- OS installation
- Virus removal
- Wireless network maintenance
- Data backup (Time Machine, cloud, external)
- Remote support

**Key Benefits:**
- Quick turnaround
- Both Mac and PC
- Business and residential

---

### Network Services Content

**Headline:** Network Services

**Core Services:**
- WiFi installation (Ubiquiti enterprise products)
- Business server installation
- High-speed wired networks
- Network security
- Gaming network optimization
- Router troubleshooting
- Wireless printer setup

**Key Benefits:**
- Enterprise-level equipment for homes
- Ubiquiti specialist
- Business and residential

**Location Signals:**
- Martha's Vineyard homes and businesses

---

## Phase 6: Location Signals to Preserve

All pages must include geographic references:

- **Martha's Vineyard** (primary)
- **Vineyard Haven** (base location)
- **Edgartown**
- **Oak Bluffs**
- **West Tisbury**
- **Chilmark**
- **Aquinnah**
- **Menemsha**

Service area statement: "House calls throughout Martha's Vineyard"

---

## Phase 7: Redirect Configuration (Vercel/Next.js)

```javascript
// next.config.js or vercel.json redirects

const redirects = [
  // Service pages
  { source: '/services/', destination: '/services', permanent: true },
  { source: '/iphone-repair', destination: '/services/apple-repair', permanent: true },
  { source: '/iphone-repair/', destination: '/services/apple-repair', permanent: true },
  { source: '/mac-repair-services', destination: '/services/apple-repair', permanent: true },
  { source: '/mac-repair-services/', destination: '/services/apple-repair', permanent: true },
  { source: '/network-services-2', destination: '/services/wifi-network', permanent: true },
  { source: '/network-services-2/', destination: '/services/wifi-network', permanent: true },
  { source: '/remote-support', destination: '/services/apple-repair', permanent: true },
  { source: '/remote-support/', destination: '/services/apple-repair', permanent: true },

  // Info pages
  { source: '/about-us', destination: '/about', permanent: true },
  { source: '/about-us/', destination: '/about', permanent: true },
  { source: '/network-services', destination: '/about', permanent: true },
  { source: '/network-services/', destination: '/about', permanent: true },
  { source: '/happy-clients', destination: '/about', permanent: true },
  { source: '/happy-clients/', destination: '/about', permanent: true },
  { source: '/contact/', destination: '/contact', permanent: true },

  // Blog
  { source: '/tech-tips', destination: '/blog', permanent: true },
  { source: '/tech-tips/', destination: '/blog', permanent: true },
  { source: '/why-i-built-is-the-ferry-running', destination: '/blog/why-i-built-is-the-ferry-running', permanent: true },
  { source: '/why-i-built-is-the-ferry-running/', destination: '/blog/why-i-built-is-the-ferry-running', permanent: true },
  { source: '/wi-fi-coverage-for-large-properties', destination: '/blog/wi-fi-coverage-for-large-properties', permanent: true },
  { source: '/wi-fi-coverage-for-large-properties/', destination: '/blog/wi-fi-coverage-for-large-properties', permanent: true },
  { source: '/office-wireless-network-installation', destination: '/blog/office-wireless-network-installation', permanent: true },
  { source: '/office-wireless-network-installation/', destination: '/blog/office-wireless-network-installation', permanent: true },
  { source: '/professional-wireless-network-installation', destination: '/blog/professional-wireless-network-installation', permanent: true },
  { source: '/professional-wireless-network-installation/', destination: '/blog/professional-wireless-network-installation', permanent: true },
  { source: '/future-proof-luxury-wireless-network-marthas-vineyard', destination: '/blog/future-proof-luxury-wireless-network-marthas-vineyard', permanent: true },
  { source: '/future-proof-luxury-wireless-network-marthas-vineyard/', destination: '/blog/future-proof-luxury-wireless-network-marthas-vineyard', permanent: true },
  { source: '/luxury-home-wireless-network-marthas-vineyard', destination: '/blog/luxury-home-wireless-network-marthas-vineyard', permanent: true },
  { source: '/luxury-home-wireless-network-marthas-vineyard/', destination: '/blog/luxury-home-wireless-network-marthas-vineyard', permanent: true },
  { source: '/marthas-vineyard-network-installations', destination: '/blog/marthas-vineyard-network-installations', permanent: true },
  { source: '/marthas-vineyard-network-installations/', destination: '/blog/marthas-vineyard-network-installations', permanent: true },
  { source: '/common-quick-fixes', destination: '/blog/common-quick-fixes', permanent: true },
  { source: '/common-quick-fixes/', destination: '/blog/common-quick-fixes', permanent: true },
  { source: '/something-broken-iphone-ya-gonna-call-louis-hall', destination: '/blog/something-broken-iphone-ya-gonna-call-louis-hall', permanent: true },
  { source: '/something-broken-iphone-ya-gonna-call-louis-hall/', destination: '/blog/something-broken-iphone-ya-gonna-call-louis-hall', permanent: true },
  { source: '/malicious-ios-popups', destination: '/blog/malicious-ios-popups', permanent: true },
  { source: '/malicious-ios-popups/', destination: '/blog/malicious-ios-popups', permanent: true },
  { source: '/anything-apple-jingle', destination: '/blog/anything-apple-jingle', permanent: true },
  { source: '/anything-apple-jingle/', destination: '/blog/anything-apple-jingle', permanent: true },
  { source: '/weekly-tip-start-taking-advantage-cloud', destination: '/blog/weekly-tip-start-taking-advantage-cloud', permanent: true },
  { source: '/weekly-tip-start-taking-advantage-cloud/', destination: '/blog/weekly-tip-start-taking-advantage-cloud', permanent: true },
  { source: '/year-louis-hall-anything-apple-marthas-vineyard', destination: '/blog/year-louis-hall-anything-apple-marthas-vineyard', permanent: true },
  { source: '/year-louis-hall-anything-apple-marthas-vineyard/', destination: '/blog/year-louis-hall-anything-apple-marthas-vineyard', permanent: true },
  { source: '/the-end-of-an-era', destination: '/blog/the-end-of-an-era', permanent: true },
  { source: '/the-end-of-an-era/', destination: '/blog/the-end-of-an-era', permanent: true },

  // WordPress artifacts
  { source: '/feed', destination: '/', permanent: true },
  { source: '/feed/', destination: '/', permanent: true },
];
```

---

## Phase 8: Migration Safety Checklist

### Pre-Launch Validation

- [ ] Every old URL has a redirect destination
- [ ] No pages redirect to `/` incorrectly (except feed)
- [ ] All service topics have dedicated pages
- [ ] Location signals present on all service pages
- [ ] Contact info consistent across site
- [ ] Internal links updated to new URLs
- [ ] Meta titles and descriptions set
- [ ] Structured data (LocalBusiness) added
- [ ] Mobile responsive verified
- [ ] Page speed acceptable

### Post-Launch Monitoring

- [ ] Google Search Console: Monitor indexing
- [ ] Check 404 errors for missed redirects
- [ ] Verify redirects working (test each old URL)
- [ ] Monitor ranking changes for key terms
- [ ] Update Google Business Profile if needed

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iPhone/Mac merge loses rankings | MEDIUM | HIGH | Keep separate H2 sections, preserve keywords |
| Blog posts not indexed at new URLs | LOW | LOW | Proper 301s, sitemap update |
| Missing redirect for edge case | MEDIUM | LOW | Comprehensive testing |
| Location signals diluted | LOW | MEDIUM | Explicit location mentions on every page |

---

## Current Issues Found

### CRITICAL: Misrouted Pages

The current new site has these issues:

1. **Missing `/services/apple-repair`** - Old `/iphone-repair/` and `/mac-repair-services/` have no destination
2. **Missing `/services/wifi-network`** - Old `/network-services-2/` has no destination
3. **Missing `/blog` section** - All tech tips posts have no destination
4. **Missing `/about` consolidation** - Old team/clients pages not merged

### Current New Site Routes (from App.tsx)

```
/                    -> Index (HOME)
/services            -> Services (OK)
/apple-repair        -> AppleRepair (WRONG PATH - should be /services/apple-repair)
/wifi-network        -> WifiNetwork (WRONG PATH - should be /services/wifi-network)
/smart-home          -> SmartHome (WRONG PATH)
/tv-audio            -> TVAudio (WRONG PATH)
/business-it         -> BusinessIT (WRONG PATH)
/about               -> About (OK)
/contact             -> Contact (OK)
/marthas-vineyard/*  -> Directory (OK - new feature)
```

### Required Fixes

1. Move service pages under `/services/` prefix
2. Add `/blog` route and blog post pages
3. Add redirects from old WordPress URLs
4. Update internal links throughout site
