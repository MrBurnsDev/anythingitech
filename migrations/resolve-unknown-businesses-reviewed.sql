-- Resolve Unknown Businesses (Reviewed)
-- Generated: 2026-04-26T23:46:49.330Z
-- After sanity review: Only includes approved and corrected records
-- Records needing manual review are EXCLUDED
-- DO NOT APPLY WITHOUT FINAL REVIEW

BEGIN TRANSACTION;

-- Approved records (passed sanity review)
UPDATE businesses SET town = 'Vineyard Haven', full_address = '20 Beach Rd, Vineyard Haven, MA 02568', category = 'Professional Services' WHERE id = 31; -- Martha's Vineyard Magazine
UPDATE businesses SET town = 'Vineyard Haven', full_address = '39 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 191; -- Artcliff Diner
UPDATE businesses SET town = 'Oak Bluffs', full_address = '90 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant', business_name = 'Bobby B''s' WHERE id = 196; -- Bobbybs
UPDATE businesses SET town = 'Oak Bluffs', full_address = '94 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 200; -- Delicious MV
UPDATE businesses SET town = 'Vineyard Haven', full_address = '15 Main St, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'Mocha Mott''s' WHERE id = 208; -- About Motts
UPDATE businesses SET town = 'Vineyard Haven', full_address = '977 State Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 219; -- Scottish Bakehouse
UPDATE businesses SET town = 'Edgartown', full_address = '196 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'MV Wine Store' WHERE id = 262; -- Mvwine Store
UPDATE businesses SET town = 'West Tisbury', full_address = 'West Tisbury, MA 02575', category = 'Professional Services', business_name = 'Blanchard Photography' WHERE id = 280; -- Blanchardphoto
UPDATE businesses SET town = 'West Tisbury', full_address = '674 Lambert''s Cove Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 304; -- Merry Farm Pottery
UPDATE businesses SET town = 'Oak Bluffs', full_address = '50 Kennebec Ave, Oak Bluffs, MA 02557', category = 'Health & Wellness' WHERE id = 372; -- Vineyard Vinyasa
UPDATE businesses SET town = 'Oak Bluffs', full_address = '70 Lake Ave, Oak Bluffs, MA 02557', category = 'Lodging' WHERE id = 417; -- Summercamp Hotel
UPDATE businesses SET town = 'Chilmark', full_address = '5 North Rd, Chilmark, MA 02535', category = 'Lodging' WHERE id = 425; -- Captain Flanders Inn
UPDATE businesses SET town = 'Aquinnah', full_address = '10 Duck Pond Way, Aquinnah, MA 02535', category = 'Lodging', business_name = 'Duck Inn' WHERE id = 431; -- Duckinnon
UPDATE businesses SET town = 'Edgartown', full_address = '27 N Water St, Edgartown, MA 02539', category = 'Lodging' WHERE id = 433; -- Lark Hotels
UPDATE businesses SET town = 'Edgartown', full_address = '30 Main St, Edgartown, MA 02539', category = 'Health & Wellness', business_name = 'Bellezza MV Salon' WHERE id = 463; -- Bellezzamvsalon
UPDATE businesses SET town = 'Vineyard Haven', full_address = '14 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Brickman''s' WHERE id = 470; -- Brickman
UPDATE businesses SET town = 'Vineyard Haven', full_address = '51 State Rd, Vineyard Haven, MA 02568', category = 'Professional Services', business_name = 'Cape Cod Five' WHERE id = 476; -- Cape Cod 5
UPDATE businesses SET town = 'Edgartown', full_address = '44 Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 487; -- Claudia Jewelry
UPDATE businesses SET town = 'Vineyard Haven', full_address = '21 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 496; -- Darosa's
UPDATE businesses SET town = 'Edgartown', full_address = '106 Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 503; -- E. C. Cottle, Inc.
UPDATE businesses SET town = 'Edgartown', full_address = '101 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Edgartown Paint Shoppe' WHERE id = 518; -- Edgartownpaintshoppe
UPDATE businesses SET town = 'Vineyard Haven', full_address = '16 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 523; -- Good Dog Goods
UPDATE businesses SET town = 'Oak Bluffs', full_address = '59 Circuit Ave, Oak Bluffs, MA 02557', category = 'Shopping & Retail', business_name = 'Island Music' WHERE id = 536; -- Islandmusic
UPDATE businesses SET town = 'West Tisbury', full_address = 'State Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 565; -- Martha's Vineyard Made
UPDATE businesses SET town = 'Chilmark', full_address = '30 Basin Rd, Menemsha, MA 02552', category = 'Restaurant', business_name = 'Menemsha Blues' WHERE id = 577; -- Menemshablues
UPDATE businesses SET town = 'Oak Bluffs', full_address = '84 Circuit Ave, Oak Bluffs, MA 02557', category = 'Arts & Entertainment', business_name = 'Martha''s Vineyard Escape Room' WHERE id = 593; -- Marthasvineyardescaperoom
UPDATE businesses SET town = 'Vineyard Haven', full_address = '9 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 606; -- Sea Bags
UPDATE businesses SET town = 'Edgartown', full_address = '93 Main St, Edgartown, MA 02539', category = 'Health & Wellness', business_name = 'Sea Spa Salon' WHERE id = 610; -- Sea Spasalon
UPDATE businesses SET town = 'Vineyard Haven', full_address = '71 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 620; -- Soft As a Grape
UPDATE businesses SET town = 'Oak Bluffs', full_address = '33 Lake Ave, Oak Bluffs, MA 02557', category = 'Shopping & Retail', business_name = 'Boneyard Surf Co' WHERE id = 637; -- Boneyard Surf Co.
UPDATE businesses SET town = 'Vineyard Haven', full_address = '67 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Vineyard Decorators' WHERE id = 652; -- Martha’s Vineyard Home Décor
UPDATE businesses SET town = 'West Tisbury', full_address = '695 State Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 656; -- Vineyard Hearth Patio & Spa
UPDATE businesses SET town = 'Vineyard Haven', full_address = '68 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 660; -- Vineyard Vines
UPDATE businesses SET town = 'Edgartown', full_address = '8 S Water St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Wheel Happy Bicycles' WHERE id = 663; -- Wheelhappybicycles
UPDATE businesses SET town = 'Oak Bluffs', full_address = '9 Oak Bluffs Ave, Oak Bluffs, MA 02557', category = 'Restaurant', business_name = '9 Craft Kitchen & Bar' WHERE id = 702; -- 9 Craft Kitchen And Bar
UPDATE businesses SET town = 'Vineyard Haven', full_address = '79 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'Beach Road Restaurant' WHERE id = 704; -- Beach Road
UPDATE businesses SET town = 'Oak Bluffs', full_address = '12 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 719; -- Martha's Vineyard Pizza
UPDATE businesses SET town = 'Vineyard Haven', full_address = '39 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 720; -- Art Cliff Diner
UPDATE businesses SET town = 'Oak Bluffs', full_address = '6 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 723; -- Rosie's Frozen Yogurt
UPDATE businesses SET town = 'Edgartown', full_address = '51 Main St, Edgartown, MA 02539', category = 'Restaurant' WHERE id = 728; -- La Strada

