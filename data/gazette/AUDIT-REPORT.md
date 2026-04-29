# Vineyard Gazette Business Import Audit

Generated: 2026-04-29T03:01:31.217Z
Source: Vineyard Gazette Business Directory

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Parsed | 398 |
| Matched to Existing | 238 |
| Potential New Businesses | 160 |
| Records with Conflicts | 236 |

## By Gazette Category

| Category | Total | New |
|----------|-------|-----|
| General Business Information | 140 | 89 |
| Restaurants | 110 | 22 |
| Lodging | 42 | 15 |
| Arts & Culture | 33 | 7 |
| Health & Wellness | 17 | 4 |
| Grocery Stores | 14 | 7 |
| Outdoor Activities | 9 | 2 |
| Package Stores | 8 | 5 |
| Self Help Meetings | 7 | 3 |
| Farm Market & Stands | 6 | 1 |
| Fish Markets | 5 | 0 |
| Transportation | 4 | 3 |
| Pharmacies | 3 | 2 |

## By Town

| Town | Count |
|------|-------|
| Edgartown | 131 |
| Vineyard Haven | 107 |
| Oak Bluffs | 84 |
| West Tisbury | 25 |
| Chilmark | 19 |
| Aquinnah | 9 |

## Duplicate Entries in Gazette Data

The following businesses appear multiple times in the Gazette data:

| Business Name | Count |
|---------------|-------|
| Edgartown Meat & Fish Market | 3 |
| Orange Peel Bakery | 2 |
| The Gay Head Store | 2 |
| Great Harbor Market | 2 |
| Morning Glory Farm | 2 |
| Tony's Market | 2 |
| Alcoholics Anonymous | 2 |
| Narcotics Anonymous | 2 |
| Smart Recovery | 2 |
| Black Dog General Store | 2 |
| CB Stark Jewelers | 2 |
| Hollywood Nails | 2 |
| Martha's Vineyard Bank | 2 |
| Menemsha Blues | 2 |
| Rockland Trust | 2 |
| Soft As A Grape | 2 |
| Tashmoo Insurance | 2 |
| Vineyard Vines | 2 |

## Field Conflict Summary

| Field | Conflicts |
|-------|-----------|
| website | 228 |
| address | 223 |
| phone | 69 |

## Sample Conflicts (First 20)

Review these to understand the nature of differences:

### Orange Peel Bakery (ID: 36)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Aquinnah

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://orangepeelbakery.squarespace.com | http://orangepeelbakery.squarespace.com/ |
| address | 22 State Rd, Aquinnah, MA 02535 | 22 State Rd |

### Outermost Inn and Restaurant (ID: 38)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Aquinnah

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://outermostinn.com | http://outermostinn.com/ |
| address | 81 Lighthouse Rd, Aquinnah, MA 02535 | (empty) |

### Chilmark General Store (ID: 41)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Chilmark

| Field | Gazette | Existing |
|-------|---------|----------|
| phone | (508) 645-3739 | (empty) |
| website | https://chilmarkgeneralstore.com | http://chilmarkgeneralstore.com/ |
| address | 7 State Rd, Chilmark, MA 02535 | 7 State Road |

### Menemsha Gallery (ID: 45)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Chilmark

| Field | Gazette | Existing |
|-------|---------|----------|
| phone | (508) 645-9819 | (empty) |
| website | https://menemshagallery.com | http://menemshagallery.com/ |
| address | 515 N Rd, Chilmark, MA 02535 | (empty) |

### The Homeport Restaurant & Oyster Bar (ID: 47)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Chilmark

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://thehomeportmv.com | http://thehomeportmv.com/ |
| address | 512 N Rd, Chilmark, MA 02535 | 512 N Rd |

### 19 Prime Cast Iron Steakhouse (ID: 49)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://19primesteak.com | http://19primesteak.com/ |
| address | 19 Church St, Edgartown, MA 02539 | 19 Church St |

### Alchemy (ID: 724)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://alchemyedgartown.com | https://www.alchemyedgartown.com/ |
| address | 71 Main St, Edgartown, MA 02539 | 71 Main Street |

