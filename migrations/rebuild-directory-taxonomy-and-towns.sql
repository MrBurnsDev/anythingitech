-- Re-verification Migration
-- Generated: 2026-04-27T11:45:18.050Z
-- Based on systematic online verification of all businesses

BEGIN TRANSACTION;

-- Facebook homepage, not a business
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 34;
-- Name is "Menu" - scraped navigation element
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 227;
-- Website redirect/dead link
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 273;
-- Generic cinema chain URL, not MV specific
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 282;
-- Invalid website/photographer page error
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 306;
-- "Martha's Vineyard Island" - generic tourism site, not a business
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 30;
-- Square site template page, not a real business
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 79;
-- Square site placeholder
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 33;
-- "Edgartown, Ma Bars" - generic listing, not a business
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record' WHERE id = 123;
-- Aquinnah Shop is at 27 Aquinnah Circle, Aquinnah
UPDATE businesses SET town = 'Aquinnah' WHERE id = 10;
-- Rockfish is on Water Street, Edgartown (not Oak Bluffs)
UPDATE businesses SET town = 'Edgartown' WHERE id = 105;
-- Winston's Kitchen is at 1 East Chop Drive, Oak Bluffs
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 183;
-- Located on State Road, Vineyard Haven
UPDATE businesses SET town = 'Vineyard Haven', category = 'Restaurants, Food & Beverages', business_name = 'Mikado Asian Bistro' WHERE id = 206;
-- Located in Vineyard Haven
UPDATE businesses SET town = 'Vineyard Haven', category = 'Arts & Entertainment', business_name = 'Louisa Gould Gallery' WHERE id = 295;
-- Granary Gallery - art gallery
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 7;
-- Art gallery, not restaurant
UPDATE businesses SET category = 'Arts & Entertainment', business_name = 'Menemsha Gallery' WHERE id = 45;
-- Larsen's Fish Market - retail fish market
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 253;
-- Menemsha Fish Market - retail fish market
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 255;
-- Edgartown Seafood - retail fish market
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 251;
-- The Net Result - retail fish market
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 257;
-- Eisenhauer Gallery - art gallery
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 286;
-- Featherstone Center for the Arts
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 288;
-- Field Gallery - art gallery
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 290;
-- Island Folk Pottery - art/crafts
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 293;
-- 51art Gallery at Shoppe With Red Door
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 276;
-- Photography/art
UPDATE businesses SET category = 'Arts & Entertainment', business_name = 'Alison Shaw Photography' WHERE id = 278;
-- Blanchard Photography
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 280;
-- MV Glassworks - art glass
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 297;
-- Merry Farm Pottery - art/crafts
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 304;
-- Moore Family Gallery
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 308;
-- MV Museum
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 300;
-- MV Film Festival
UPDATE businesses SET category = 'Arts & Entertainment' WHERE id = 8;
-- Clean up name from scraped data
UPDATE businesses SET business_name = 'China House' WHERE id = 72;
-- Clean up name from "Prepared Food"
UPDATE businesses SET business_name = 'Black Sheep' WHERE id = 66;
-- Clean up name from "Kgs 2"
UPDATE businesses SET business_name = 'Katama General Store' WHERE id = 91;
-- Clean up name
UPDATE businesses SET business_name = 'Aalias Coffee' WHERE id = 129;
-- Clean up name
UPDATE businesses SET business_name = 'Coop de Ville' WHERE id = 141;
-- Clean up URL-based name
UPDATE businesses SET business_name = 'Farm Neck Cafe' WHERE id = 148;
-- Clean up name
UPDATE businesses SET business_name = 'Fat Ronnie''s Burger Bar' WHERE id = 150;
-- Community org, not restaurant
UPDATE businesses SET category = 'Family, Community & Government', business_name = 'Island Grown Initiative Food Pantry' WHERE id = 156;
-- Located in Oak Bluffs, not NH
UPDATE businesses SET town = 'Oak Bluffs', business_name = 'Jimmy Seas' WHERE id = 158;
-- Clean up name
UPDATE businesses SET business_name = 'Edgartown Meat & Fish' WHERE id = 83;
-- Clean up name
UPDATE businesses SET business_name = 'The Seafood Shanty' WHERE id = 109;
-- Clean up name
UPDATE businesses SET business_name = 'Square Rigger Restaurant' WHERE id = 114;
-- Clean up name
UPDATE businesses SET business_name = 'Rockfish' WHERE id = 105;
-- Aquinnah Shop is a gift shop, not lodging
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 10;
-- Winnetu Resort
UPDATE businesses SET category = 'Lodging & Tourism' WHERE id = 119;
-- Harbor View Hotel
UPDATE businesses SET category = 'Lodging & Tourism' WHERE id = 4;
-- Mansion House
UPDATE businesses SET category = 'Lodging & Tourism' WHERE id = 5;
-- Cronig's Market - grocery store
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 239;
-- Reliable Market - grocery store
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 244;
-- Vineyard Grocer
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 249;
-- Great Harbor Market - grocery
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 89;
-- Tony's Market - grocery
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 181;
-- Chilmark General Store - general store
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 41;
-- Liquor store
UPDATE businesses SET category = 'Shopping & Specialty Retail', business_name = 'Jim''s Package Store' WHERE id = 260;
-- MV Wine Store
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 262;
-- Wine/spirits
UPDATE businesses SET category = 'Shopping & Specialty Retail', business_name = 'Vintage MV Wine & Spirits' WHERE id = 266;
-- Pharmacy
UPDATE businesses SET category = 'Medical Services & Providers', business_name = 'Conroy Apothecary' WHERE id = 270;
-- Allen Farm - wool/crafts retail
UPDATE businesses SET category = 'Shopping & Specialty Retail' WHERE id = 229;
-- Native Earth Teaching Farm - educational nonprofit
UPDATE businesses SET category = 'Family, Community & Government' WHERE id = 231;
-- North Tabor Farm - farm with food sales
UPDATE businesses SET category = 'Restaurants, Food & Beverages' WHERE id = 233;
-- Morning Glory Farm - farm stand
UPDATE businesses SET category = 'Restaurants, Food & Beverages' WHERE id = 100;
-- Bad Martha Beer - brewery
UPDATE businesses SET category = 'Restaurants, Food & Beverages' WHERE id = 60;
-- MV Magazine - media/publishing
UPDATE businesses SET category = 'Business & Professional Services' WHERE id = 31;
-- Government/public safety
UPDATE businesses SET category = 'Family, Community & Government', business_name = 'Edgartown Fire Department' WHERE id = 284;

-- Clear manual review for verified businesses
UPDATE businesses SET needs_manual_review = 0, review_reason = NULL WHERE id IN (206, 295);

COMMIT;