-- Corrected records
UPDATE businesses SET town = 'Vineyard Haven', full_address = '12 State Rd, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'La Choza' WHERE id = 204; -- The La Choza Difference: Flavo (corrected)
UPDATE businesses SET town = 'West Tisbury', full_address = '94 North Rd, West Tisbury, MA 02575', category = 'Community', business_name = 'Native Earth Teaching Farm' WHERE id = 231; -- Native Earth Teaching Farm (corrected)
UPDATE businesses SET town = 'Chilmark', full_address = '56 Basin Rd, Menemsha, MA 02552', category = 'Shopping & Retail', business_name = 'Larsen''s Fish Market' WHERE id = 253; -- Larsen (corrected)
UPDATE businesses SET town = 'Chilmark', full_address = '54 Basin Rd, Menemsha, MA 02552', category = 'Shopping & Retail', business_name = 'Menemsha Fish Market' WHERE id = 255; -- Menemsha Fish Market (corrected)
UPDATE businesses SET town = 'Vineyard Haven', full_address = 'Vineyard Haven, MA', category = 'Community', business_name = 'MV Narcotics Anonymous' WHERE id = 348; -- Mvana (corrected)
UPDATE businesses SET town = 'Vineyard Haven', full_address = '14 Beach St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Chicken Alley' WHERE id = 483; -- Chickenalley (corrected)
UPDATE businesses SET town = 'Edgartown', full_address = '20 Robinson Rd, Edgartown, MA 02539', category = 'Community', business_name = 'Edgartown Council on Aging' WHERE id = 512; -- The Edgartown Council on Aging (corrected)
UPDATE businesses SET town = 'Edgartown', full_address = '256 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Fine Fettle Dispensary' WHERE id = 520; -- Fine Fettle (corrected)
UPDATE businesses SET town = 'Edgartown', full_address = '141 Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Larry''s Tackle Shop' WHERE id = 549; -- Larry (corrected)
UPDATE businesses SET town = 'Edgartown', full_address = '38 Winter St, Edgartown, MA 02539', category = 'Health & Wellness', business_name = 'Revive by Sarka' WHERE id = 597; -- Revive by Sarka ~ European Ski (corrected)
UPDATE businesses SET town = 'West Tisbury', full_address = '688 State Rd, West Tisbury, MA 02575', category = 'Restaurant', business_name = 'Model Deli' WHERE id = 729; -- Model Deli Is a Model of Delic (corrected)

-- Records flagged invalid

-- EXCLUDED: The following records need manual review before inclusion:
-- ID 206: Mikado → Mikado (Vague name needs verification: "Mikado" → "Mikado"?)
-- ID 295: Louisa Gould Photographer → Louisa Gould Gallery (Possibly truncated: "Louisa Gould Gallery" (original: "Louisa Gould Photographer"))
-- ID 326: The Vineyard's Drive → Drive-In MV (Possibly truncated: "Drive-In MV" (original: "The Vineyard's Drive"))
-- ID 351: Airportfitness → Airport Fitness (Vague name needs verification: "Airportfitness" → "Airport Fitness"?)
-- ID 355: Crossfitmarthas → CrossFit Martha's Vineyard (Vague name needs verification: "Crossfitmarthas" → "CrossFit Martha's Vineyard"?)
-- ID 472: Brunos → Bruno's (Vague name needs verification: "Bruno's" → "Bruno's"?)
-- ID 478: Cb Stark Jewelers → C.B. Stark Jewelers (Vague name needs verification: "Cb Stark Jewelers" → "C.B. Stark Jewelers"?)
-- ID 540: Jardin Mahoney → Jardin Mahoney (Vague name needs verification: "Jardin Mahoney" → "Jardin Mahoney"?)
-- ID 608: Sea Legs → Sea Legs Clothing (Vague name needs verification: "Sea Legs" → "Sea Legs Clothing"?)
-- ID 618: Slip 77 → Slip 77 Prime (Vague name needs verification: "Slip 77" → "Slip 77 Prime"?)
-- ID 623: Sole → Sole Boutique (Vague name needs verification: "Sole" → "Sole Boutique"?)
-- ID 665: Sail Surf and Paddle on Martha's Vineyard → Wind's Up (Possibly truncated: "Wind's Up" (original: "Sail Surf and Paddle on Martha's Vineyard"))

COMMIT;
