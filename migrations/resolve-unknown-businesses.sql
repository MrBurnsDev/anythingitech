-- Resolve Unknown Businesses
-- Generated: 2026-04-26T01:16:11.698Z
-- Method: Deterministic verification using known business database
-- DO NOT APPLY WITHOUT REVIEW

BEGIN TRANSACTION;

-- Resolved businesses: Update town, address, category
UPDATE businesses SET town = 'Vineyard Haven', full_address = '20 Beach Rd, Vineyard Haven, MA 02568', category = 'Professional Services' WHERE id = 31; -- Martha's Vineyard Magazine
UPDATE businesses SET town = 'Vineyard Haven', full_address = '39 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 191; -- Artcliff Diner
UPDATE businesses SET town = 'Oak Bluffs', full_address = '90 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant', business_name = 'Bobby B''s' WHERE id = 196; -- Bobbybs
UPDATE businesses SET town = 'Oak Bluffs', full_address = '94 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 200; -- Delicious MV
UPDATE businesses SET town = 'Vineyard Haven', full_address = '12 State Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 204; -- The La Choza Difference: Flavo
UPDATE businesses SET town = 'Oak Bluffs', full_address = '64 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 206; -- Mikado
UPDATE businesses SET town = 'Vineyard Haven', full_address = '15 Main St, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'Mocha Mott''s' WHERE id = 208; -- About Motts
UPDATE businesses SET town = 'Vineyard Haven', full_address = '977 State Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 219; -- Scottish Bakehouse
UPDATE businesses SET town = 'West Tisbury', full_address = '94 North Rd, West Tisbury, MA 02575', category = 'Community' WHERE id = 231; -- Native Earth Teaching Farm
UPDATE businesses SET town = 'Chilmark', full_address = '56 Basin Rd, Menemsha, MA 02552', category = 'Restaurant' WHERE id = 253; -- Larsen
UPDATE businesses SET town = 'Chilmark', full_address = '54 Basin Rd, Menemsha, MA 02552', category = 'Restaurant' WHERE id = 255; -- Menemsha Fish Market
UPDATE businesses SET town = 'Edgartown', full_address = '196 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'MV Wine Store' WHERE id = 262; -- Mvwine Store
UPDATE businesses SET town = 'West Tisbury', full_address = 'West Tisbury, MA 02575', category = 'Professional Services', business_name = 'Blanchard Photography' WHERE id = 280; -- Blanchardphoto
UPDATE businesses SET town = 'Vineyard Haven', full_address = '54 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Louisa Gould Gallery' WHERE id = 295; -- Louisa Gould Photographer
UPDATE businesses SET town = 'West Tisbury', full_address = '674 Lambert''s Cove Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 304; -- Merry Farm Pottery
UPDATE businesses SET town = 'Oak Bluffs', full_address = '77 Oak Bluffs Ave, Oak Bluffs, MA 02557', category = 'Arts & Entertainment', business_name = 'Drive-In MV' WHERE id = 326; -- The Vineyard's Drive
UPDATE businesses SET town = 'Vineyard Haven', full_address = 'Vineyard Haven, MA', category = 'Community', business_name = 'MV Addiction, Narcotics Anonymous' WHERE id = 348; -- Mvana
UPDATE businesses SET town = 'Vineyard Haven', full_address = '12 Airport Rd, Vineyard Haven, MA 02568', category = 'Health & Wellness' WHERE id = 351; -- Airportfitness
UPDATE businesses SET town = 'Vineyard Haven', full_address = '12 Airport Rd, Vineyard Haven, MA 02568', category = 'Health & Wellness' WHERE id = 355; -- Crossfitmarthas
UPDATE businesses SET town = 'Oak Bluffs', full_address = '50 Kennebec Ave, Oak Bluffs, MA 02557', category = 'Health & Wellness' WHERE id = 372; -- Vineyard Vinyasa
UPDATE businesses SET town = 'Oak Bluffs', full_address = '70 Lake Ave, Oak Bluffs, MA 02557', category = 'Lodging' WHERE id = 417; -- Summercamp Hotel
UPDATE businesses SET town = 'Chilmark', full_address = '5 North Rd, Chilmark, MA 02535', category = 'Lodging' WHERE id = 425; -- Captain Flanders Inn
UPDATE businesses SET town = 'Aquinnah', full_address = '10 Duck Pond Way, Aquinnah, MA 02535', category = 'Lodging', business_name = 'Duck Inn' WHERE id = 431; -- Duckinnon
UPDATE businesses SET town = 'Edgartown', full_address = '27 N Water St, Edgartown, MA 02539', category = 'Lodging' WHERE id = 433; -- Lark Hotels
UPDATE businesses SET town = 'Edgartown', full_address = '30 Main St, Edgartown, MA 02539', category = 'Health & Wellness', business_name = 'Bellezza MV Salon' WHERE id = 463; -- Bellezzamvsalon
UPDATE businesses SET town = 'Vineyard Haven', full_address = '14 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Brickman''s' WHERE id = 470; -- Brickman
UPDATE businesses SET town = 'Oak Bluffs', full_address = '102 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant', business_name = 'Bruno''s' WHERE id = 472; -- Brunos
UPDATE businesses SET town = 'Vineyard Haven', full_address = '51 State Rd, Vineyard Haven, MA 02568', category = 'Professional Services', business_name = 'Cape Cod Five' WHERE id = 476; -- Cape Cod 5
UPDATE businesses SET town = 'Vineyard Haven', full_address = '53A Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 478; -- Cb Stark Jewelers
UPDATE businesses SET town = 'Vineyard Haven', full_address = '14 Beach St, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'Chicken Alley' WHERE id = 483; -- Chickenalley
UPDATE businesses SET town = 'Edgartown', full_address = '44 Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 487; -- Claudia Jewelry
UPDATE businesses SET town = 'Vineyard Haven', full_address = '21 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 496; -- Darosa's
UPDATE businesses SET town = 'Edgartown', full_address = '106 Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 503; -- E. C. Cottle, Inc.
UPDATE businesses SET town = 'Edgartown', full_address = '20 Robinson Rd, Edgartown, MA 02539', category = 'Community' WHERE id = 512; -- The Edgartown Council on Aging
UPDATE businesses SET town = 'Edgartown', full_address = '101 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Edgartown Paint Shoppe' WHERE id = 518; -- Edgartownpaintshoppe
UPDATE businesses SET town = 'Edgartown', full_address = '256 Upper Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 520; -- Fine Fettle
UPDATE businesses SET town = 'Vineyard Haven', full_address = '16 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 523; -- Good Dog Goods
UPDATE businesses SET town = 'Oak Bluffs', full_address = '59 Circuit Ave, Oak Bluffs, MA 02557', category = 'Shopping & Retail', business_name = 'Island Music' WHERE id = 536; -- Islandmusic
UPDATE businesses SET town = 'Vineyard Haven', full_address = '81 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 540; -- Jardin Mahoney
UPDATE businesses SET town = 'Edgartown', full_address = '141 Main St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 549; -- Larry
UPDATE businesses SET town = 'West Tisbury', full_address = 'State Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 565; -- Martha's Vineyard Made
UPDATE businesses SET town = 'Chilmark', full_address = '30 Basin Rd, Menemsha, MA 02552', category = 'Restaurant', business_name = 'Menemsha Blues' WHERE id = 577; -- Menemshablues
UPDATE businesses SET town = 'Oak Bluffs', full_address = '84 Circuit Ave, Oak Bluffs, MA 02557', category = 'Arts & Entertainment', business_name = 'Martha''s Vineyard Escape Room' WHERE id = 593; -- Marthasvineyardescaperoom
UPDATE businesses SET town = 'Edgartown', full_address = '38 Winter St, Edgartown, MA 02539', category = 'Health & Wellness' WHERE id = 597; -- Revive by Sarka ~ European Ski
UPDATE businesses SET town = 'Vineyard Haven', full_address = '9 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 606; -- Sea Bags
UPDATE businesses SET town = 'Edgartown', full_address = '25 Church St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 608; -- Sea Legs
UPDATE businesses SET town = 'Edgartown', full_address = '93 Main St, Edgartown, MA 02539', category = 'Health & Wellness', business_name = 'Sea Spa Salon' WHERE id = 610; -- Sea Spasalon
UPDATE businesses SET town = 'Oak Bluffs', full_address = '77 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 618; -- Slip 77
UPDATE businesses SET town = 'Vineyard Haven', full_address = '71 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 620; -- Soft As a Grape
UPDATE businesses SET town = 'Edgartown', full_address = '14 Church St, Edgartown, MA 02539', category = 'Shopping & Retail' WHERE id = 623; -- Sole
UPDATE businesses SET town = 'Oak Bluffs', full_address = '33 Lake Ave, Oak Bluffs, MA 02557', category = 'Shopping & Retail', business_name = 'Boneyard Surf Co' WHERE id = 637; -- Boneyard Surf Co.
UPDATE businesses SET town = 'Vineyard Haven', full_address = '67 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Vineyard Decorators' WHERE id = 652; -- Martha’s Vineyard Home Décor
UPDATE businesses SET town = 'West Tisbury', full_address = '695 State Rd, West Tisbury, MA 02575', category = 'Shopping & Retail' WHERE id = 656; -- Vineyard Hearth Patio & Spa
UPDATE businesses SET town = 'Vineyard Haven', full_address = '68 Main St, Vineyard Haven, MA 02568', category = 'Shopping & Retail' WHERE id = 660; -- Vineyard Vines
UPDATE businesses SET town = 'Edgartown', full_address = '8 S Water St, Edgartown, MA 02539', category = 'Shopping & Retail', business_name = 'Wheel Happy Bicycles' WHERE id = 663; -- Wheelhappybicycles
UPDATE businesses SET town = 'Oak Bluffs', full_address = '199 Beach Rd, Vineyard Haven, MA 02568', category = 'Shopping & Retail', business_name = 'Wind''s Up' WHERE id = 665; -- Sail Surf and Paddle on Martha
UPDATE businesses SET town = 'Oak Bluffs', full_address = '9 Oak Bluffs Ave, Oak Bluffs, MA 02557', category = 'Restaurant', business_name = '9 Craft Kitchen & Bar' WHERE id = 702; -- 9 Craft Kitchen And Bar
UPDATE businesses SET town = 'Vineyard Haven', full_address = '79 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant', business_name = 'Beach Road Restaurant' WHERE id = 704; -- Beach Road
UPDATE businesses SET town = 'Oak Bluffs', full_address = '12 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 719; -- Martha's Vineyard Pizza
UPDATE businesses SET town = 'Vineyard Haven', full_address = '39 Beach Rd, Vineyard Haven, MA 02568', category = 'Restaurant' WHERE id = 720; -- Art Cliff Diner
UPDATE businesses SET town = 'Oak Bluffs', full_address = '6 Circuit Ave, Oak Bluffs, MA 02557', category = 'Restaurant' WHERE id = 723; -- Rosie's Frozen Yogurt
UPDATE businesses SET town = 'Edgartown', full_address = '51 Main St, Edgartown, MA 02539', category = 'Restaurant' WHERE id = 728; -- La Strada
UPDATE businesses SET town = 'West Tisbury', full_address = '688 State Rd, West Tisbury, MA 02575', category = 'Restaurant' WHERE id = 729; -- Model Deli Is a Model of Delic

