-- Gazette Safe Updates Migration
-- Generated: 2026-04-29T03:08:50.006Z
-- Policy: Fill missing fields only, normalize URLs, add verification source
-- Total updates: 124

BEGIN;

-- Create backup table for rollback
CREATE TABLE IF NOT EXISTS _gazette_import_backup_20260429 AS
SELECT id, name, address, phone, website, verification_source, last_verified_at
FROM businesses
WHERE id IN (36, 38, 41, 45, 47, 49, 724, 712, 60, 66, 70, 76, 722, 83, 721, 87, 89, 91, 93, 97, 716, 107, 109, 112, 114, 117, 119, 121, 127, 129, 131, 133, 135, 710, 141, 143, 145, 150, 152, 160, 162, 166, 168, 711, 172, 174, 177, 181, 183, 185, 187, 189, 1, 198, 200, 202, 204, 206, 210, 213, 217, 219, 221, 225, 229, 715, 239, 249, 251, 257, 266, 270, 276, 280, 286, 290, 7, 295, 297, 8, 318, 322, 324, 329, 331, 333, 342, 343, 346, 353, 359, 367, 370, 372, 375, 381, 383, 390, 412, 415, 417, 433, 435, 437, 441, 444, 6, 518, 520, 671, 551, 553, 561, 583, 694, 691, 672, 597, 603, 625, 626, 689, 686, 637);

-- Orange Peel Bakery (ID: 36)
UPDATE businesses SET
  address = '22 State Rd, Aquinnah, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 36;

-- Outermost Inn (ID: 38)
UPDATE businesses SET
  address = '81 Lighthouse Rd, Aquinnah, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 38;

-- Chilmark General Store (ID: 41)
UPDATE businesses SET
  phone = '(508) 645-3739',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 41;

-- Menemsha Gallery (ID: 45)
UPDATE businesses SET
  phone = '(508) 645-9819',
  address = '515 N Rd, Chilmark, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 45;

-- The Homeport (ID: 47)
UPDATE businesses SET
  address = '512 N Rd, Chilmark, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 47;

-- 19 Prime Steak House (ID: 49)
UPDATE businesses SET
  address = '19 Church St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 49;

-- Alchemy (ID: 724)
UPDATE businesses SET
  website = 'https://alchemyedgartown.com',
  address = '71 Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 724;

-- Atria (ID: 712)
UPDATE businesses SET
  website = 'https://atriamv.com',
  address = '137 Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 712;

-- Bad Martha Beer (ID: 60)
UPDATE businesses SET
  address = '270 Upper Main Street Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 60;

-- Black Sheep (ID: 66)
UPDATE businesses SET
  address = '17 Airport Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 66;

-- Chesca (ID: 70)
UPDATE businesses SET
  address = '38 N Water St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 70;

-- Détente (ID: 76)
UPDATE businesses SET
  phone = '(508) 627-8810',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 76;

-- Edgartown Diner 🍨 (ID: 722)
UPDATE businesses SET
  address = '65 Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 722;

-- Edgartown Meat & Fish (ID: 83)
UPDATE businesses SET
  address = '240 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 83;

-- Edgartown Pizza 🍕 (ID: 721)
UPDATE businesses SET
  address = '224 Edgartown Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 721;

-- Espresso Love (ID: 87)
UPDATE businesses SET
  phone = '(508) 627-9211',
  address = '17 Church St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 87;

-- Great Harbor Market (ID: 89)
UPDATE businesses SET
  address = '199 Upper Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 89;

-- Katama General Store (ID: 91)
UPDATE businesses SET
  address = '170 Katama Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 91;

-- Katama Kitchen (ID: 93)
UPDATE businesses SET
  address = '12 Mattakesett Way, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 93;

-- Lucky Hank's (ID: 97)
UPDATE businesses SET
  address = '218 Upper Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 97;

-- The Pelican Club (ID: 716)
UPDATE businesses SET
  address = '23 Kelly St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 716;

-- Rosewater (ID: 107)
UPDATE businesses SET
  website = 'https://rosewatermv.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 107;

-- The Seafood Shanty (ID: 109)
UPDATE businesses SET
  address = '31 Dock St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 109;

-- Soigne (ID: 112)
UPDATE businesses SET
  address = '190 Upper Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 112;

-- Square Rigger Restaurant (ID: 114)
UPDATE businesses SET
  phone = '(508) 627-9968',
  address = '225 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 114;

