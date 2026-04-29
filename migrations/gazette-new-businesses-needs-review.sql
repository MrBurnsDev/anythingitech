-- Gazette New Businesses Migration (needs_review)
-- Generated: 2026-04-29T03:08:50.006Z
-- Policy: Insert high-confidence new businesses with status=needs_review
-- Total new businesses: 137

BEGIN;

-- Aquila (Aquinnah)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Aquila',
  'aquila-aquinnah',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Aquinnah',
  'aquinnah',
  '17 Aquinnah Cir, Aquinnah, MA 02535',
  NULL,
  'https://aquilamv.square.site',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Cliffhangers (Aquinnah)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Cliffhangers',
  'cliffhangers-aquinnah',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Aquinnah',
  'aquinnah',
  '23 Aquinnah Cir, Aquinnah, MA 02535',
  '(508) 955-9163',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Chilmark Tavern (Chilmark)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Chilmark Tavern',
  'chilmark-tavern-chilmark',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Chilmark',
  'chilmark',
  '9 State Rd, Chilmark, MA 02535',
  '(508) 645-9400',
  'https://chilmarktavern.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- 19 Raw Oyster Bar (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  '19 Raw Oyster Bar',
  '19-raw-oyster-bar-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '19 Church St, Edgartown, MA 02539',
  '(774) 224-0550',
  'https://19rawoysterbar.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Behind the Bookstore (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Behind the Bookstore',
  'behind-the-bookstore-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '46 Main St, Edgartown, MA 02539',
  '(774) 549-9123',
  'https://btbmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Bettini Restaurant (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Bettini Restaurant',
  'bettini-restaurant-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '131 N Water St, Edgartown, MA 02539',
  '(508) 627-3761',
  'https://harborviewhotel.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Dip02539 (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Dip02539',
  'dip02539-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '241 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 627-7725',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Dock Street Coffee Shop (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Dock Street Coffee Shop',
  'dock-street-coffee-shop-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '2 Dock St, Edgartown, MA 02539',
  '(508) 627-5232',
  'https://dock-street-coffee-shop.square.site',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- MacPhail's Corner Cafe (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'MacPhail''s Corner Cafe',
  'macphails-corner-cafe-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '18 Dock St, Edgartown, MA 02539',
  '(508) 939-3090',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Quarterdeck (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Quarterdeck',
  'quarterdeck-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '29 Dock St, Edgartown, MA 02539',
  '(508) 627-5346',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Slice of Edgartown (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Slice of Edgartown',
  'slice-of-edgartown-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '18 Dock St, Edgartown, MA 02539',
  '(508) 627-7641',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- TacoMV (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'TacoMV',
  'tacomv-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '32 Winter St, Edgartown, MA 02539',
  '(774) 549-6944',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Town Bar & Grill (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Town Bar & Grill',
  'town-bar-and-grill-edgartown',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Edgartown',
  'edgartown',
  '227 Upper Main St, Edgartown, MA 02539',
  '(774) 310-8696',
  'https://townbarmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Aquila at the YMCA (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Aquila at the YMCA',
  'aquila-at-the-ymca-oak-bluffs',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Oak Bluffs',
  'oak-bluffs',
  '111R Edgartown Vineyard Haven Rd, Oak Bluffs, MA 02557',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Big Dipper Ice Cream & Cafe (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Big Dipper Ice Cream & Cafe',
  'big-dipper-ice-cream-and-cafe-oak-bluffs',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Oak Bluffs',
  'oak-bluffs',
  '23 Lake Ave, Oak Bluffs, MA 02557',
  '(508) 693-4845',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Carousel Ice Cream Factory (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Carousel Ice Cream Factory',
  'carousel-ice-cream-factory-oak-bluffs',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Oak Bluffs',
  'oak-bluffs',
  '15 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 696-8614',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Enchanted Chocolates (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Enchanted Chocolates',
  'enchanted-chocolates-oak-bluffs',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Oak Bluffs',
  'oak-bluffs',
  '4 Chapman Ave, Oak Bluffs, MA 02557',
  '(508) 693-8331',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Food Truck (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Food Truck',
  'the-food-truck-oak-bluffs',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Oak Bluffs',
  'oak-bluffs',
  '91 Edgartown Vineyard Haven Rd, Oak Bluffs, MA 02557',
  '(508) 560-5883',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Cumberland Farms (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Cumberland Farms',
  'cumberland-farms-vineyard-haven',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Vineyard Haven',
  'vineyard-haven',
  '9 Lagoon Pond, Vineyard Haven, MA 02568',
  '(508) 693-8729',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Plane View Restaurant (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Plane View Restaurant',
  'plane-view-restaurant-vineyard-haven',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Vineyard Haven',
  'vineyard-haven',
  '71 Airport Rd, Vineyard Haven, MA 02568',
  '(508) 693-1886',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Woodland Grill (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Woodland Grill',
  'woodland-grill-vineyard-haven',
  'Restaurants',
  'restaurants-food-beverages',
  'Restaurants',
  'Vineyard Haven',
  'vineyard-haven',
  '455 State Rd Unit 4, Vineyard Haven, MA 02568',
  '(508) 693-6795',
  'https://woodlandvarietyandgrill.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Blackwater Farm (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Blackwater Farm',
  'blackwater-farm-west-tisbury',
  'Farms',
  'restaurants-food-beverages',
  'Farms',
  'West Tisbury',
  'west-tisbury',
  '40 Cottle Ln, West Tisbury, MA',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Ackee Tree Caribbean Grocer (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Ackee Tree Caribbean Grocer',
  'ackee-tree-caribbean-grocer-vineyard-haven',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Vineyard Haven',
  'vineyard-haven',
  '25 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 338-2521',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Cash & Carry (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Cash & Carry',
  'cash-and-carry-vineyard-haven',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Vineyard Haven',
  'vineyard-haven',
  '10 Carrolls Way, Vineyard Haven, MA 02568',
  '(508) 693-7708',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Depot Market (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Depot Market',
  'depot-market-edgartown',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Edgartown',
  'edgartown',
  '141 Upper Main St, Edgartown, MA 02539',
  '(508) 669-7733',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Menemsha Texaco (Chilmark)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Menemsha Texaco',
  'menemsha-texaco-chilmark',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Chilmark',
  'chilmark',
  'Basin Rd, Chilmark, MA 02535',
  '(508) 645-2641',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Stop & Shop (Edgartown) (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Stop & Shop (Edgartown)',
  'stop-and-shop-edgartown-edgartown',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Edgartown',
  'edgartown',
  '225 Upper Main St, Edgartown, MA 02539',
  '(508) 627-9522',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Stop & Shop (Vineyard Haven) (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Stop & Shop (Vineyard Haven)',
  'stop-and-shop-vineyard-haven-vineyard-haven',
  'Grocery Stores',
  'restaurants-food-beverages',
  'Grocery Stores',
  'Vineyard Haven',
  'vineyard-haven',
  '50 Water St, Vineyard Haven, MA 02568',
  '(508) 693-8339',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Al's Package Store (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Al''s Package Store',
  'als-package-store-edgartown',
  'Wine & Spirits',
  'shopping-and-specialty-retail',
  'Wine & Spirits',
  'Edgartown',
  'edgartown',
  '258 Upper Main St, Edgartown, MA 02539',
  '(508) 627-4347',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Our Market (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Our Market',
  'our-market-oak-bluffs',
  'Wine & Spirits',
  'shopping-and-specialty-retail',
  'Wine & Spirits',
  'Oak Bluffs',
  'oak-bluffs',
  '1 E Chop Dr, Oak Bluffs, MA 02557',
  '(508) 693-3000',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Wharf Wine & Spirits (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Wharf Wine & Spirits',
  'wharf-wine-and-spirits-edgartown',
  'Wine & Spirits',
  'shopping-and-specialty-retail',
  'Wine & Spirits',
  'Edgartown',
  'edgartown',
  '8 Mayhew Ln, Edgartown, MA 02539',
  '(508) 627-5183',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Your Market (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Your Market',
  'your-market-edgartown',
  'Wine & Spirits',
  'shopping-and-specialty-retail',
  'Wine & Spirits',
  'Edgartown',
  'edgartown',
  '249 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 627-4000',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Stop & Shop Pharmacy (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Stop & Shop Pharmacy',
  'stop-and-shop-pharmacy-edgartown',
  'Pharmacies',
  'medical-services-and-providers',
  'Pharmacies',
  'Edgartown',
  'edgartown',
  '245 Vineyard Haven Road, Edgartown, MA 02539',
  '(508) 627-5107',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Vineyard Scripts (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Vineyard Scripts',
  'vineyard-scripts-vineyard-haven',
  'Pharmacies',
  'medical-services-and-providers',
  'Pharmacies',
  'Vineyard Haven',
  'vineyard-haven',
  '117 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-7979',
  'https://vineyardscripts.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Cinemas (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Cinemas',
  'edgartown-cinemas-edgartown',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Edgartown',
  'edgartown',
  '65 Main St #8234, Edgartown, MA 02539',
  '(508) 627-8008',
  'https://entertainmentcinemas.com/locations/edgartown',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha’s Vineyard Museum (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha’s Vineyard Museum',
  'martha-s-vineyard-museum-vineyard-haven',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Vineyard Haven',
  'vineyard-haven',
  '151 Lagoon Pond Rd, Vineyard Haven, MA 02568',
  '(508) 627-4441',
  'https://mvmuseum.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha’s Vineyard Playhouse (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha’s Vineyard Playhouse',
  'martha-s-vineyard-playhouse-vineyard-haven',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Vineyard Haven',
  'vineyard-haven',
  '24 Church St, Vineyard Haven, MA 02568',
  '(508) 696-6300',
  'https://mvplayhouse.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Michael Johnson Photo Gallery (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Michael Johnson Photo Gallery',
  'michael-johnson-photo-gallery-vineyard-haven',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Vineyard Haven',
  'vineyard-haven',
  '34 A Main St. Vineyard Haven 02568',
  '(415) 238-7572',
  'https://michaeljimage.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- MVCMA Cottage Museum & Museum Shop (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'MVCMA Cottage Museum & Museum Shop',
  'mvcma-cottage-museum-and-museum-shop-oak-bluffs',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Oak Bluffs',
  'oak-bluffs',
  '1 Trinity Park, Oak Bluffs, MA 02568',
  '(508) 693-5042',
  'https://mvcma.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Vineyard's Drive-In at the YMCA (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Vineyard''s Drive-In at the YMCA',
  'the-vineyards-drive-in-at-the-ymca-edgartown',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Edgartown',
  'edgartown',
  '111R Edgartown Vineyard Haven Rd, Vineyard Haven, MA',
  '(508) 560-2134',
  'https://driveinmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Workshop Gallery (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Workshop Gallery',
  'the-workshop-gallery-vineyard-haven',
  'Arts & Culture',
  'arts-and-entertainment',
  'Arts & Culture',
  'Vineyard Haven',
  'vineyard-haven',
  '32 Beach Rd, Vineyard Haven, MA 02568',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Riverhead Disc Golf Course (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Riverhead Disc Golf Course',
  'riverhead-disc-golf-course-edgartown',
  'Outdoor Activities',
  'arts-and-entertainment',
  'Outdoor Activities',
  'Edgartown',
  'edgartown',
  'Barnes Road, Edgartown, MA 02539',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Robinson Road Recreation Area (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Robinson Road Recreation Area',
  'robinson-road-recreation-area-edgartown',
  'Outdoor Activities',
  'arts-and-entertainment',
  'Outdoor Activities',
  'Edgartown',
  'edgartown',
  '7 Marchants Path, Edgartown, MA 02539',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Refuge Recovery (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Refuge Recovery',
  'refuge-recovery-vineyard-haven',
  'Community Organizations',
  'family-community-government',
  'Community Organizations',
  'Vineyard Haven',
  'vineyard-haven',
  'In-person on Tuesdays starting at 5:30 p.m. at the Vineyard House in Vineyard Haven and online meetings',
  NULL,
  'https://refugerecovery.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Airport Fitness & Tennis (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Airport Fitness & Tennis',
  'airport-fitness-and-tennis-west-tisbury',
  'Health & Wellness',
  'beauty-and-wellness',
  'Health & Wellness',
  'West Tisbury',
  'west-tisbury',
  '24 Airport Rd, West Tisbury MA 02575',
  '(508) 696-8000',
  'https://airportfitnessmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- CrossFit MV (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'CrossFit MV',
  'crossfit-mv-vineyard-haven',
  'Health & Wellness',
  'beauty-and-wellness',
  'Health & Wellness',
  'Vineyard Haven',
  'vineyard-haven',
  '114 Cook Rd, Vineyard Haven, MA 02568',
  '(518) 727-9827',
  'https://crossfitmarthasvineyard.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Strong Martha (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Strong Martha',
  'strong-martha-west-tisbury',
  'Health & Wellness',
  'beauty-and-wellness',
  'Health & Wellness',
  'West Tisbury',
  'west-tisbury',
  '505 State Rd, West Tisbury, MA 02575',
  '(774) 563-8296',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Vineyard Gynecology (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Vineyard Gynecology',
  'vineyard-gynecology-west-tisbury',
  'Health & Wellness',
  'beauty-and-wellness',
  'Health & Wellness',
  'West Tisbury',
  'west-tisbury',
  '20 Indian Hill Road West Tisbury, MA 02575',
  '(508) 696-9946',
  'https://vineyardgynecology.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Ashley Inn (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Ashley Inn',
  'ashley-inn-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '129 Main St, Edgartown, MA 0253',
  '(508) 627-9655',
  'https://ashleyinn.net',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Charles & Charles (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Charles & Charles',
  'charles-and-charles-vineyard-haven',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Vineyard Haven',
  'vineyard-haven',
  '85 Summer St, Vineyard Haven, MA 02568',
  '(508) 338-2351',
  'https://charlesandcharlesmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Commons (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Commons',
  'edgartown-commons-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '20 Peases Point Way, Edgartown, MA 02539',
  '(508) 627-4671',
  'https://edgartowncommons.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Greenwood House (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Greenwood House',
  'greenwood-house-vineyard-haven',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Vineyard Haven',
  'vineyard-haven',
  '40 Greenwood Ave, Vineyard Haven, MA 02568',
  '(508) 693-6150',
  'https://greenwoodhouse.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Hob Knob Luxury Boutique Hotel & Spa (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Hob Knob Luxury Boutique Hotel & Spa',
  'hob-knob-luxury-boutique-hotel-and-spa-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '128 Main St, Edgartown, MA 02539',
  '(508) 627-9510',
  'https://hobknob.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Inkwell Beach Houes (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Inkwell Beach Houes',
  'inkwell-beach-houes-oak-bluffs',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Oak Bluffs',
  'oak-bluffs',
  '83 Seaview Ave, Oak Bluffs, MA 02557',
  '(508) 693-3955',
  'https://inkwellbeach.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Kathleen’s Kottage (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Kathleen’s Kottage',
  'kathleen-s-kottage-oak-bluffs',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Oak Bluffs',
  'oak-bluffs',
  '53 Naushon Ave Oak Bluffs, MA 02557',
  '(508) 863-2734',
  'https://kkonmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Lambert’s Cove Inn & Resort (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Lambert’s Cove Inn & Resort',
  'lambert-s-cove-inn-and-resort-west-tisbury',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'West Tisbury',
  'west-tisbury',
  '90 Manaquayak Rd, West Tisbury, MA 02575',
  '(508) 422-8051',
  'https://lambertscoveinn.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha’s Vineyard Family Campground (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha’s Vineyard Family Campground',
  'martha-s-vineyard-family-campground-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '569 Edgartown-Vineyard Haven Rd, Vineyard Haven, MA 02568',
  '(508) 693-3772',
  'https://campmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Attleboro House (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Attleboro House',
  'the-attleboro-house-oak-bluffs',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Oak Bluffs',
  'oak-bluffs',
  '42 Lake Ave, Oak Bluffs, MA 02557',
  '(508) 693-4346',
  'https://attleborohousemv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Beach Plum Inn (Chilmark)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Beach Plum Inn',
  'the-beach-plum-inn-chilmark',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Chilmark',
  'chilmark',
  '50 Beach Plum Ln, Menemsha, MA 02552',
  '(508) 645-9454',
  'https://beachpluminn.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Christopher (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Christopher',
  'the-christopher-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '24 S Water St, Edgartown, MA 02539',
  '(774) 563-8246',
  'https://thechristophermv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Sydney (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Sydney',
  'the-sydney-edgartown',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Edgartown',
  'edgartown',
  '22 Winter St, Edgartown, MA 02539',
  '(508) 939-9299',
  'https://theedgartowncollection.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Vineyard Harbor Motel (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Vineyard Harbor Motel',
  'vineyard-harbor-motel-vineyard-haven',
  'Hotels',
  'lodging-and-tourism',
  'Hotels',
  'Vineyard Haven',
  'vineyard-haven',
  '60 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-3334',
  'https://vineyardharbormotel.us',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Alley's General Store (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Alley''s General Store',
  'alleys-general-store-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '1045 State Rd, West Tisbury, MA 02575',
  '(508) 693-0088',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Althea Designs (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Althea Designs',
  'althea-designs-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '34 Anchor Wy, Vineyard Haven, MA 02568',
  '(802) 777-5137',
  'https://altheadesigns.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Basics Clothing Company (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Basics Clothing Company',
  'basics-clothing-company-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '24 Circuit Ave C, Oak Bluffs, MA 02557',
  '(508) 524-3999',
  'https://basicsandeastaway.company.site',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Bellezza Salon (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Bellezza Salon',
  'bellezza-salon-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '457 A State Rd, Vineyard Haven, MA 02568',
  '(508) 338-7140',
  'https://bellezzamvsalon.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Benito's (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Benito''s',
  'benitos-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '38 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 696-0033',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Bink's Auto (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Bink''s Auto',
  'binks-auto-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '29 Winthrop Ave, Oak Bluffs, MA 02557',
  '(508) 693-2168',
  'https://binks-auto.business.site',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Bruno's Transfer Station (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Bruno''s Transfer Station',
  'brunos-transfer-station-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '16 Pennsylvania Ave, Oak Bluffs, MA 02557',
  '(508) 693-2187',
  'https://brunosmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Chicken Alley Thrift Shop (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Chicken Alley Thrift Shop',
  'chicken-alley-thrift-shop-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '38 Lagoon Pond Rd, Vineyard Haven, MA 02568',
  '(508) 693-2278',
  'https://chickenalley.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Circuit Style Salon (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Circuit Style Salon',
  'circuit-style-salon-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '47 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-7542',
  'https://circuitstylesalon.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Clothes To Go: (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Clothes To Go:',
  'clothes-to-go-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  'Stone Church, Vineyard Haven, MA 02568',
  '(508) 801-0889',
  'https://secure.myvanco.com/ygss/campaign/c-yjgr',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Cottage City Outdoor Equipment & Household Appliances (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Cottage City Outdoor Equipment & Household Appliances',
  'cottage-city-outdoor-equipment-and-household-appliances-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '101 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-2294',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Crane Appliance (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Crane Appliance',
  'crane-appliance-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '529 State Rd, Vineyard Haven, MA 02568',
  '(508) 696-5891',
  'https://craneappliance.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Cycle Works-MV (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Cycle Works-MV',
  'cycle-works-mv-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '351 State Rd, Vineyard Haven, MA 02568',
  '(508) 693-6966',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- deBettencourts Service Station (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'deBettencourts Service Station',
  'debettencourts-service-station-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '83 New York Ave, Oak Bluffs, MA 02557',
  '(508) 693-0751',
  'https://debettencourtsservicestation.weebly.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Donaroma's (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Donaroma''s',
  'donaromas-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '270 Upper Main St, Edgartown, MA 02539',
  '(508) 241-1269',
  'https://donaromas.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- E. C. Cottles (Airport) (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'E. C. Cottles (Airport)',
  'e-c-cottles-airport-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '21 E Line Rd, Edgartown, MA 02539',
  '(508) 338-2335',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- East Chop Sleep Shop (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'East Chop Sleep Shop',
  'east-chop-sleep-shop-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '395 State Rd, Vineyard Haven, MA 02568',
  '(508) 693-5911',
  'https://eastchopsleepshop.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Eastaway Clothing (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Eastaway Clothing',
  'eastaway-clothing-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '20 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-8487',
  'https://basicsandeastaway.company.site',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Books (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Books',
  'edgartown-books-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '44 Main St, Edgartown, MA 02539',
  '(508) 627-8463',
  'https://edgartownbooks.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown District Court (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown District Court',
  'edgartown-district-court-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '81 Main St, Edgartown, MA 02539',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Hardware (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Hardware',
  'edgartown-hardware-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '61 Edgartown Rd, Edgartown, MA 02539',
  '(508) 627-4338',
  'https://edgartownhardware.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Hardware Paint Store (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Hardware Paint Store',
  'edgartown-hardware-paint-store-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '15 Merchant’s Mart, Vineyard Haven, MA 02568',
  '(508) 338-2157',
  'https://edgartownhardware.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Edgartown Paper Store (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Edgartown Paper Store',
  'edgartown-paper-store-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '25 Main St, Edgartown, MA 02539',
  NULL,
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Francois' Expert Tailoring & Alterations (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Francois'' Expert Tailoring & Alterations',
  'francois-expert-tailoring-and-alterations-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '107 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 627-9393',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Gypsy Barbershop (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Gypsy Barbershop',
  'gypsy-barbershop-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '224 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 939-4551',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Howes House (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Howes House',
  'howes-house-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '1042 State Rd, West Tisbury, MA 02575',
  '(508) 693-2896',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Island Aesthetics (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Island Aesthetics',
  'island-aesthetics-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '8 Union St, Vineyard Haven, MA 02568',
  '(774) 563-5708',
  'https://islandaestheticsmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Island Music (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Island Music',
  'island-music-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '58 Main St, Vineyard Haven, MA 02568',
  '(508) 693-8596',
  'https://islandmusicmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Island Puff n Pass (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Island Puff n Pass',
  'island-puff-n-pass-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '15 Main St, Vineyard Haven, MA 02568',
  '(508) 687-9228',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Island Tire & Auto Service (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Island Tire & Auto Service',
  'island-tire-and-auto-service-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '19 Kate''s Way, Vineyard Haven, MA 02568',
  '(508) 693-3901',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Jardin Mahoney's (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Jardin Mahoney''s',
  'jardin-mahoneys-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '541 County Rd, Oak Bluffs, MA 02557',
  '(508) 693-3511',
  'https://jardinmahoneymv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- John Keene Excavation (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'John Keene Excavation',
  'john-keene-excavation-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '25 Old Stage Rd, West Tisbury, MA 02575',
  '(508) 693-5975',
  'https://johnkeene.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- King's Barbershop (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'King''s Barbershop',
  'kings-barbershop-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '395 State Rd, Vineyard Haven, MA 02568',
  '(508) 338-7853',
  'https://kingsbarbershopmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Kismet Outfitters (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Kismet Outfitters',
  'kismet-outfitters-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '204 Upper Main St, Edgartown, MA 02539',
  '(774) 549-5921',
  'https://kismetoutfitters.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Maggie's Salon (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Maggie''s Salon',
  'maggies-salon-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '31 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-2875',
  'https://maggiessalon.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Bank (Chilmark) (Chilmark)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Bank (Chilmark)',
  'marthas-vineyard-bank-chilmark-chilmark',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Chilmark',
  'chilmark',
  '517 South Street, Chilmark, MA 02535',
  '(508) 627-4266',
  'https://mvbank.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Bank (Main Street) (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Bank (Main Street)',
  'marthas-vineyard-bank-main-street-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '78 Main St, Edgartown, MA 02539',
  '(508) 627-4266',
  'https://mvbank.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Bank (The Triangle) (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Bank (The Triangle)',
  'marthas-vineyard-bank-the-triangle-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '236 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 627-4266',
  'https://mvbank.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Bank (West Tisbury) (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Bank (West Tisbury)',
  'marthas-vineyard-bank-west-tisbury-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '490 State Rd, West Tisbury, MA 02575',
  '(508) 627-4266',
  'https://mvbank.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Shipyard (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Shipyard',
  'marthas-vineyard-shipyard-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '164 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-0400',
  'https://mvshipyard.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha's Vineyard Tile Co. (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha''s Vineyard Tile Co.',
  'marthas-vineyard-tile-co-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '123 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-9707',
  'https://mvtileco.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha’s Vineyard Center for Living (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha’s Vineyard Center for Living',
  'martha-s-vineyard-center-for-living-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '29 Breakdown Ln, Vineyard Haven, MA 02568',
  '(508) 939-9440',
  'https://mvcenter4living.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Martha’s Vineyard Family Center (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Martha’s Vineyard Family Center',
  'martha-s-vineyard-family-center-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '35 Greenwood Ave, Vineyard Haven, MA 02568',
  '(508) 687-9182',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- McCurdy Motorcars (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'McCurdy Motorcars',
  'mccurdy-motorcars-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '199 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-5532',
  'https://mccurdymotorcars.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Medeiros Appliance (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Medeiros Appliance',
  'medeiros-appliance-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '11 Evelyn Way # C, Vineyard Haven, MA 02568',
  '(508) 693-4270',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Middletown Nursery (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Middletown Nursery',
  'middletown-nursery-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '680 State Rd, West Tisbury, MA 02575',
  '(508) 696-7600',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Mosher Photo (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Mosher Photo',
  'mosher-photo-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '249 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 693-9430',
  'https://mosherphoto.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Panache Hair Salon (West Tisbury)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Panache Hair Salon',
  'panache-hair-salon-west-tisbury',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'West Tisbury',
  'west-tisbury',
  '4 Cournoyer Rd #5, West Tisbury, MA 02575',
  '(508) 696-8868',
  'https://panachesalonmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Past & Presents Antiques (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Past & Presents Antiques',
  'past-and-presents-antiques-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '37 Main St, Edgartown, MA 02539',
  '(508) 627-6686',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Pedego Electric Bikes (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Pedego Electric Bikes',
  'pedego-electric-bikes-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '9 Oak Bluffs Ave, Oak Bluffs, MA 02557',
  '(508) 693-0515',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Phillips Hardware: (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Phillips Hardware:',
  'phillips-hardware-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '30 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-0377',
  'https://phillipshardwaremv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Pirates Puzzle Escape Room (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Pirates Puzzle Escape Room',
  'pirates-puzzle-escape-room-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '23 Winter St #18, Edgartown, MA 02539',
  NULL,
  'https://marthasvineyardescaperoom.com/escape-room-pirates-puzzle',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Portobello Road (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Portobello Road',
  'portobello-road-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '4 Dock St, Edgartown, MA 02539',
  '(508) 627-4276',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Rockland Trust Stop & Shop Branch (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Rockland Trust Stop & Shop Branch',
  'rockland-trust-stop-and-shop-branch-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '257 Upper Main St, Edgartown, MA 02539',
  '(508) 627-1140',
  'https://rocklandtrust.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- SBS (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'SBS',
  'sbs-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '480 State Rd, Vineyard Haven, MA 02568',
  '(508) 696-7271',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Sea Legs (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Sea Legs',
  'sea-legs-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '13 Dock St, Edgartown, MA 02539',
  '(603) 489-9155',
  'https://sealegsmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Shirley's Hardware (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Shirley''s Hardware',
  'shirleys-hardware-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '374 State Rd, Vineyard Haven, MA 02568',
  '(508) 693-3070',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Shirt Tales (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Shirt Tales',
  'shirt-tales-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '61 Main St, Edgartown, MA 02539',
  '(508) 627-3766',
  'https://shirttalesmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Slip 77 (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Slip 77',
  'slip-77-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '19 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 687-9975',
  'https://slip77.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Sole (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Sole',
  'sole-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '37 Main St, Edgartown, MA 02539',
  '(508) 267-5677',
  'https://solemv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Summer Shades (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Summer Shades',
  'summer-shades-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '36 Main St, Edgartown, MA 02539',
  '(508) 627-3294',
  'https://summershadessunglasses.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Talita Destefani Beauty Lounge (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Talita Destefani Beauty Lounge',
  'talita-destefani-beauty-lounge-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '18 State Rd, Vineyard Haven, MA 02568',
  '(508) 560-0058',
  'https://talitadestefani.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Corner Store (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Corner Store',
  'the-corner-store-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '24 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-1470',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Green Room (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Green Room',
  'the-green-room-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '71 Main St, Vineyard Haven, MA 02568',
  '(508) 693-6888',
  'https://greenroommv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Shoe Store (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Shoe Store',
  'the-shoe-store-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '65 Main Street Unit 13, Vineyard Haven, MA 02568',
  '(508) 693-6888',
  'https://greenroommv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- The Trust Shop (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'The Trust Shop',
  'the-trust-shop-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '9 Main St, Vineyard Haven, MA 02568',
  '(508) 693-4445',
  'https://tanyarust.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Third World Trading Co (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Third World Trading Co',
  'third-world-trading-co-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '52 Circuit Ave, Oak Bluffs, MA 02557',
  '(508) 693-5550',
  'https://thirdworldtrading.com/index.htm',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Tisbury Council on Aging (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Tisbury Council on Aging',
  'tisbury-council-on-aging-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '34 Pine Tree Rd, Vineyard Haven, MA 02568',
  '(508) 696-4205',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Tisbury Toy Box (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Tisbury Toy Box',
  'tisbury-toy-box-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '79 Beach Rd, Vineyard Haven, MA 02568',
  '(508) 693-8182',
  'https://tisburytoybox.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Trader Fred's (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Trader Fred''s',
  'trader-freds-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '249D Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  '(508) 627-0413',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- UPS Store (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'UPS Store',
  'ups-store-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '455 State Rd, Vineyard Haven, MA 02568',
  '(508) 696-0600',
  NULL,
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Vineyard Family Tennis (Oak Bluffs)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Vineyard Family Tennis',
  'vineyard-family-tennis-oak-bluffs',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Oak Bluffs',
  'oak-bluffs',
  '618 Barnes Rd, Oak Bluffs, MA 02557',
  '(508) 693-7762',
  'https://vineyardfamilytennis.org',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Vineyard Home Center (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Vineyard Home Center',
  'vineyard-home-center-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '454 State Rd, Vineyard Haven, MA 02568',
  '(508) 693-3227',
  'https://vineyardhomecenter.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Wheel Happy Bike Shop (Edgartown)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Wheel Happy Bike Shop',
  'wheel-happy-bike-shop-edgartown',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Edgartown',
  'edgartown',
  '8 S Water St, Edgartown, MA 02539',
  '(508) 627-5928',
  'https://wheelhappybicycles.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

-- Wind's Up (Vineyard Haven)
INSERT INTO businesses (
  name, slug, category, business_type, subcategory,
  town, town_slug, address, phone, website,
  status, confidence, verification_source, last_verified_at,
  created_at, updated_at
) VALUES (
  'Wind''s Up',
  'winds-up-vineyard-haven',
  'General Business',
  'shopping-and-specialty-retail',
  'General Business',
  'Vineyard Haven',
  'vineyard-haven',
  '199 Anchor Wy, Vineyard Haven, MA 02568',
  '(508) 693-4252',
  'https://windsupmv.com',
  'needs_review',
  50,
  'vineyard_gazette_business_directory',
  NOW(),
  NOW(),
  NOW()
);

COMMIT;

-- Summary:
-- High-confidence new businesses: 137
-- Excluded (low confidence): 9