-- Invalid records: Flag for review or removal
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: unclear_business' WHERE id = 273; -- Vineyard Scripts
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: url_as_name', town = 'Edgartown' WHERE id = 282; -- Entertainmentcinemas.Com/Locat
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: unclear_business' WHERE id = 306; -- Michaeljimage
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: social_media_platform' WHERE id = 328; -- Instagram
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: national_organization' WHERE id = 349; -- Refuge Recovery World Services
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: national_organization' WHERE id = 350; -- Smart Recovery
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: page_error' WHERE id = 368; -- Redirecting...
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: generic_booking_site' WHERE id = 399; -- Book a Hostel
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: unclear_business' WHERE id = 459; -- Altheadesigns
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: domain_as_name' WHERE id = 461; -- Basicsandeastaway.company
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: domain_as_name' WHERE id = 466; -- Binks Auto.business
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: page_error' WHERE id = 485; -- Account Suspended
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: url_as_name' WHERE id = 489; -- Secure.myvanco.com/ygss/campai
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: business_closed' WHERE id = 591; -- Phillips Hardware Closed
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: undefined', town = 'Vineyard Haven' WHERE id = 599; -- Personal & Business Banking
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: unclear_business' WHERE id = 629; -- Summershadessunglasses
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: government_url', town = 'Vineyard Haven' WHERE id = 646; -- Tisburyma.Gov/Council-Aging

-- Still unknown: Set town to Unknown

COMMIT;