-- The Covington Restaurant and Bar (ID: 117)
UPDATE businesses SET
  address = '52 Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 117;

-- Winnetu Oceanside Resort (ID: 119)
UPDATE businesses SET
  address = '31 Dunes Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 119;

-- The Porthunter (ID: 121)
UPDATE businesses SET
  phone = '(508) 627-7747',
  address = '55 Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 121;

-- Wolf's Den Pizzeria (ID: 127)
UPDATE businesses SET
  website = 'https://wolfsdenpizzeria.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 127;

-- Aalias Coffee (ID: 129)
UPDATE businesses SET
  phone = '(508) 687-9849',
  address = '16 Kennebec Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 129;

-- Back Door Donuts (ID: 131)
UPDATE businesses SET
  address = '1-11 Kennebec Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 131;

-- Bangkok Cuisine (ID: 133)
UPDATE businesses SET
  address = '67 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 133;

-- Benandbills (ID: 135)
UPDATE businesses SET
  address = '20a Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 135;

-- Biscuits (ID: 710)
UPDATE businesses SET
  website = 'https://mvbiscuits.com',
  address = '26 Lake Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 710;

-- Coop de Ville (ID: 141)
UPDATE businesses SET
  phone = '(508) 693-3420',
  address = '12 Circuit Avenue Extension, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 141;

-- Dos Mas MV (ID: 143)
UPDATE businesses SET
  address = '50 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 143;

-- Eleven Circuit (ID: 145)
UPDATE businesses SET
  address = '11 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 145;

-- Fat Ronnie's Burger Bar (ID: 150)
UPDATE businesses SET
  phone = '(508) 593-6600',
  address = '7 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 150;

-- Fishbones Bar & Grille (ID: 152)
UPDATE businesses SET
  address = '12 Circuit Avenue Extension, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 152;

-- Lobster Ville (ID: 160)
UPDATE businesses SET
  phone = '(508) 696-0099',
  address = '8 Circuit Avenue Extension, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 160;

-- Lookout Tavern (ID: 162)
UPDATE businesses SET
  address = '8 Seaview Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 162;

-- Mikado Asian Bistro @ Oak Bluffs (ID: 166)
UPDATE businesses SET
  phone = '(508) 687-9119',
  address = '6 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 166;

-- Offshore Ale Company (ID: 168)
UPDATE businesses SET
  address = '30 Kennebec Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 168;

-- Red Cat Kitchen (ID: 711)
UPDATE businesses SET
  website = 'https://redcatkitchen.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 711;

-- Sharky's Oak Bluffs (ID: 172)
UPDATE businesses SET
  address = '31 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 172;

-- The Barn Bowl & Bistro (ID: 174)
UPDATE businesses SET
  address = '13 Uncas Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 174;

-- The Ritz Cafe (ID: 177)
UPDATE businesses SET
  address = '4 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 177;

-- Tony's Market (ID: 181)
UPDATE businesses SET
  address = '119 Dukes County Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 181;

-- Winston (ID: 183)
UPDATE businesses SET
  website = 'https://winstonskitchen-mv.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 183;

-- 7a Foods Martha's Vineyard (ID: 185)
UPDATE businesses SET
  address = '1045 State Rd, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 185;

-- State Road Restaurant (ID: 187)
UPDATE businesses SET
  address = '688 State Rd, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 187;

-- Vineyard Take Out (ID: 189)
UPDATE businesses SET
  website = 'https://vineyardtakeoutmenu.com',
  address = '479 State Rd, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 189;

-- The Black Dog Tavern Company (ID: 1)
UPDATE businesses SET
  website = 'https://theblackdog.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 1;

-- Catboat Coffee Co. (ID: 198)
UPDATE businesses SET
  address = '79 Beach Road, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 198;

-- Delicious MV (ID: 200)
UPDATE businesses SET
  phone = '(508) 693-2223',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 200;

-- Island Fresh Pizza (ID: 202)
UPDATE businesses SET
  address = '395 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 202;

-- La Choza (ID: 204)
UPDATE businesses SET
  phone = '(508) 693-9050',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 204;

-- Mikado Asian Bistro (ID: 206)
UPDATE businesses SET
  phone = '(508) 338-7096',
  address = '76 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 206;

-- Nook (ID: 210)
UPDATE businesses SET
  address = '38 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 210;

-- Porto Pizza Martha's Vineyard (ID: 213)
UPDATE businesses SET
  address = '36 Water St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 213;

