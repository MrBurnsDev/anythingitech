-- Businesses 2 New Records (NEEDS REVIEW)
-- Generated: 2026-04-29T03:21:07.193Z
-- All records are staged as needs_review with is_public=false
-- Total new businesses: 196

BEGIN;

-- Martha's Vineyard Rentals (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Rentals',
  'marthas-vineyard-rentals',
  'Vineyard Haven',
  '13 Beach Street Ext #8, Vineyard Haven',
  '(508) 687-1111',
  'https://marthasvineyardrentals.org',
  'Martha''s Vineyard Rentals has a great variety of vacation rental homes - from affordable cottages and apartments island-wide to luxury ocean view mansions with pools.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Charles and Charles MV (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Charles and Charles MV',
  'charles-and-charles-mv',
  'Vineyard Haven',
  'Intimate boutique inn and guest apartments with swimming pool, 10 min stroll from downtown Vineyard Haven.',
  NULL,
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Hob Knob (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Hob Knob',
  'hob-knob',
  'Edgartown',
  '128 Upper Main St, Edgartown',
  '(508) 627-9510',
  NULL,
  'Imagine the perfect upscale getaway on the island of Martha’s Vineyard, with exceptional personal service and comfort in a relaxed, elegant setting.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Island Inn (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Island Inn',
  'island-inn',
  'Oak Bluffs',
  'Located on the golf course in Oak Bluffs.',
  '(508) 693-2002',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Driftwood of Martha's Vineyard (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Driftwood of Martha''s Vineyard',
  'the-driftwood-of-marthas-vineyard',
  'Vineyard Haven',
  '76 Leonard Circle, Vineyard Haven',
  '(860) 930-0233',
  NULL,
  'A year-round Bed & Breakfast with 3 private rooms and Vineyard style continental breakfast. Central A/C, Wi-Fi, on-site parking cable, flat screen tv and refrigerator in each room.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Attleboro House Inn (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Attleboro House Inn',
  'the-attleboro-house-inn',
  'Oak Bluffs',
  'A fifth generation run family historic inn with quaint atmosphere and modern amenities. Stay in our completely renovated in 2018 gingerbread cottage directly on the Oak Bluffs harbor. Standard and deluxe guest rooms are available.',
  '(508) 693-4346',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Cleaveland House B&B (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Cleaveland House B&B',
  'cleaveland-house-bb',
  'Edgartown',
  '620 Edgartown - West Tisbury Rd, West Tisbury',
  '(508) 693-9352',
  NULL,
  'B&B with 3 guest rooms on the second floor sharing the same bath, continental breakfast included. Meeting place for Island intellectuals.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Family Campground (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Family Campground',
  'marthas-vineyard-family-campground',
  'Vineyard Haven',
  '569 Edgartown Rd, vineyard Haven',
  '(508) 693-3772',
  NULL,
  'Martha’s Vineyard Family Campground is the only camping site on Martha’s Vineyard.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Harbor Landing (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Harbor Landing',
  'harbor-landing',
  'Vineyard Haven',
  '15 Beach St, Vineyard Haven',
  '(508) 693-2600',
  NULL,
  'operates as a timeshare resort for 30 weeks a year,',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Kelley House (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Kelley House',
  'kelley-house',
  'Edgartown',
  'Comfortable, relaxed seaside vibe hotel nestled in the heart of downtown Edgartown with pool, Wave Bar, and a restaurant.',
  '(508) 627-7900',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The 1720 House B&B (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The 1720 House B&B',
  'the-1720-house-bb',
  'Vineyard Haven',
  'An award winning Martha''s Vineyard Bed & Breakfast located in the charming historic district of Vineyard Haven.',
  '(508) 693-6407',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Lorraine Parish’s Bedroom Suites (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Lorraine Parish’s Bedroom Suites',
  'lorraine-parishs-bedroom-suites',
  'Vineyard Haven',
  '2 pet friendly guest rooms located above Lorraine Parish’s boutique, located in-town Vineyard Haven. Rooms with private bath, cable, Wi-Fi, refrigerator, microwave and coffeemaker provided en-suite.',
  '(508) 693-9044',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Fourway Carriage House Apartments (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Fourway Carriage House Apartments',
  'fourway-carriage-house-apartments',
  'Vineyard Haven',
  '95 Franklin St, Vineyard Haven',
  '(508) 696-8487',
  NULL,
  'Fourway provides accommodations for up to 15 guests perfectly for your getaway, reunion, wedding, or gathering. Quiet, exquisite setting, English garden just two blocks from downtown.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Lambert's Cove Inn, Farm & Restaurant (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Lambert''s Cove Inn, Farm & Restaurant',
  'lamberts-cove-inn-farm-restaurant',
  'West Tisbury',
  '90 Manaquayak Road,, West Tisbury',
  '(800) 535-0272',
  NULL,
  'Our charming newly renovated Inn is a restored farmhouse from 1790 and has 15 guest rooms, a general store and an award-winning restaurant.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Tivoli Inn (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Tivoli Inn',
  'tivoli-inn',
  'Oak Bluffs',
  '125 Circuit Ave, Oak Bluffs',
  '(508) 693-7928',
  NULL,
  'The Tivoli Inn is a lovely gingerbread house which has the island charm and exudes a clean and friendly atmosphere.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Beach Plum Inn & Restaurant (Menemsha)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Beach Plum Inn & Restaurant',
  'beach-plum-inn-restaurant',
  'Menemsha',
  '50 Beach Plum Ln, Menemsha',
  '(508) 645-9454',
  NULL,
  'Perched atop the Vineyard Sound, since 1950, the 13-room inn’s simple accommodations provide a quiet respite and the stillness of up-island living.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Annabelle's Bed and View on Great Pond (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Annabelle''s Bed and View on Great Pond',
  'annabelles-bed-and-view-on-great-pond',
  'West Tisbury',
  '63 Pond View Farm Rd, West Tisbury',
  '(508) 693-8222',
  NULL,
  'Quaint bed and breakfast with free continental breakfast.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Inn features ocean and garden views in all of its 16 luxury hotel rooms, 3 separate cottage rentals, and 6 vacation rental homes. (Menemsha)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Inn features ocean and garden views in all of its 16 luxury hotel rooms, 3 separate cottage rentals, and 6 vacation rental homes.',
  'the-inn-features-ocean-and-garden-views-in-all-of-',
  'Menemsha',
  '50 North Rd, Menemsha',
  '(508) 645-2521',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Resort (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Resort',
  'marthas-vineyard-resort',
  'Oak Bluffs',
  'Cozy 5 room Oak Bluffs Bed & Breakfast inn with omfortable rooms, with queen sized beds and private bathrooms. Also hosts tennis tournaments, weddings and various gatherings.',
  '(508) 693-6249',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Crocker House Inn (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Crocker House Inn',
  'crocker-house-inn',
  'Vineyard Haven',
  '12 Crocker Ave, Vineyard Haven',
  '(508) 693-1151',
  NULL,
  'The Crocker Inn, located on Martha’s Vineyard, is elegance in a comfortable casual atmosphere',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- HI Martha's Vineyard Hostel (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'HI Martha''s Vineyard Hostel',
  'hi-marthas-vineyard-hostel',
  'Edgartown',
  '525 Edgartown-West Tisbury Rd, West Tisbury',
  '(508) 693-2665',
  NULL,
  'Featuring an on-site garden and barbecue facilities, this hostel is on Martha’s Vineyard. Guests are provided with Wi-Fi access free of charge.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Titticut Follies (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Titticut Follies',
  'titticut-follies',
  'Oak Bluffs',
  'Part of the Oak Bluffs Victorian seaside resort tradition, this restored 19th century carpenter gothic "gingerbread" cottage houses just 12 guests.',
  '(508) 693-4986',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Greenwood House Inn (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Greenwood House Inn',
  'greenwood-house-inn',
  'Vineyard Haven',
  '40 Greenwood Ave, Vineyard Haven',
  '(508) 693-6150',
  NULL,
  'As our guest at Greenwood House, a couples oriented, bed & breakfast, you''ll be treated to casual yet elegant non-smoking accommodations and home-like hospitality.',
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Kathleen's Kottage (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Kathleen''s Kottage',
  'kathleens-kottage',
  'Oak Bluffs',
  'A unique Bed & Breakfast for those who appreciate all that Oak Bluffs & the Island has to offer in a quaint and friendly environment!',
  '(508) 863-2734',
  NULL,
  NULL,
  'lodging-and-tourism',
  'Lodging & Tourism',
  'Hotels',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Bike Rentals (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Bike Rentals',
  'marthas-vineyard-bike-rentals',
  'Edgartown',
  'RW Cutler Bike Shop conveniently located downtown Edgartown. We offer the best rental rates and bicycles selection for your entire family while you are visiting the Vineyard.',
  '(508) 627-4052',
  'https://marthasvineyardbike.com',
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- All Star Martha's Vineyard Bike Rentals (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'All Star Martha''s Vineyard Bike Rentals',
  'all-star-marthas-vineyard-bike-rentals',
  'Oak Bluffs',
  '5 Oak Bluffs Ave, Oak Bluffs',
  '(508) 693-0062',
  'https://marthasvineyardbikerentals.com',
  'All Star MV Bike Rentals has been renting bikes on Martha’s Vineyard for over 30 years providing the best bicycles rental service and free delivery. Now renting electric bikes as well.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Sharks Baseball (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Sharks Baseball',
  'marthas-vineyard-sharks-baseball',
  'Vineyard Haven',
  '100 Edgartown Vineyard Haven Rd, Oak Bluffs',
  '(508) 813-0380',
  'https://mvsharks.com',
  'Non-profit organization dedicated to promoting, teaching, and encouraging the play of baseball on Martha''s Vineyard.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Misty Meadows Equine Learning Center (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Misty Meadows Equine Learning Center',
  'misty-meadows-equine-learning-center',
  'Vineyard Haven',
  '55 Misty Meadows Ln, Vineyard Haven',
  '(508) 338-7198',
  'https://mistymeadowsmv.org',
  'Misty Meadows offers unique, equine-assisted, programs for participants of all ages that awaken personal potential and provide the tools to face life’s challenges.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Classic Aviators, Vintage Biplane Tours (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Classic Aviators, Vintage Biplane Tours',
  'classic-aviators-vintage-biplane-tours',
  'Edgartown',
  '12 Mattakesett Way, Edgartown',
  '(508) 627-7677',
  'https://www.biplanemv.com',
  'Thrilling biplane aerial tours from Katama Airfield around the Island.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Nauti Girl Excursions (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Nauti Girl Excursions',
  'nauti-girl-excursions',
  'Edgartown',
  '1 Dock Street, Edgartown',
  '(508) 939-1421',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Island Spirit Kayak (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Island Spirit Kayak',
  'island-spirit-kayak',
  'Oak Bluffs',
  'State Beach, Oak Bluffs',
  '(508) 693-9727',
  NULL,
  'If you want to kayak during the off season, give us a call and we can try to make it happen!',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Excursions (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Excursions',
  'marthas-vineyard-excursions',
  'Oak Bluffs',
  'Box 2855, Oak Bluffs',
  '(508) 654-0381',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Happyness Factor (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Happyness Factor',
  'the-happyness-factor',
  'Vineyard Haven',
  'P.O. BOX 1200, Vineyard Haven',
  '(774) 521-5621',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Party Boat Skipper (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Party Boat Skipper',
  'party-boat-skipper',
  'Oak Bluffs',
  '2 Circuit Ave Extension, Oak Bluffs',
  '(508) 693-1238',
  NULL,
  'Fun for Entire Family. Deep Sea Fishing & Whale Watching.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Plan Sea Adventure Charters (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Plan Sea Adventure Charters',
  'plan-sea-adventure-charters',
  'Chilmark',
  '60 Basin Rd, Chilmark',
  '(508) 687-2003',
  NULL,
  'We strive to offer a personalized and professional experience to every guest with an emphasis on customer service.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Beamish Charters (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Beamish Charters',
  'beamish-charters',
  'Vineyard Haven',
  ', Vineyard Haven',
  NULL,
  NULL,
  'Fishing Charters, Family Charters, Diving Trips, Sightseeing, Sunset Cruises, Picnic Outings, Delivery Cruises',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Black Dog Tall Ships (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Black Dog Tall Ships',
  'the-black-dog-tall-ships',
  'Vineyard Haven',
  '20 Beach St Extention, Vineyard Haven',
  '(508) 693-1699',
  NULL,
  'Boat rentals, tall ships, charters',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Oceansports (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Oceansports',
  'marthas-vineyard-oceansports',
  'Oak Bluffs',
  '12 Circuit Ave Extension, Oak Bluffs',
  '(508) 693-8476',
  NULL,
  'Providing Martha''s Vineyard with awesome water sport activities.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- MV Leisure Charters (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'MV Leisure Charters',
  'mv-leisure-charters',
  'Edgartown',
  ', Edgartown',
  '(508) 696-5252',
  NULL,
  'Experience the island of Martha’s Vineyard from the water, a unique view.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- High Tide Charters (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'High Tide Charters',
  'high-tide-charters',
  'Edgartown',
  'Dock Street, Edgartown',
  '(508) 415-1540',
  NULL,
  'If catching fish and enjoying a day on the beautiful waters of Nantucket Sound are your pleasure then plan to book a fishing charter with Captain Russ of High Tide Charters.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Mad Max Sailing Adventures (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Mad Max Sailing Adventures',
  'mad-max-sailing-adventures',
  'Edgartown',
  '31 Dock St, Edgartown',
  '(508) 627-7500',
  NULL,
  'Fun for all ages, a trip on the Mad Max is a memorable “must-do” during any Martha''s Vineyard visit, and is an annual favorite of locals and visitors alike.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Pirate Adventures (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Pirate Adventures',
  'pirate-adventures',
  'Oak Bluffs',
  '12 Circuit Ave Extension, Oak Bluffs',
  '(508) 687-2739',
  NULL,
  'Welcome aboard the Island''s first and only Pirate Ship! Our brand new, 40-foot custom vessel is designed just for kids!',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Majic Yacht Charters (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Majic Yacht Charters',
  'majic-yacht-charters',
  'Chilmark',
  '17 Boathouse Rd, Chilmark',
  '(508) 955-9387',
  NULL,
  'These charters are great for intimate gatherings, up to six passengers. Bring your own food and beverages or we can supply box lunches, or have it catered.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Witch of Endor (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Witch of Endor',
  'witch-of-endor',
  'Vineyard Haven',
  '1 Water St, Vineyard Haven',
  '(508) 685-1212',
  NULL,
  'Let us show you the beauty of Martha''s Vineyard from the water. Explore the lovely harbors of the nearby Elizabeth Islands and Cape Cod coastline.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- With over 100 years of combined experience, we know how to make sure you are set up on the right bike, the first time. (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'With over 100 years of combined experience, we know how to make sure you are set up on the right bike, the first time.',
  'with-over-100-years-of-combined-experience-we-know',
  'Edgartown',
  '212 Main St, Edgartown',
  '(508) 627-9008',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Done Deal Charters (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Done Deal Charters',
  'done-deal-charters',
  'Vineyard Haven',
  ', Vineyard Haven',
  '(508) 737-5717',
  NULL,
  'Experience the ultimate thrill of big game fishing on the breathtaking and plentiful waters surrounding Martha''s Vineyard!',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Coop's Bait & Tackle (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Coop''s Bait & Tackle',
  'coops-bait-tackle',
  'West Tisbury',
  '147 W. Tisbury Rd, West Tisbury',
  '(508) 627-3909',
  NULL,
  'Top notch fishing services.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- White Stone Equestrian (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'White Stone Equestrian',
  'white-stone-equestrian',
  'West Tisbury',
  'Formerly Red Pony Farm White Stone Equestrian 22-stall barn in West Tisbury boarding horses and teaching riding.',
  '(508) 693-3788',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Fishsticks Charters (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Fishsticks Charters',
  'fishsticks-charters',
  'Vineyard Haven',
  '287 Beach Rd, Vineyard Haven',
  '(508) 951-5288',
  NULL,
  'Light tackle and fly fishing.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Saltmarsh's Boat Rentals (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Saltmarsh''s Boat Rentals',
  'saltmarshs-boat-rentals',
  'Edgartown',
  '7 Dock Street, Edgartown',
  '(774) 310-1118',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Cycleworks (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Cycleworks',
  'cycleworks',
  'Vineyard Haven',
  'Vineyard Haven bike shop, adult and children''s bikes.',
  '(508) 693-6966',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Dick's Bait and Tackle (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Dick''s Bait and Tackle',
  'dicks-bait-and-tackle',
  'Oak Bluffs',
  '108 New York Ave, Oak Bluffs',
  '(508) 693-7669',
  NULL,
  'Lures, reels, rods, bait and all the fisherman needs.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Catboat Charters (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Catboat Charters',
  'catboat-charters',
  'Edgartown',
  '1 Dock St, Edgartown',
  '(508) 524-6903',
  NULL,
  'Our private sailing charters include refreshments, ice, and blankets as needed. Guests are also welcome to bring their own snacks and libations.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- SV Resolute (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'SV Resolute',
  'sv-resolute',
  'Vineyard Haven',
  '455 State Rd, Vineyard Haven',
  '(508) 923-7177',
  NULL,
  'Let us show you the magic of the sea on one of our three sailing excursions.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Farm Institute (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Farm Institute',
  'the-farm-institute',
  'Edgartown',
  '14 Aero Dr, Edgartown',
  '(508) 627-7007',
  NULL,
  'Family fun',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Outdoor Activities',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Max Bossman Photographer (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Max Bossman Photographer',
  'max-bossman-photographer',
  'Vineyard Haven',
  '7 Delano Rd, Vineyard Haven',
  '(617) 850-5520',
  'https://maxbossman.com',
  'Max Bossman is Martha''s Vineyard based photographer specializing in real estate photography, events, family portraits, weddings and engagement photography.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Vineyard Details (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Vineyard Details',
  'vineyard-details',
  'Oak Bluffs',
  '11 Winemack St., Oak Bluffs',
  '(508) 560-5920',
  'https://vineyarddetails.com',
  'Eric Lakso, the woodworker and designer of intricate, handmade wooden gifts made on Martha''s Vineyard.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Story's In Nature (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Story''s In Nature',
  'storys-in-nature',
  'Vineyard Haven',
  'P.O.BOX 2136, Vineyard Haven',
  '(914) 282-8968',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Night Heron Gallery (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Night Heron Gallery',
  'night-heron-gallery',
  'Vineyard Haven',
  '58 Main St, Vineyard Haven',
  '(508) 696-9500',
  NULL,
  'We are Martha''s Vineyard''s only Co-op gallery exclusively selling work of local artists and crafters.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Seaworthy Gallery (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Seaworthy Gallery',
  'seaworthy-gallery',
  'Vineyard Haven',
  '34 Beach Rd, Vineyard Haven',
  '(605) 693-0153',
  NULL,
  'Creating photographic images from film is almost a lost art, reminiscent of another era.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Art gallery (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Art gallery',
  'art-gallery',
  'Edgartown',
  '27 S. Summer St, Edgartown',
  '(508) 627-6227',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bob Gothard Photography (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bob Gothard Photography',
  'bob-gothard-photography',
  'Vineyard Haven',
  '36 Oak Tree Lane, Vineyard Haven',
  '(305) 439-1383',
  NULL,
  'Bob Gothard Martha''s Vineyard architectural photographer has 50 years of experience as a photographer.He has worked in locations world wide and made his home on Martha''s Vineyard.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Film-Truth Productions (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Film-Truth Productions',
  'film-truth-productions',
  'Chilmark',
  ', Chilmark',
  NULL,
  NULL,
  'Full production and post-production of high quality video',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Cousen Rose Gallery (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Cousen Rose Gallery',
  'cousen-rose-gallery',
  'Oak Bluffs',
  '71 Circuit Ave, Oak Bluffs',
  '(508) 693-6679',
  NULL,
  'Art gallery',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Fisher Gallery (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Fisher Gallery',
  'fisher-gallery',
  'Vineyard Haven',
  '585 Edgartown Vineyard Haven Rd, Edgartown',
  '(508) 627-7711',
  NULL,
  'The gallery is situated in a converted home previously belonging to Captain Francis Fisher, a local shellfishing icon.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Frame Center (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Frame Center',
  'frame-center',
  'Vineyard Haven',
  '455 State Rd, Vineyard Haven',
  '(508) 696-1099',
  NULL,
  'Custom picture framing services and frame store, selection of frame mouldings, mats and glass for prints paintings and mirrors.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Da Rosa's Martha's Vineyard Printing (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Da Rosa''s Martha''s Vineyard Printing',
  'da-rosas-marthas-vineyard-printing',
  'Oak Bluffs',
  '48 Circuit Ave, Oak Bluffs',
  '(508) 693-0110',
  NULL,
  'daRosa’s-Martha’s Vineyard Printing in Oak Bluff, MA has been offering printing services as well as office supplies for over 82 years!',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Sellers Signs (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Sellers Signs',
  'sellers-signs',
  'Edgartown',
  '100 Pennywise Path, Edgartown',
  '(508) 627-9627',
  NULL,
  'Sign making and graphic design',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- David Welch Photography (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'David Welch Photography',
  'david-welch-photography',
  'Vineyard Haven',
  '53 Marion Way, Vineyard Haven',
  NULL,
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Tisbury Printer (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Tisbury Printer',
  'tisbury-printer',
  'Vineyard Haven',
  '52 Lagoon Pond Rd, Vineyard Haven',
  '(508) 693-4222',
  NULL,
  'Copying, printing, signs',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Old Sculpin Gallery (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Old Sculpin Gallery',
  'old-sculpin-gallery',
  'Edgartown',
  '58 Dock St, Edgartown',
  '(508) 627-4881',
  NULL,
  'Fine art paintings, photography and mixed media exhibition and sales, home of the Martha’s Vineyard Art Association.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Mikel Hunter (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Mikel Hunter',
  'mikel-hunter',
  'Edgartown',
  '11 Winter St, Edgartown',
  '(508) 627-1066',
  NULL,
  'Art gallery',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Gay Head Gallery (Aquinnah)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Gay Head Gallery',
  'gay-head-gallery',
  'Aquinnah',
  '32 State Rd, Aquinnah',
  '(508) 645-2776',
  NULL,
  'A fine art gallery with an environmental mission',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Kennedy Studios (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Kennedy Studios',
  'kennedy-studios',
  'Vineyard Haven',
  '66 Main St, Vineyard Haven',
  NULL,
  NULL,
  'Art gallery',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Art Galleries',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Miss Mary Boutique Spa (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Miss Mary Boutique Spa',
  'miss-mary-boutique-spa',
  'Vineyard Haven',
  '20 Surveyors Ln-Suite 103, Vineyard Haven',
  '(508) 536-1505',
  'https://missmarycosmetics.com',
  'Miss Mary Boutique Spa is a full-service skin care, facial and nail salon and day spa located in Martha’s Vineyard Island.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Health Imperatives, Martha’s Vineyard Family Planning (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Health Imperatives, Martha’s Vineyard Family Planning',
  'health-imperatives-marthas-vineyard-family-plannin',
  'Vineyard Haven',
  '517 State Rd, Vineyard Haven',
  '(508) 693-1208',
  'https://healthimperatives.org',
  'Sexual and Reproductive Health clinic. Educational programs & exams for all genders: STDs, HIV testing, pregnancy prevention, raising healthy children, nutrition assistance for income eligible families and more.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Spa at Mansion House (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Spa at Mansion House',
  'spa-at-mansion-house',
  'Vineyard Haven',
  '9 Main St, Vineyard Haven',
  NULL,
  NULL,
  'Facials, massage, body treatments, manicures, pedicures, waxing, hair services, spa retreats.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bodysense (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bodysense',
  'bodysense',
  'Vineyard Haven',
  '20 Old Coach Rd, Vineyard Haven',
  '(508) 693-4411',
  NULL,
  'We offer a diverse selection of heart-based therapies from the serene tranquility of their studio.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Treat Yourself Spa (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Treat Yourself Spa',
  'treat-yourself-spa',
  'Oak Bluffs',
  '38A Circuit Ave, Oak Bluffs',
  '(508) 693-3420',
  NULL,
  'Peaceful, quiet and relaxing atmosphere is really where you want to be to soothe your sense',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Center For Therapeutic Massage (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Center For Therapeutic Massage',
  'center-for-therapeutic-massage',
  'Vineyard Haven',
  '76 Main Street, Vineyard Haven',
  '(508) 693-8020',
  NULL,
  'When you want a massage at its best, look no further than the Center for Therapeutic Massage on Martha''s Vineyard.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Wave Lengths Hair Salon (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Wave Lengths Hair Salon',
  'wave-lengths-hair-salon',
  'Edgartown',
  '223 Upper Main Street, Edgartown',
  '(508) 627-7066',
  NULL,
  'We specialize in Hair Salon, Nails, Tanning, Waxing and much more.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- CiaBella Salon (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'CiaBella Salon',
  'ciabella-salon',
  'Vineyard Haven',
  '18 State Rd, Vineyard Haven',
  '(508) 687-9423',
  NULL,
  'Offering Fantastic Hair Styling, Cuts and Color and Facial Waxing.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Island Bodywork (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Island Bodywork',
  'island-bodywork',
  'Vineyard Haven',
  '155 State Rd-Suite 4, Vineyard Haven',
  '(508) 560-3333',
  NULL,
  'Therapeutic massage, deep tissue, Hot & Cold Stone Therapy',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Betsy's Hands Reflexology (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Betsy''s Hands Reflexology',
  'betsys-hands-reflexology',
  'Vineyard Haven',
  'Betsy Shands, located in Vineyard Haven on Martha’s Vineyard, helps people heal from physical pain and past & emotional issues; raise their consciousness out of the fear, survival and scarcity',
  '(774) 563-0036',
  NULL,
  NULL,
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Panache Salon, Inc (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Panache Salon, Inc',
  'panache-salon-inc',
  'West Tisbury',
  '5 Cournoyer Rd, West Tisbury',
  '(508) 696-8868',
  NULL,
  'Hair Stylists, Manicures/Pedicures, Skincare, Facials and Waxing. Featuring products by Moroccan Oil Hair Products, Young Blood Mineral Makeup and Butter Nail Polish.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Boucle (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Boucle',
  'boucle',
  'Edgartown',
  '12 N. Water St, Edgartown',
  '(508) 627-3853',
  NULL,
  'We want to make your salon experience as unique and memorable as you are.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Shear Inspiration Salon (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Shear Inspiration Salon',
  'shear-inspiration-salon',
  'Edgartown',
  '12 Mariner''s Way, Edgartown',
  '(508) 627-8333',
  NULL,
  'Shear Inspiration Salon is a welcoming year round salon that offers an array of professional services for all hair types.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Hair Studio (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Hair Studio',
  'hair-studio',
  'Vineyard Haven',
  '13 Union St, Vineyard Haven',
  '(508) 693-8665',
  NULL,
  'Weddings & Events Bridal Beauty',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rosecuts (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rosecuts',
  'rosecuts',
  'Vineyard Haven',
  '83 Causeway Rd, Vineyard Haven',
  '(508) 693-5362',
  NULL,
  'Rosecuts provides Up Dos, Trimming, Waxing .',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- A Hair Affair (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'A Hair Affair',
  'a-hair-affair',
  'Edgartown',
  '10 Chambers Way, Edgartown',
  '(508) 627-7976',
  NULL,
  'Boutique Style Salon, Private one on one service! Best Hair Colorist''s on Martha''s Vineyard!...',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- An Island Touch (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'An Island Touch',
  'an-island-touch',
  'Vineyard Haven',
  '364A State Rd, Vineyard Haven',
  '(508) 693-0300',
  NULL,
  'An Island Touch respects the integrity of the whole person in body, mind and spirit and provides health services that are holistic and integrative in nature.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Pure Touch Salon (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Pure Touch Salon',
  'pure-touch-salon',
  'Edgartown',
  '3 South Water St, Edgartown',
  '(508) 939-3123',
  NULL,
  'Haircuts, hair styling and blowouts',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Stop and Shop Pharmacy (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Stop and Shop Pharmacy',
  'stop-and-shop-pharmacy',
  'Vineyard Haven',
  '245 Edgartown-Vineyard Haven Rd, Edgartown',
  '(508) 627-5107',
  NULL,
  'For all of your pharmacy needs.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Nails by Yvonne (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Nails by Yvonne',
  'nails-by-yvonne',
  'Vineyard Haven',
  '2 Center St, Vineyard Haven',
  '(508) 693-1882',
  NULL,
  'Acrylic nails, gel nails, natural manicures, pedicures, shellac, OPI gel color, body piercing jewelry.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Chrystal Angelini & Associates (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Chrystal Angelini & Associates',
  'chrystal-angelini-associates',
  'Vineyard Haven',
  '322 State Rd, Vineyard Haven',
  '(508) 693-1946',
  NULL,
  'Chrystal Angelini has a background in exercise science, and has been in practice for 10 years on Martha’s Vineyard.',
  'beauty-and-wellness',
  'Beauty & Wellness',
  'Spas',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Vineyard Gazette (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Vineyard Gazette',
  'the-vineyard-gazette',
  'Edgartown',
  '34 S Summer St, Edgartown',
  '(508) 627-4311',
  'https://vineyardgazette.com',
  'Founded in 1846 The Vineyard Gazette is a local news and information newspaper dedicated to the Island of Martha’s Vineyard.',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Reynolds, Rappaport, Kaplan and Hackney (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Reynolds, Rappaport, Kaplan and Hackney',
  'reynolds-rappaport-kaplan-and-hackney',
  'Oak Bluffs',
  'Our attorneys serve as Town Counsel to five of the island towns, Aquinnah, Chilmark, Edgartown, Oak Bluffs and West Tisbury, as well as the Martha’s Vineyard Land Bank Commission.',
  '(508) 627-3711',
  NULL,
  NULL,
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Brush, Flanders & Moriarty (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Brush, Flanders & Moriarty',
  'brush-flanders-moriarty',
  'West Tisbury',
  '459 State Rd, West Tisbury',
  '(508) 693-7733',
  NULL,
  NULL,
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rosemary Haigazain (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rosemary Haigazain',
  'rosemary-haigazain',
  'Vineyard Haven',
  '282 Edgartown-Vineyard Haven Rd, Edgartown',
  '(508) 627-3356',
  NULL,
  'Lawyer',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Insurance (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Insurance',
  'marthas-vineyard-insurance',
  'Oak Bluffs',
  '97 Circuit Ave, Oak Bluffs',
  '(508) 693-8747',
  NULL,
  'Martha’s Vineyard Insurance agency specializing in personal and business insurance - real estate, medical, construction, marine, tourism.',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Mc Carron Murphy & Vukota LLP (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Mc Carron Murphy & Vukota LLP',
  'mc-carron-murphy-vukota-llp',
  'Edgartown',
  '282 Upper Main St, Edgartown',
  '(508) 627-3322',
  NULL,
  NULL,
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Larkosh & Jackson LLP (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Larkosh & Jackson LLP',
  'larkosh-jackson-llp',
  'Edgartown',
  '20 Meshacket Rd, Edgartown',
  '(508) 939-9500',
  NULL,
  'Municipal law, real estate litigation, business law, family law, appeals and litigation and trial attorneys',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Law Offices of Charles A. Morano (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Law Offices of Charles A. Morano',
  'law-offices-of-charles-a-morano',
  'Edgartown',
  '23 Winter St, Edgartown',
  '(508) 627-7427',
  NULL,
  'Lawyer',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Tomassian & Tomassian (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Tomassian & Tomassian',
  'tomassian-tomassian',
  'Edgartown',
  '122 Upper Main St, Edgartown',
  '(508) 627-3334',
  NULL,
  'Civil rights, landlord & tenant litigation, real estate and business law',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Satran & Associates (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Satran & Associates',
  'satran-associates',
  'Vineyard Haven',
  '282 Vineyard Haven Rd, Edgartown',
  '(508) 627-4055',
  NULL,
  'Estate planning, business succession planning, corporate law, probate court proceedings, elder law',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Keith Lieberman (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Keith Lieberman',
  'keith-lieberman',
  'Vineyard Haven',
  '10 State Rd, Vineyard Haven',
  '(508) 696-9640',
  NULL,
  'Personal injury and real estate law',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Edmond G Coogan Law Office PC (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Edmond G Coogan Law Office PC',
  'edmond-g-coogan-law-office-pc',
  'Vineyard Haven',
  '4 Causeway Rd A, Vineyard Haven',
  '(508) 693-3200',
  NULL,
  NULL,
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Robert C. Jacquard Esquire (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Robert C. Jacquard Esquire',
  'robert-c-jacquard-esquire',
  'West Tisbury',
  '84 Vineyard Meadow Farm Rd, West Tisbury',
  '(401) 461-6800',
  NULL,
  'Specializing in bankruptcy',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Dubin & Reardon (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Dubin & Reardon',
  'dubin-reardon',
  'Vineyard Haven',
  '107 Beach Rd #205, Vineyard Haven',
  '(508) 693-5757',
  NULL,
  'Real Estate Attorney',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rosemarie Haigazian Law Office (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rosemarie Haigazian Law Office',
  'rosemarie-haigazian-law-office',
  'Vineyard Haven',
  '282 Edgartown-Vineyard Haven Rd, Edgartown',
  '(508) 627-3356',
  NULL,
  NULL,
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Hammarlund Law Office (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Hammarlund Law Office',
  'hammarlund-law-office',
  'Vineyard Haven',
  '10 State Rd, Vineyard Haven',
  '(508) 696-7700',
  NULL,
  'Real estate law, civil litigation, business, corporate and non-profit law, wills, trust, estate planning, mediation',
  'business-and-professional-services',
  'Business & Professional Services',
  'Professional Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Superior Painting (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Superior Painting',
  'superior-painting',
  'West Tisbury',
  'PO Box1525, West Tisbury',
  '(508) 939-1335',
  'https://mvsuperiorpainting.com',
  'Superior Painting was founded in 2014. Since that time our core value remains the same: to provide high quality painting service to all of our clients.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Padilla Painting (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Padilla Painting',
  'padilla-painting',
  'Vineyard Haven',
  'PO Box 2713, Vineyard Haven',
  '(508) 939-0877',
  NULL,
  'house painting and restoration',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Vineyard Alarm (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Vineyard Alarm',
  'vineyard-alarm',
  'Vineyard Haven',
  '13 Beach St Ext Unit 213, Vineyard Haven',
  '(508) 776-8735',
  'https://vineyardalarm.com',
  'We specialize in all aspects of fire and security systems, including environmental and gas detection. All systems can be customized to completely protect homes and businesses.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Nab's Corner Associates (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Nab''s Corner Associates',
  'nabs-corner-associates',
  'Chilmark',
  '30 Stonewood Ln., Chilmark',
  '(508) 627-0020',
  NULL,
  'Fully licensed and insured building firm specializing in esign and construction of residential homes on the island of Martha''s Vineyard.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Green Island Homes (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Green Island Homes',
  'green-island-homes',
  'Edgartown',
  '223 Upper Main Street, Edgartown',
  '(774) 563-9714',
  NULL,
  NULL,
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Wonderland Landscape (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Wonderland Landscape',
  'wonderland-landscape',
  'West Tisbury',
  'PO Box 212, West Tisbury',
  '(860) 882-2927',
  NULL,
  'Lawn mowing, quality affordable lawn & garden care, spring and fall cleanups',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bilzerian Tree & Land Services (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bilzerian Tree & Land Services',
  'bilzerian-tree-land-services',
  'Vineyard Haven',
  '969 State Rd, Vineyard Haven',
  '(508) 560-1565',
  NULL,
  NULL,
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Ken Edwards Sheet Metal (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Ken Edwards Sheet Metal',
  'ken-edwards-sheet-metal',
  'Edgartown',
  '23 E Line Rd, Edgartown',
  '(508) 693-6826',
  NULL,
  'Sheet metal roofing.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Martha's Vineyard Electricians (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Martha''s Vineyard Electricians',
  'marthas-vineyard-electricians',
  'Vineyard Haven',
  '35 Sheridan St, Vineyard Haven',
  '(508) 693-3568',
  NULL,
  'Martha''s Vineyard Electricians Inc. provides the same great client service regardless of project size.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Charles Day Plumbing and Heating (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Charles Day Plumbing and Heating',
  'charles-day-plumbing-and-heating',
  'Edgartown',
  '6 Leah Lane, Edgartown',
  '(508) 627-3243',
  NULL,
  'At Charles Day Plumbing & Heating, we offer a wide variety of services for both homeowners and commercial property owners.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- J. E. Kelleher Plumbing and Mechanical, Inc (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'J. E. Kelleher Plumbing and Mechanical, Inc',
  'j-e-kelleher-plumbing-and-mechanical-inc',
  'Vineyard Haven',
  '691 Edgartown-Vineyard Haven Rd, Edgartown',
  '(508) 627-5006',
  NULL,
  'Wouldn‘t it be nice to just pick up the phone and make your troubles go away?That is how it is when you call:J.E.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Associate Roofing, Inc. (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Associate Roofing, Inc.',
  'associate-roofing-inc',
  'Chilmark',
  ', Chilmark',
  '(508) 645-3228',
  NULL,
  'We are a professional roofing company specializing in Commercial and Residential roofs.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Willett Electric Inc (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Willett Electric Inc',
  'willett-electric-inc',
  'Edgartown',
  '7 A St-Unit b, Edgartown',
  '(508) 627-9438',
  NULL,
  'Willett Electric Inc was founded in 1977 by Greg Willett, and as of August 2017, now owned by his son Craig R. Willett.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Hart Co. Plumbing and Heating (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Hart Co. Plumbing and Heating',
  'hart-co-plumbing-and-heating',
  'Vineyard Haven',
  '461 State Rd, Vineyard Haven',
  '(508) 693-7227',
  NULL,
  'If you have a plumbing emergency that needs immediate attention…there’s no need to panic, The Hart Company is at your service.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Daseco Electric (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Daseco Electric',
  'daseco-electric',
  'Vineyard Haven',
  '18 State Rd, Vineyard Haven',
  '(508) 696-8383',
  NULL,
  'Company has expanded to Martha''s Vineyard. Home office in Weymouth.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Gabe Grasing Electric (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Gabe Grasing Electric',
  'gabe-grasing-electric',
  'Edgartown',
  '"All Your Electrical Needs" Gabe Grasing Electric, is a full service Electrician located in Edgartown, MA .',
  '(508) 939-9183',
  NULL,
  NULL,
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- John G Early Contractor (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'John G Early Contractor',
  'john-g-early-contractor',
  'Vineyard Haven',
  '13 Breakdown Ln, Vineyard Haven',
  '(508) 693-6177',
  NULL,
  'We both preserve and rejuvenate older structures that speak of our Island heritage and create totally new structures with stunning architecture and complex details and systems that often require ne',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bennett Electric and Solar (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bennett Electric and Solar',
  'bennett-electric-and-solar',
  'Vineyard Haven',
  '79 Beach Rd, Vineyard Haven',
  '(508) 693-3608',
  NULL,
  'SOLAR INVICTUS is a licensed full-service solar and energy contracting and development company. We are based on Martha’s Vineyard and do business all over the state of Massachusetts.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Johnson Plumbing and Heating (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Johnson Plumbing and Heating',
  'johnson-plumbing-and-heating',
  'Vineyard Haven',
  '26 Hidden Cove Rd, Vineyard Haven',
  '(508) 693-8472',
  NULL,
  'Plumbing and heating contractors.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- D. Best Contractors (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'D. Best Contractors',
  'd-best-contractors',
  'Vineyard Haven',
  '156 Winyah Circle, Vineyard Haven',
  '(508) 696-8448',
  NULL,
  'General contracting, restoration, kitchens and bath.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Tilton Tool Rentals (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Tilton Tool Rentals',
  'tilton-tool-rentals',
  'Vineyard Haven',
  '147 Edgartown, Vineyard Haven Rd, Oak Bluffs',
  '(508) 693-9173',
  NULL,
  'Tool rental',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Ronald Pine Electric (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Ronald Pine Electric',
  'ronald-pine-electric',
  'Vineyard Haven',
  '188 Daggett Ave, Vineyard Haven',
  '(508) 693-8537',
  NULL,
  'Electrician',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Mongillo Electric (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Mongillo Electric',
  'mongillo-electric',
  'Vineyard Haven',
  '18 Paula Ave, Vineyard Haven',
  '(508) 693-0385',
  NULL,
  'Mongillo Electric is a reliable, professional and trusted electrician company having served the Vineyard for over 30 years.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Joseph T.Cazeault & Sons Roofers (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Joseph T.Cazeault & Sons Roofers',
  'joseph-tcazeault-sons-roofers',
  'Edgartown',
  '37 E Line St, Edgartown',
  '(800) 649-0239',
  NULL,
  'Serving the roofing needs of residential and commercial customers.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rock Pond Kitchens (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rock Pond Kitchens',
  'rock-pond-kitchens',
  'Edgartown',
  '190 Upper Main St, Edgartown',
  '(774) 253-3828',
  NULL,
  'Custom kitchens',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Fullin & Bettencourt Plumbing and Heating (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Fullin & Bettencourt Plumbing and Heating',
  'fullin-bettencourt-plumbing-and-heating',
  'Edgartown',
  '23A E Line St, Edgartown',
  '(508) 627-9595',
  NULL,
  'We primarily operates in the Heating Systems Repair and Maintenance business / industry within the Construction.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rick Convery Painting, Inc (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rick Convery Painting, Inc',
  'rick-convery-painting-inc',
  'Edgartown',
  '5 N. Bog Rd, Edgartown',
  '(774) 229-6320',
  NULL,
  'Painting and restoration',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Good Neighbor Fence (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Good Neighbor Fence',
  'good-neighbor-fence',
  'Vineyard Haven',
  '45 Goah Way, Vineyard Haven',
  '(508) 693-1008',
  NULL,
  NULL,
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Thomas Carroll Plumbing and Heating (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Thomas Carroll Plumbing and Heating',
  'thomas-carroll-plumbing-and-heating',
  'Vineyard Haven',
  '298 County Rd, Vineyard Haven',
  '(508) 696-1060',
  NULL,
  'Call Tom Carroll for all of your plumbing and heating needs on Martha’s Vineyard.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- All Service Plumbing and Heating (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'All Service Plumbing and Heating',
  'all-service-plumbing-and-heating',
  'Oak Bluffs',
  '28 Wing Rd, Oak Bluffs',
  '(508) 693-5983',
  NULL,
  'Plumbing, heating and gas piping.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Boyd and Son Plumbing and Heating (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Boyd and Son Plumbing and Heating',
  'boyd-and-son-plumbing-and-heating',
  'Edgartown',
  '8 Weeks Lane, Edgartown',
  '(508) 627-5020',
  NULL,
  'Plumbing and heating contractor.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Amaral Painting (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Amaral Painting',
  'amaral-painting',
  'Edgartown',
  ', Edgartown',
  '(508) 684-0131',
  NULL,
  'Amaral Painting was started in 2006 by Adaelton and Adarlecio Amaral, two brothers with a vision to provide the best painting and restoration services on Martha''s Vineyard.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Warren Electric Corp (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Warren Electric Corp',
  'warren-electric-corp',
  'Vineyard Haven',
  'Warren Electric Corporation is located in Vineyard Haven, Massachusetts. This organization primarily operates in the Electrical Equipment and Supplies.',
  '(508) 693-7786',
  NULL,
  NULL,
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Walter Smith Plumbing and Heating (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Walter Smith Plumbing and Heating',
  'walter-smith-plumbing-and-heating',
  'Edgartown',
  '9 Weeks Ln, Edgartown',
  '(508) 627-5661',
  NULL,
  'We repair, replace and install literally hundreds of different cooling and heating products.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Coastal Plumbing and Electric (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Coastal Plumbing and Electric',
  'coastal-plumbing-and-electric',
  'Vineyard Haven',
  '378 State Rd, Vineyard Haven',
  '(508) 693-7786',
  NULL,
  'Fully licensed master plumber and electrician serving all of your plumbing and electrical needs.',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Cape & Islands Glass (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Cape & Islands Glass',
  'cape-islands-glass',
  'Edgartown',
  '8 North Line Rd, Edgartown',
  '(508) 693-8855',
  NULL,
  'Residential and auto glass',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Plum Perfect Painting (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Plum Perfect Painting',
  'plum-perfect-painting',
  'Vineyard Haven',
  '169 Spring St, Vineyard Haven',
  '(508) 889-6422',
  NULL,
  'Plum Perfect Painting, managed by Rene Da Silva and his brother Alessandro, is committed to providing all Vineyard customers with the highest quality customer service and craftsmanship completed in',
  'building-and-construction',
  'Building & Construction',
  'General Contractors',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Capawock Theater (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Capawock Theater',
  'capawock-theater',
  'Vineyard Haven',
  'The historic Capawock Theater, operating since 1913 in Vineyard Haven',
  '(508) 696-9200',
  'https://mvtheaterfoundation.org',
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Entertainment Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- MV Performing Arts Center (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'MV Performing Arts Center',
  'mv-performing-arts-center',
  'Oak Bluffs',
  '100 Edgartown Rd, Oak Bluffs',
  '(508) 693-1033',
  'https://mvrhs.org',
  'The Performing Arts Center is MV''s largest indoor auditorium holding concerts, festivals, movie screenings, dance and theatrical performances.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Entertainment Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Mike Benjamin Music (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Mike Benjamin Music',
  'mike-benjamin-music',
  'Edgartown',
  '135 Beach Rd, Edgartown',
  '(508) 642-0439',
  NULL,
  'The Mike Benjamin Band has been performing at weddings, parties and private events on Martha’s Vineyard, Boston, Cape Cod and beyond for over 15 years.',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Entertainment Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Katharine Cornell Theatre (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Katharine Cornell Theatre',
  'katharine-cornell-theatre',
  'Vineyard Haven',
  'Performance art theatre located downtown Vineyard Haven at the Town Hall building',
  '(508) 693-6237',
  NULL,
  NULL,
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Entertainment Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Johhny Hoy and the Bluefish (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Johhny Hoy and the Bluefish',
  'johhny-hoy-and-the-bluefish',
  'West Tisbury',
  'POB 14, West Tisbury',
  '(508) 696-3007',
  NULL,
  'Formed in 1991, the band has evolved through many incarnations, three Tone Cool and two self-produced CDs, trips around the world as far as South Africa and mostly the joys of playing a lot of musi',
  'arts-and-entertainment',
  'Arts & Entertainment',
  'Entertainment Services',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Nancy's Restaurant & Snack Bar (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Nancy''s Restaurant & Snack Bar',
  'nancys-restaurant-snack-bar',
  'Oak Bluffs',
  'Oak Bluffs harbor view restaurant and bar offering fine dining, fresh seafood, sushi, drinks.',
  '(508) 693-0006',
  'https://nancysrestaurant.com',
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- MV Salads (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'MV Salads',
  'mv-salads',
  'Oak Bluffs',
  'We are a fun and healthy Salad Experience and retail store in the heart of Oak Bluffs on Martha''s Vineyard. Our salads are bursting with flavor and freshness.',
  '(508) 338-7754',
  'https://mvsalads.com',
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Juice by the Sea (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Juice by the Sea',
  'juice-by-the-sea',
  'Oak Bluffs',
  '7 Circuit Avenue Ext., Oak Bluffs',
  '(508) 338-2018',
  'https://juicebytheseamv.com',
  'Juice bar & vegan café located @ Tisbury Marketplace. Enjoy your breakfast, lunch or dinner outside the cafe or at one of the public picnic tables on the Lagoon. Juice plus other gluten-free and vegan delights literally By The Sea!',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Vineyard Sweet & Treat (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Vineyard Sweet & Treat',
  'vineyard-sweet-treat',
  'Oak Bluffs',
  '6 Seaview Ave Ext, Oak Bluffs',
  '(508) 338-2323',
  NULL,
  'Homemade Ice Cream & Teas',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Rolled ice cream prepared on the spot, frozen yogurt smoothies, Thai bubble teas. (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Rolled ice cream prepared on the spot, frozen yogurt smoothies, Thai bubble teas.',
  'rolled-ice-cream-prepared-on-the-spot-frozen-yogur',
  'Oak Bluffs',
  '7 Circuit Ave Ext, Oak Bluffs',
  '(860) 997-9996',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bernie’s Home Made Ice Cream (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bernie’s Home Made Ice Cream',
  'bernies-home-made-ice-cream',
  'Vineyard Haven',
  '22 Main Street, Vineyard Haven',
  '(508) 693-8266',
  NULL,
  'We make our own Ice Cream and Fudge using only the finest, freshest ingredients! You can taste the difference!',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Down Island Farm/MV Sea Salt (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Down Island Farm/MV Sea Salt',
  'down-island-farmmv-sea-salt',
  'Vineyard Haven',
  '280 Takemmy Path, vineyard Haven',
  '(508) 560-3315',
  NULL,
  'Martha’s Vineyard Sea Salt is produced by husband and wife team of Heidi Feldman and Curtis Friedman.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Open for breakfast, lunch, or a sunset snack, coffees or teas. (Menemsha)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Open for breakfast, lunch, or a sunset snack, coffees or teas.',
  'open-for-breakfast-lunch-or-a-sunset-snack-coffees',
  'Menemsha',
  '24 Basin Rd, Menemsha',
  '(508) 955-9471',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Vineyard Scoops (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Vineyard Scoops',
  'vineyard-scoops',
  'Edgartown',
  'Seasonal cash only gelato and Ice cream shop downtown Edgartown.',
  '(508) 627-4736',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Fresh meat and seafood (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Fresh meat and seafood',
  'fresh-meat-and-seafood',
  'Vineyard Haven',
  '240 Edgartown-Vineyard Haven Rd, Edgartown',
  '(508) 627-6200',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Right Fork Diner (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Right Fork Diner',
  'right-fork-diner',
  'Edgartown',
  '12 Mattakesett Way, Edgartown',
  '(508) 627-5522',
  NULL,
  '"This place is not only great for lunch but if you have the chance to stop in for breakfast, do it! G',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- 20by9 (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  '20by9',
  '20by9',
  'Oak Bluffs',
  '16 Kennebec Ave, Oak Bluffs',
  '(508) 338-2065',
  NULL,
  'A gathering place where our customers will enjoy good food, good booze, and good company.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bite On The Go (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bite On The Go',
  'bite-on-the-go',
  'Vineyard Haven',
  'A Brazilian-American buffet on the Vineyard Haven waterfront. Dine-in, take-out.',
  '(508) 693-8266',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Sand Bar & Grille (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Sand Bar & Grille',
  'sand-bar-grille',
  'Oak Bluffs',
  'Located right on the harbor a few minutes from the Oak Bluffs ferry, the Sandbar is the place for great food, great fun and a great "Island Atmosphere".',
  '(508) 693-7111',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Plane View (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Plane View',
  'plane-view',
  'West Tisbury',
  '71 Airport Rd, West Tisbury',
  '(508) 693-1886',
  NULL,
  'The Martha''s Vineyard airport''s only restaurant. Serving breakfast and lunch seven days a week.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- MV Wine and Spirits (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'MV Wine and Spirits',
  'mv-wine-and-spirits',
  'Edgartown',
  '17A Airport Rd, Edgartown',
  '(508) 627-7557',
  NULL,
  'We stock new craft beers, unique wines, and the finest spirits on a daily basis. Come on in and check out our amazing selection.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- We serve Modern American Cuisine. Everything is housemade and lovingly prepared. (West Tisbury)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'We serve Modern American Cuisine. Everything is housemade and lovingly prepared.',
  'we-serve-modern-american-cuisine-everything-is-hou',
  'West Tisbury',
  '688 State Road, West Tisbury',
  '(508) 693-8582',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Premier Chef Services (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Premier Chef Services',
  'premier-chef-services',
  'Edgartown',
  '258 Edgartown Rd, Edgartown',
  '(920) 737-5752',
  NULL,
  'Weddings, Clambakes, Corporate Event Catering',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Quarterdeck Restaurant (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Quarterdeck Restaurant',
  'quarterdeck-restaurant',
  'Edgartown',
  '29 Dock St, Edgartown',
  '(508) 627-5346',
  NULL,
  'Take out.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Isola Restaurant (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Isola Restaurant',
  'isola-restaurant',
  'Edgartown',
  '19 Church Street, Edgartown',
  '(774) 549-9446',
  NULL,
  'We source as much local produce and seafood from Martha’s Vineyard as possible, and change our menu frequently to provide our customers the chance to try the many dishes.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Lobsterville Grill (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Lobsterville Grill',
  'lobsterville-grill',
  'Oak Bluffs',
  'At Lobersterville Bar & Grille we offer fresh seafood, good company, and spectacular views of Oak Bluffs Harbor',
  '(508) 696-0099',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Farm Neck Golf Club Cafe (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Farm Neck Golf Club Cafe',
  'farm-neck-golf-club-cafe',
  'Oak Bluffs',
  '1 Farm Neck Way, Oak Bluffs',
  NULL,
  NULL,
  'The Cafe is a full service restaurant on a world renowned golf course open to the public. A hidden gem not far from the bustle of the Island’s downtowns.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Stop & Shop (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Stop & Shop',
  'stop-shop',
  'Vineyard Haven',
  'Large grocery store in Vineyard Haven.',
  '(508) 693-8339',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bangkok Thai Cuisine (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bangkok Thai Cuisine',
  'bangkok-thai-cuisine',
  'Oak Bluffs',
  '67 Circuit Ave, Oak Bluffs',
  '(508) 696-6322',
  NULL,
  'Great Thai food',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Lobster Tales Catering and Clambakes (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Lobster Tales Catering and Clambakes',
  'lobster-tales-catering-and-clambakes',
  'Edgartown',
  '170 Katama Rd, Edgartown',
  '(508) 627-5933',
  NULL,
  'We look forward to satisfying your catering needs here on the island.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- We pride ourselves on being a community market where you can shop for everyday basics, fresh local produce, specialty foods, and household necessities. (Chilmark)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'We pride ourselves on being a community market where you can shop for everyday basics, fresh local produce, specialty foods, and household necessities.',
  'we-pride-ourselves-on-being-a-community-market-whe',
  'Chilmark',
  '7 State Rd, Chilmark',
  '(508) 645-3739',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Ken N' Beck Restaurant (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Ken N'' Beck Restaurant',
  'ken-n-beck-restaurant',
  'Oak Bluffs',
  '14 Kennebec Ave, Oak Bluffs',
  '(508) 696-6040',
  NULL,
  'A place where you''re just as likely to connect with old friends as meet new and fascinating people from all over the world, a place where you can enjoy a life changing meal to the sounds of the Rol',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Cardboard Box (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Cardboard Box',
  'the-cardboard-box',
  'Oak Bluffs',
  '6 Circuit Ave, Oak Bluffs',
  '(508) 338-2621',
  NULL,
  'Downtown OB restaurant serving food, drinks, live music and DJs.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Lighthouse Grill (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Lighthouse Grill',
  'lighthouse-grill',
  'Edgartown',
  'The Lighthouse Grill at Harbor View Hotel is a casual, contemporary New England Grill with breathtaking views o the Edgartown Harbor.',
  '(508) 627-3761',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Not Your Sugar Mamas (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Not Your Sugar Mamas',
  'not-your-sugar-mamas',
  'Vineyard Haven',
  '79 Beach Rd-Unit 15, Vineyard Haven',
  '(508) 338-2018',
  NULL,
  'We are what we eat. By eating food that vibrates at a higher frequency we heighten our life force energy and feel more radiant and alive.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- our freshly baked cookies, ginger snaps, pumpkin-cream cheese muffins, decadent desserts, and scones are just a few of the many sweet treats still available at the Bakery. (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'our freshly baked cookies, ginger snaps, pumpkin-cream cheese muffins, decadent desserts, and scones are just a few of the many sweet treats still available at the Bakery.',
  'our-freshly-baked-cookies-ginger-snaps-pumpkin-cre',
  'Vineyard Haven',
  '11 Water Street, Vineyard Haven',
  '(508) 693-4786',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Famous lobster rolls and chowder, fresh swordfish sandwiches, fresh angus burgers and Galley fries, salads, vegetarian type specials are offered daily at reasonable prices. (Menemsha)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Famous lobster rolls and chowder, fresh swordfish sandwiches, fresh angus burgers and Galley fries, salads, vegetarian type specials are offered daily at reasonable prices.',
  'famous-lobster-rolls-and-chowder-fresh-swordfish-s',
  'Menemsha',
  '515 North Rd, Menemsha',
  '(508) 645-9819',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- The Boathouse (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'The Boathouse',
  'the-boathouse',
  'Edgartown',
  '2 Main Street, Edgartown',
  '(508) 627-3535',
  NULL,
  'Members enjoy exceptional waterfront dining in the elegant restaurant and bar or on the two outside covered decks.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Garde East Restaurant (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Garde East Restaurant',
  'garde-east-restaurant',
  'Vineyard Haven',
  'A Martha’s Vineyard dining experience on the water Garde East overlooks the harbor from Vineyard Haven Marina and offers both indoor and outdoor dining in a casual yet elegant setting.',
  '(508) 687-9926',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Detente Restaurant (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Detente Restaurant',
  'detente-restaurant',
  'Edgartown',
  '15 Winter St, Nevin Square, Edgartown',
  '(508) 627-8810',
  NULL,
  'By working with local farmers and fishermen, Détente''s menu revolves around the freshest ingredients available.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Little House Restaurant (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Little House Restaurant',
  'little-house-restaurant',
  'Vineyard Haven',
  '339 State Rd, Vineyard Haven',
  '(508) 687-9794',
  NULL,
  'Since we opened in July 2010, we have strived to produce high quality food and offer excellent customer service.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- One of the oldest restaurants on the Vineyard. Owned and operated by the Madison and Vanderhoop family for over 70 years. (Aquinnah)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'One of the oldest restaurants on the Vineyard. Owned and operated by the Madison and Vanderhoop family for over 70 years.',
  'one-of-the-oldest-restaurants-on-the-vineyard-owne',
  'Aquinnah',
  '27 Aquinnah Circle, Aquinnah',
  '(508) 645-3867',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Giodano's Restaurant & Clam Shack (Oak Bluffs)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Giodano''s Restaurant & Clam Shack',
  'giodanos-restaurant-clam-shack',
  'Oak Bluffs',
  '18 Lake Ave, Oak Bluffs',
  '(508) 693-0184',
  NULL,
  'Seafood, Italian food, Pizza',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Murdicks Cafe (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Murdicks Cafe',
  'murdicks-cafe',
  'Edgartown',
  '19 N. Water Street, Edgartown',
  '(508) 627-7605',
  NULL,
  'Breakfast and lunch sandwiches, soups, teas and coffees.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Diner with great breakfast. (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Diner with great breakfast.',
  'diner-with-great-breakfast',
  'Edgartown',
  '2 Dock Street, Edgartown',
  '(508) 627-5232',
  NULL,
  NULL,
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Bill Smith's Martha's Vineyard Clambake Co. (Edgartown)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Bill Smith''s Martha''s Vineyard Clambake Co.',
  'bill-smiths-marthas-vineyard-clambake-co',
  'Edgartown',
  '10 North Line Rd, Edgartown',
  '(508) 627-8809',
  NULL,
  'We do only one thing - Clambakes - but we do it very well!',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Cumberland Farms Community Store (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Cumberland Farms Community Store',
  'cumberland-farms-community-store',
  'Vineyard Haven',
  '9 Lagoon Pond Rd, Vineyard Haven',
  '(508) 693-8729',
  NULL,
  'Convenience store.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

-- Annie Foley Catering (Vineyard Haven)
INSERT INTO businesses (
  business_name, slug, town, full_address, phone, website, description,
  business_type, category, subcategory,
  status, is_public, verification_source, created_at, updated_at
) VALUES (
  'Annie Foley Catering',
  'annie-foley-catering',
  'Vineyard Haven',
  '426 Main St, Vineyard Haven',
  '(508) 693-2877',
  NULL,
  'Big occasions to intimate parties. Classic New England dinners to worldly cuisine.',
  'restaurants-food-beverages',
  'Restaurants, Food & Beverages',
  'Restaurants',
  'needs_review',
  false,
  'businesses_2_import',
  NOW(),
  NOW()
);

COMMIT;