### Among the Flowers (ID: 54)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://amongtheflowersmv.com | http://amongtheflowersmv.com/ |
| address | 17 Mayhew Ln, Edgartown, MA 02539 | Edgartown, ma 02539 |

### Atlantic (ID: 56)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://atlanticmv.com | http://atlanticmv.com/ |
| address | 2 Main St, Edgartown, MA 02539 | 2 Main StREET |

### Atria & Cafe Atria (ID: 712)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://atriamv.com | https://www.atriamv.com/ |
| address | 137 Main St, Edgartown, MA 02539 | 137 Main St |

### Bad Martha's Farmers Brewery (ID: 60)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://badmarthabeer.com | http://badmarthabeer.com/ |
| address | 270 Upper Main Street Edgartown, MA 02539 | 270 Upper Main St |

### Black Sheep (ID: 66)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://blacksheeponmv.com | http://blacksheeponmv.com/ |
| address | 17 Airport Rd, Edgartown, MA 02539 | 17 Airport Road |

### Blackbird Cafe (ID: 68)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| phone | (978) 263-7722 | (978) 272-1175 |
| website | https://myblackbirdcafe.com | http://myblackbirdcafe.com/ |
| address | 19 N Water St, Edgartown, MA 02539 | 19 North Water Street |

### Chesca's Restaurant (ID: 70)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://chescasmv.com | http://chescasmv.com/ |
| address | 38 N Water St, Edgartown, MA 02539 | 38 N Water St |

### China House (ID: 72)
- **Match Reason:** exact_name (score: 1.00)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://mvchinahouse.com | http://mvchinahouse.com/ |
| address | 234 Upper Main St, Edgartown, MA 02539 | Edgartown, MA 02539 |

### Cozy Corner (ID: 74)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://cozycornermv.com | https://cozycornermv.com/ |
| address | 238 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539 | Vineyard Haven Rd, Edgartown, MA 02539 |

### Detente (ID: 76)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| phone | (508) 627-8810 | (empty) |
| website | https://detentemv.com | http://detentemv.com/ |
| address | 15 Winter St, Edgartown, MA 02539 | Edgartown, MA 02539 |

### Edgartown Diner (ID: 722)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| address | 65 Main St, Edgartown, MA 02539 | (empty) |

### Edgartown Meat & Fish Market (ID: 83)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://edgartownmeatandfish.com | http://edgartownmeatandfish.com/ |
| address | 240 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539 | (empty) |

### Edgartown Pizza (ID: 721)
- **Match Reason:** website_match (score: 0.90)
- **Town:** Edgartown

| Field | Gazette | Existing |
|-------|---------|----------|
| website | https://edgartownpizza.com | http://edgartownpizza.com |
| address | 224 Edgartown Rd, Edgartown, MA 02539 | (empty) |


## New Businesses to Add

These businesses from the Gazette are not in our directory:

### General Business Information (89 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Alley's General Store | West Tisbury | (508) 693-0088 | - | high |
| Althea Designs | Vineyard Haven | (802) 777-5137 | [link](https://altheadesigns.com) | high |
| Basics Clothing Company | Oak Bluffs | (508) 524-3999 | [link](https://basicsandeastaway.company.site) | high |
| Bellezza Salon | Vineyard Haven | (508) 338-7140 | [link](https://bellezzamvsalon.com) | high |
| Benito's | Oak Bluffs | (508) 696-0033 | - | high |
| Bink's Auto | Oak Bluffs | (508) 693-2168 | [link](https://binks-auto.business.site) | high |
| Bruno's Transfer Station | Oak Bluffs | (508) 693-2187 | [link](https://brunosmv.com) | high |
| CB Stark Jewelers | Edgartown | (508) 627-1260 | [link](https://cbstark.com) | high |
| CB Stark Jewelers | Vineyard Haven | (508) 693-2284 | [link](https://cbstark.com) | high |
| Center for New Learning MV | - | (920) 410-4577 | [link](https://cnlmv.org) | high |
| Chicken Alley Thrift Shop | Vineyard Haven | (508) 693-2278 | [link](https://chickenalley.org) | high |
| Circuit Style Salon | Oak Bluffs | (508) 693-7542 | [link](https://circuitstylesalon.com) | high |
| Clothes To Go: | Vineyard Haven | (508) 801-0889 | [link](https://secure.myvanco.com/ygss/campaign/c-yjgr) | high |
| Cottage City Outdoor Equipment & Household Appliances | Oak Bluffs | (508) 693-2294 | - | high |
| Crane Appliance | Vineyard Haven | (508) 696-5891 | [link](https://craneappliance.com) | high |
| ... and 74 more | | | | |

### Restaurants (22 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Aquila | Aquinnah | - | [link](https://aquilamv.square.site) | high |
| Cliffhangers | Aquinnah | (508) 955-9163 | - | high |
| The Gay Head Store | Aquinnah | (508) 955-9142 | - | high |
| Chilmark Tavern | Chilmark | (508) 645-9400 | [link](https://chilmarktavern.com) | high |
| 19 Raw Oyster Bar | Edgartown | (774) 224-0550 | [link](https://19rawoysterbar.com) | high |
| Behind the Bookstore | Edgartown | (774) 549-9123 | [link](https://btbmv.com) | high |
| Bettini Restaurant | Edgartown | (508) 627-3761 | [link](https://harborviewhotel.com) | high |
| Dip02539 | Edgartown | (508) 627-7725 | - | high |
| Dock Street Coffee Shop | Edgartown | (508) 627-5232 | [link](https://dock-street-coffee-shop.square.site) | high |
| MacPhail's Corner Cafe | Edgartown | (508) 939-3090 | - | high |
| Quarterdeck | Edgartown | (508) 627-5346 | - | high |
| Slice of Edgartown | Edgartown | (508) 627-7641 | - | high |
| TacoMV | Edgartown | (774) 549-6944 | - | high |
| Town Bar & Grill | Edgartown | (774) 310-8696 | [link](https://townbarmv.com) | high |
| Aquila at the YMCA | Oak Bluffs | - | - | low |
| ... and 7 more | | | | |

### Lodging (15 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Ashley Inn | Edgartown | (508) 627-9655 | [link](https://ashleyinn.net) | high |
| Charles & Charles | Vineyard Haven | (508) 338-2351 | [link](https://charlesandcharlesmv.com) | high |
| Edgartown Commons | Edgartown | (508) 627-4671 | [link](https://edgartowncommons.com) | high |
| Greenwood House | Vineyard Haven | (508) 693-6150 | [link](https://greenwoodhouse.com) | high |
| Hob Knob Luxury Boutique Hotel & Spa | Edgartown | (508) 627-9510 | [link](https://hobknob.com) | high |
| Hostelling International Martha’s Vineyard | - | (508) 693-2665 | [link](https://hiusa.org) | high |
| Inkwell Beach Houes | Oak Bluffs | (508) 693-3955 | [link](https://inkwellbeach.com) | high |
| Kathleen’s Kottage | Oak Bluffs | (508) 863-2734 | [link](https://kkonmv.com) | high |
| Lambert’s Cove Inn & Resort | West Tisbury | (508) 422-8051 | [link](https://lambertscoveinn.com) | high |
| Martha’s Vineyard Family Campground | Edgartown | (508) 693-3772 | [link](https://campmv.com) | high |
| The Attleboro House | Oak Bluffs | (508) 693-4346 | [link](https://attleborohousemv.com) | high |
| The Beach Plum Inn | Chilmark | (508) 645-9454 | [link](https://beachpluminn.com) | high |
| The Christopher | Edgartown | (774) 563-8246 | [link](https://thechristophermv.com) | high |
| The Sydney | Edgartown | (508) 939-9299 | [link](https://theedgartowncollection.com) | high |
| Vineyard Harbor Motel | Vineyard Haven | (508) 693-3334 | [link](https://vineyardharbormotel.us) | high |

### Grocery Stores (7 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Ackee Tree Caribbean Grocer | Vineyard Haven | (508) 338-2521 | - | high |
| Cash & Carry | Vineyard Haven | (508) 693-7708 | - | high |
| Depot Market | Edgartown | (508) 669-7733 | - | high |
| Menemsha Texaco | Chilmark | (508) 645-2641 | - | high |
| Stop & Shop (Edgartown) | Edgartown | (508) 627-9522 | - | high |
| Stop & Shop (Vineyard Haven) | Vineyard Haven | (508) 693-8339 | - | high |
| TriMarket International Market | - | (774) 310-0712 | - | high |

### Arts & Culture (7 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Edgartown Cinemas | Edgartown | (508) 627-8008 | [link](https://entertainmentcinemas.com/locations/edgartown) | high |
| Martha’s Vineyard Museum | Vineyard Haven | (508) 627-4441 | [link](https://mvmuseum.org) | high |
| Martha’s Vineyard Playhouse | Vineyard Haven | (508) 696-6300 | [link](https://mvplayhouse.org) | high |
| Michael Johnson Photo Gallery | Vineyard Haven | (415) 238-7572 | [link](https://michaeljimage.com) | high |
| MVCMA Cottage Museum & Museum Shop | Oak Bluffs | (508) 693-5042 | [link](https://mvcma.org) | high |
| The Vineyard's Drive-In at the YMCA | Edgartown | (508) 560-2134 | [link](https://driveinmv.com) | high |
| The Workshop Gallery | Vineyard Haven | - | - | low |

### Package Stores (5 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Al's Package Store | Edgartown | (508) 627-4347 | - | high |
| Our Market | Oak Bluffs | (508) 693-3000 | - | high |
| The Vineyard Wine Shop | - | (508) 693-0943 | - | high |
| Wharf Wine & Spirits | Edgartown | (508) 627-5183 | - | high |
| Your Market | Edgartown | (508) 627-4000 | - | high |

### Health & Wellness (4 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Airport Fitness & Tennis | West Tisbury | (508) 696-8000 | [link](https://airportfitnessmv.com) | high |
| CrossFit MV | Vineyard Haven | (518) 727-9827 | [link](https://crossfitmarthasvineyard.com) | high |
| Strong Martha | West Tisbury | (774) 563-8296 | - | high |
| Vineyard Gynecology | West Tisbury | (508) 696-9946 | [link](https://vineyardgynecology.com) | high |

### Self Help Meetings (3 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Refuge Recovery | Vineyard Haven | - | [link](https://refugerecovery.org) | high |
| Smart Recovery | - | - | [link](https://smartrecovery.org) | high |
| Smart Recovery | - | - | [link](https://smartrecovery.org) | high |

### Transportation (3 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Cottage City Cab Company | - | (508) 693-3500 | - | high |
| Martha's Vineyard Taxi | - | (508) 693-8660 | - | high |
| Stagecoach Taxi | - | (508) 627-4566 | - | high |

### Pharmacies (2 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Stop & Shop Pharmacy | Edgartown | (508) 627-5107 | - | high |
| Vineyard Scripts | Vineyard Haven | (508) 693-7979 | [link](https://vineyardscripts.com) | high |

### Outdoor Activities (2 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Riverhead Disc Golf Course | Edgartown | - | - | low |
| Robinson Road Recreation Area | Edgartown | - | - | low |

### Farm Market & Stands (1 new)

| Name | Town | Phone | Website | Confidence |
|------|------|-------|---------|------------|
| Blackwater Farm | West Tisbury | - | - | low |


## Recommendations

### 1. Address Updates
223 businesses have better addresses in the Gazette data.
The Gazette includes full addresses with zip codes.

**Recommendation:** Update addresses from Gazette for businesses where our address is incomplete.

### 2. Website URL Normalization
228 website conflicts detected.
Most are minor differences (http vs https, trailing slashes).

**Recommendation:** Prefer https:// URLs and normalize format.

### 3. Phone Number Validation
69 phone conflicts detected.

**Recommendation:** Review phone conflicts manually - some may be updated numbers.

### 4. Duplicate Handling
18 businesses appear multiple times in Gazette data.

**Recommendation:** Deduplicate before import.

### 5. New Business Review
160 potential new businesses identified.
- High confidence (has phone or website): 152
- Low confidence (no contact info): 8

**Recommendation:** Prioritize adding high-confidence businesses first.

## Next Steps

1. Review this audit report
2. Approve categories of updates to apply
3. Run the migration script with approved changes
4. Verify changes in admin dashboard