-- Authentic Italian Food (ID: 217)
UPDATE businesses SET
  address = '20 Union St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 217;

-- Scottish Bakehouse (ID: 219)
UPDATE businesses SET
  phone = '(508) 693-6633',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 219;

-- Sweet Bites (ID: 221)
UPDATE businesses SET
  address = '32 Beach St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 221;

-- Waterside Market (ID: 225)
UPDATE businesses SET
  address = '82 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 225;

-- Allen Farm Sheep & Wool Company (ID: 229)
UPDATE businesses SET
  address = '421 S Rd, Chilmark, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 229;

-- The Grey Barn & Farm (ID: 715)
UPDATE businesses SET
  website = 'https://thegreybarnandfarm.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 715;

-- Cronigs Market (ID: 239)
UPDATE businesses SET
  address = '357 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 239;

-- Vineyard Grocer (ID: 249)
UPDATE businesses SET
  address = '294 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 249;

-- Edgartown Seafood Fish Market (ID: 251)
UPDATE businesses SET
  address = '138 Cooke St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 251;

-- The Net Result (ID: 257)
UPDATE businesses SET
  address = '79 Beach Road, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 257;

-- Vintage MV Wine & Spirits (ID: 266)
UPDATE businesses SET
  address = '29 Winter St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 266;

-- Conroy Apothecary (ID: 270)
UPDATE businesses SET
  address = '59 State Rd A, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 270;

-- 51art Gallery Located at the Shoppe With the Red Door (ID: 276)
UPDATE businesses SET
  phone = '(508) 338-7703',
  website = 'https://theshoppewiththereddoor.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 276;

-- Blanchard Photography (ID: 280)
UPDATE businesses SET
  phone = '(617) 448-3934',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 280;

-- Eisenhauer Gallery (ID: 286)
UPDATE businesses SET
  phone = '(508) 627-7003',
  address = '38 N Water St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 286;

-- Field Gallery (ID: 290)
UPDATE businesses SET
  address = '1050 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 290;

-- Granary Gallery (ID: 7)
UPDATE businesses SET
  website = 'https://granarygallery.com',
  address = '636 Old County Road, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 7;

-- Louisa Gould Gallery (ID: 295)
UPDATE businesses SET
  phone = '(508) 693-7373',
  address = '54 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 295;

-- MV Glassworks (ID: 297)
UPDATE businesses SET
  address = '683 State Rd, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 297;

-- Martha's Vineyard Film Festival (ID: 8)
UPDATE businesses SET
  phone = '(508) 696-9369',
  website = 'https://mvfilmsociety.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 8;

-- Strand Theatre MV (ID: 318)
UPDATE businesses SET
  address = 'Oak Bluffs Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 318;

-- The Christina Gallery (ID: 322)
UPDATE businesses SET
  address = '5 Winter Street, Edgartown MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 322;

-- Peter Simon Photography (ID: 324)
UPDATE businesses SET
  phone = '(508) 325-2242',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 324;

-- The Yard (ID: 329)
UPDATE businesses SET
  address = '1 The Yard, Chilmark, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 329;

-- Tuck & Holand Metal Sculptors (ID: 331)
UPDATE businesses SET
  address = '275 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 331;

-- Vineyard Arts Project (ID: 333)
UPDATE businesses SET
  address = '215 Upper Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 333;

-- Mink Meadows Golf Club (ID: 342)
UPDATE businesses SET
  website = 'https://minkmeadowsgc.com',
  address = '320 Golf Club Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 342;

-- The Polly Hill Arboretum (ID: 343)
UPDATE businesses SET
  address = '809 State Rd, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 343;

-- Vineyard Golf Club (ID: 346)
UPDATE businesses SET
  website = 'https://vineyardgolf.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 346;

-- B Strong (ID: 353)
UPDATE businesses SET
  address = '29 Kennebec Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 353;

-- Hot Yoga MV (ID: 359)
UPDATE businesses SET
  address = '497 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 359;

-- Vcmpt (ID: 367)
UPDATE businesses SET
  address = '238 Edgartown-Vineyard Haven Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 367;

-- Vineyard Medical Care (ID: 370)
UPDATE businesses SET
  address = '364 State Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 370;

-- Vineyard Vinyasa (ID: 372)
UPDATE businesses SET
  phone = '(508) 560-2178',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 372;

-- Marthas Vineyard Yoga Barn (ID: 375)
UPDATE businesses SET
  address = '1 Red Barn Road, West Tisbury, MA 02575',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 375;

-- Dockside Inn (ID: 381)
UPDATE businesses SET
  address = '9 Circuit Avenue Extension, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 381;

-- Dunmere House (ID: 383)
UPDATE businesses SET
  address = '7 Pennacook Ave, Oak Bluffs MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 383;

-- Luxury Boutique Hotel Edgartown (ID: 390)
UPDATE businesses SET
  address = '222 Upper Main St, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 390;

-- Narragansett House (ID: 412)
UPDATE businesses SET
  address = '46 Narragansett Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 412;

-- Martha’s Vineyard Hotels (ID: 415)
UPDATE businesses SET
  address = '19 Pequot Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 415;

-- Summercamp Hotel (ID: 417)
UPDATE businesses SET
  phone = '(508) 693-6611',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 417;

-- Lark Hotels (ID: 433)
UPDATE businesses SET
  phone = '(508) 939-4005',
  website = 'https://larkhotels.com/hotels/the-edgartown-collection',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 433;

-- Vacasa.com/usa/the-island-inn (ID: 435)
UPDATE businesses SET
  website = 'https://vacasa.com/usa/the-island-inn-ma',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 435;

-- Lightkeepers Inn (ID: 437)
UPDATE businesses SET
  address = '25 Simpsons Ln, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 437;

-- Oak Bluffs Inn (ID: 441)
UPDATE businesses SET
  address = '64 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 441;

-- Martha’s Vineyard Surfside Hotel: Martha’s Vineyard Hotels (ID: 444)
UPDATE businesses SET
  address = '7 Oak Bluffs Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 444;

-- Bunch of Grapes Bookstore (ID: 6)
UPDATE businesses SET
  address = '23 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 6;

-- Edgartown Paint Shoppe (ID: 518)
UPDATE businesses SET
  phone = '(508) 627-5112',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 518;

-- Fine Fettle Dispensary (ID: 520)
UPDATE businesses SET
  phone = '(508) 687-0131',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 520;

-- Lani Beach Club (ID: 671)
UPDATE businesses SET
  address = '25 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 671;

-- Lazy Frog (ID: 551)
UPDATE businesses SET
  address = '42 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 551;

-- Leroux Kitchen (ID: 553)
UPDATE businesses SET
  address = '62 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 553;

-- Martha's Bike (ID: 561)
UPDATE businesses SET
  address = '4 Lagoon Pond Rd, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 561;

-- North Line Shell (ID: 583)
UPDATE businesses SET
  address = '3 N Line Rd, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 583;

-- Off Main (ID: 694)
UPDATE businesses SET
  address = '76 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 694;

-- Olive Branch Fair Trade (ID: 691)
UPDATE businesses SET
  website = 'https://olivebranchfairtrade.org',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 691;

-- Rainy Day (ID: 672)
UPDATE businesses SET
  address = '66 Main St, Vineyard Haven, MA 02568',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 672;

-- Revive by Sarka (ID: 597)
UPDATE businesses SET
  phone = '(774) 521-6060',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 597;

-- Sanctuary Martha's Vineyard (ID: 603)
UPDATE businesses SET
  phone = '(508) 693-9600',
  address = '42 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 603;

-- Spa L'eau MV (ID: 625)
UPDATE businesses SET
  address = 'One Mariners Landing, #C, Edgartown, MA 02539',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 625;

-- Stefanie Wolf Designs Artisan Jewelry From Martha's Vineyard (ID: 626)
UPDATE businesses SET
  address = '37 Circuit Ave, Oak Bluffs, MA 02557',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 626;

-- Stony Creek Gifts (ID: 689)
UPDATE businesses SET
  address = '27 Aquinnah Cir, Aquinnah, MA 02535',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 689;

-- Tending Joy Artisan Shop (ID: 686)
UPDATE businesses SET
  website = 'https://tendingjoy.com',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 686;

-- Boneyard Surf Co (ID: 637)
UPDATE businesses SET
  phone = '(508) 627-7907',
  verification_source = 'vineyard_gazette_business_directory',
  last_verified_at = NOW()
WHERE id = 637;

COMMIT;

-- Summary:
-- Address fills: 20
-- Phone fills: 29
-- Website fills: 0
-- Website normalizations: 19
-- ZIP additions: 78
