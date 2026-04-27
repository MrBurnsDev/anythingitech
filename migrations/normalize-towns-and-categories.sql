-- Town and Category Normalization Migration
-- Generated: 2026-04-25T12:27:15.580Z
-- Total corrections: 207
--
-- IMPORTANT: Review this file before applying!
-- Run with: sqlite3 data/mv_registry.db < migrations/normalize-towns-and-categories.sql

BEGIN TRANSACTION;

-- Town corrections
UPDATE businesses SET town = 'West Tisbury' WHERE id = 7; -- Granary Gallery: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 10; -- Aquinnah Shop: Aquinnah -> Chilmark (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 30; -- Martha's Vineyard Island: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 31; -- Martha's Vineyard Magazine: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 105; -- Rockfishedgartown: Edgartown -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Vineyard Haven' WHERE id = 183; -- Winston: Oak Bluffs -> Vineyard Haven (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 191; -- Artcliff Diner: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 196; -- Bobbybs: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 200; -- Delicious MV: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 204; -- The La Choza Difference: Flavor Without : Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 206; -- Mikado: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 208; -- About Motts: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 219; -- Scottish Bakehouse: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Chilmark' WHERE id = 229; -- Allen Farm Sheep & Wool Company: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 231; -- Native Earth Teaching Farm: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Chilmark' WHERE id = 233; -- North Tabor Farm: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 244; -- The Reliable Market: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 251; -- Edgartown Seafood Fish Market: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 253; -- Larsen: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 255; -- Menemsha Fish Market: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 260; -- Jim's Package Store: Vineyard Haven -> Oak Bluffs (address_parsing)
UPDATE businesses SET town = 'Unknown' WHERE id = 262; -- Mvwine Store: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 266; -- Vintage MV Wine & Spirits: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 273; -- Vineyard Scripts: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 278; -- Sue: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 280; -- Blanchardphoto: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 282; -- Entertainmentcinemas.Com/Locations/Edgar: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 284; -- Edgartown Firemen's Association: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 286; -- Eisenhauer Gallery: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 288; -- Featherstone Center for the Arts: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 290; -- Field Gallery: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 293; -- Island Folk Pottery: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 295; -- Louisa Gould Photographer: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 297; -- MV Glassworks: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 304; -- Merry Farm Pottery: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 306; -- Michaeljimage: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 308; -- Moore Family Gallery: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 310; -- MV Camp Meeting Association: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 312; -- North Water Gallery: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 314; -- Pathways Arts: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 316; -- Seastone Papers: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 318; -- Strand Theatre MV: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 320; -- Vineyard Preservation Trust: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 322; -- The Christina Gallery: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 324; -- Peter Simon Photography: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 326; -- The Vineyard's Drive: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 328; -- Instagram: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Chilmark' WHERE id = 329; -- The Yard: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 333; -- Vineyard Arts Project: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 335; -- Washington Ledesma: Vineyard Haven -> Edgartown (address_parsing)
UPDATE businesses SET town = 'Edgartown' WHERE id = 337; -- Winter Street Gallery: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 339; -- Edgartown Golf Club Martha's Vineyard: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 343; -- The Polly Hill Arboretum: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 345; -- Royal Chappy Golf: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 346; -- Vineyard Golf Club: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 347; -- The Martha's Vineyard Groups of Alcoholi: Vineyard Haven -> Edgartown (address_parsing)
UPDATE businesses SET town = 'Unknown' WHERE id = 348; -- Mvana: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 349; -- Refuge Recovery World Services: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 350; -- Smart Recovery: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 351; -- Airportfitness: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 353; -- B Strong: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 355; -- Crossfitmarthas: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 364; -- Megan Grennan Yoga: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 365; -- Peakedhillstudio: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 367; -- Vcmpt: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 368; -- Redirecting...: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 372; -- Vineyard Vinyasa: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 375; -- Marthas Vineyard Yoga Barn: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 376; -- Edgartown Martha's Vineyard Hot Yoga Stu: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 377; -- Ashley Inn: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 381; -- Dockside Inn: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 383; -- Dunmere House: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 385; -- Edgar Hotel: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 387; -- Instagram Icon: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 390; -- Luxury Boutique Hotel Edgartown: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 395; -- The Harborside Inn: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 397; -- Hob Knob: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 399; -- Book a Hostel: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 401; -- Inkwell Beach House: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 403; -- Kkon: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 406; -- Madisoninn: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 410; -- Menemsha Inn & Cottages: Martha's Vineya: Vineyard Haven -> Chilmark (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 412; -- Narragansett House: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 415; -- Martha’s Vineyard Hotels: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 417; -- Summercamp Hotel: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 419; -- Oak Bluffs Hotel: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 423; -- The Beach Front Inn of Martha's Vineyard: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 425; -- Captain Flanders Inn: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 427; -- The Charlotte Inn: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 431; -- Duckinnon: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 433; -- Lark Hotels: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 437; -- Lightkeepers Inn: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 439; -- Morgan Hotel: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 441; -- Oak Bluffs Inn: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 444; -- Martha’s Vineyard Surfside Hotel: Martha: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 446; -- The Edgartown Collection: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 450; -- Vineyard Square Hotel & Suites: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 459; -- Altheadesigns: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 461; -- Basicsandeastaway.company: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 463; -- Bellezzamvsalon: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 466; -- Binks Auto.business: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 470; -- Brickman: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 472; -- Brunos: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 476; -- Cape Cod 5: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 478; -- Cb Stark Jewelers: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 483; -- Chickenalley: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 485; -- Account Suspended: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 487; -- Claudia Jewelry: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 489; -- Secure.myvanco.com/ygss/campaign/c-yjgr: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 496; -- Darosa's: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 497; -- Debettencourt's Service Station: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 499; -- Divine Beauty + Wellness: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 501; -- Donaroma's Martha's Vineyard: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 503; -- E. C. Cottle, Inc.: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 510; -- Edgartown Books: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 512; -- The Edgartown Council on Aging: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 514; -- Mass.gov/locations/dukes-county-superior: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 515; -- Edgartown Hardware: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 518; -- Edgartownpaintshoppe: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 520; -- Fine Fettle: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 523; -- Good Dog Goods: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 525; -- Granite Five & Ten: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 536; -- Islandmusic: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 540; -- Jardin Mahoney: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 546; -- Kismet Outfitters: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 549; -- Larry: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 551; -- Lazy Frog: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 563; -- Martha: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 565; -- Martha's Vineyard Made: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 577; -- Menemshablues: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 581; -- Mosher Photo: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 583; -- North Line Shell: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'West Tisbury' WHERE id = 588; -- Salon: Vineyard Haven -> West Tisbury (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 591; -- Phillips Hardware Closed: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 593; -- Marthasvineyardescaperoom: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 597; -- Revive by Sarka ~ European Skincare, Bou: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 599; -- Personal & Business Banking: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 603; -- Sanctuary Martha's Vineyard: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 606; -- Sea Bags: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 608; -- Sea Legs: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 610; -- Sea Spasalon: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 614; -- Shirt Tales MV: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 616; -- Slate: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 618; -- Slip 77: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 620; -- Soft As a Grape: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 623; -- Sole: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 625; -- Spa L'eau MV: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 626; -- Stefanie Wolf Designs Artisan Jewelry Fr: Vineyard Haven -> Oak Bluffs (address_parsing)
UPDATE businesses SET town = 'Unknown' WHERE id = 629; -- Summershadessunglasses: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 637; -- Boneyard Surf Co.: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 644; -- Third World Trading Co.: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 646; -- Tisburyma.Gov/Council-Aging: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 652; -- Martha’s Vineyard Home Décor: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Oak Bluffs' WHERE id = 654; -- Vineyard Family Tennis: Vineyard Haven -> Oak Bluffs (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 656; -- Vineyard Hearth Patio & Spa: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 660; -- Vineyard Vines: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 663; -- Wheelhappybicycles: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 665; -- Sail Surf and Paddle on Martha's Vineyar: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Edgartown' WHERE id = 669; -- The Great Put On: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 670; -- Martha's Vineyard, Ma Store Location: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 673; -- Lilly Pulitzer: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Edgartown' WHERE id = 678; -- Brewer Insect & Animal Spraying: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Vineyard Haven' WHERE id = 680; -- Lowe Energy Design Inc.: West Tisbury -> Vineyard Haven (address_parsing)
UPDATE businesses SET town = 'Edgartown' WHERE id = 682; -- Tracker Home Decor: Vineyard Haven -> Edgartown (zip_code)
UPDATE businesses SET town = 'Chilmark' WHERE id = 686; -- Tending Joy Artisan Shop: Vineyard Haven -> Chilmark (address_parsing)
UPDATE businesses SET town = 'Chilmark' WHERE id = 688; -- Hatmarcha Gifts: Aquinnah -> Chilmark (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 702; -- 9 Craft Kitchen And Bar: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 704; -- Beach Road: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Vineyard Haven' WHERE id = 717; -- Tigerhawk Sandwich Co.: Oak Bluffs -> Vineyard Haven (zip_code)
UPDATE businesses SET town = 'Unknown' WHERE id = 719; -- Martha's Vineyard Pizza: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 720; -- Art Cliff Diner: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 723; -- Rosie's Frozen Yogurt: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 728; -- La Strada: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Unknown' WHERE id = 729; -- Model Deli Is a Model of Deliciousness: Vineyard Haven -> Unknown (reset_default)
UPDATE businesses SET town = 'Vineyard Haven' WHERE id = 730; -- The Attic: Edgartown -> Vineyard Haven (zip_code)

-- Category corrections
UPDATE businesses SET category = 'Lodging' WHERE id = 4; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 5; -- Inn -> Lodging
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 6; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 7; -- Gallery -> Shopping & Retail
UPDATE businesses SET category = 'Lodging' WHERE id = 10; -- Inn -> Lodging
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 249; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 297; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 351; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 353; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 355; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 357; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 359; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 361; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 364; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 365; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 367; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 368; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Healthcare' WHERE id = 370; -- Medical -> Healthcare
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 372; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 374; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Restaurant' WHERE id = 375; -- Bar -> Restaurant
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 376; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Lodging' WHERE id = 381; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 390; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 406; -- Inn -> Lodging
UPDATE businesses SET category = 'Other' WHERE id = 408; -- Recreation -> Other
UPDATE businesses SET category = 'Lodging' WHERE id = 410; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 412; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 413; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 415; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 417; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 419; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 423; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 425; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 431; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 435; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 437; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 441; -- Inn -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 444; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 450; -- Hotel -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 453; -- Vacation Rental -> Lodging
UPDATE businesses SET category = 'Automotive' WHERE id = 466; -- Auto -> Automotive
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 478; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Professional Services' WHERE id = 485; -- Accounting -> Professional Services
UPDATE businesses SET category = 'Other' WHERE id = 489; -- Camp -> Other
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 491; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 499; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Contractors' WHERE id = 503; -- Contractor -> Contractors
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 507; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 512; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 518; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Healthcare' WHERE id = 520; -- Medical -> Healthcare
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 525; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 534; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 551; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 553; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 555; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Lodging' WHERE id = 561; -- Vacation Rental -> Lodging
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 565; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 583; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 597; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Professional Services' WHERE id = 599; -- Financial -> Professional Services
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 603; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 606; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 608; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 610; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 616; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 620; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 625; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 626; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Professional Services' WHERE id = 633; -- Insurance -> Professional Services
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 640; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Health & Wellness' WHERE id = 656; -- Wellness -> Health & Wellness
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 660; -- Boutique -> Shopping & Retail
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 665; -- Retail -> Shopping & Retail
UPDATE businesses SET category = 'Contractors' WHERE id = 667; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Contractors' WHERE id = 668; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Shopping & Retail' WHERE id = 669; -- Shopping -> Shopping & Retail
UPDATE businesses SET category = 'Contractors' WHERE id = 670; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Contractors' WHERE id = 671; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Contractors' WHERE id = 672; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Contractors' WHERE id = 673; -- Building & Construction -> Contractors
UPDATE businesses SET category = 'Community' WHERE id = 676; -- Community & Government -> Community
UPDATE businesses SET category = 'Community' WHERE id = 677; -- Community & Government -> Community
UPDATE businesses SET category = 'Other' WHERE id = 678; -- House & Garden -> Other
UPDATE businesses SET category = 'Lodging' WHERE id = 679; -- Lodging & Tourism -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 680; -- Lodging & Tourism -> Lodging
UPDATE businesses SET category = 'Lodging' WHERE id = 681; -- Lodging & Tourism -> Lodging
UPDATE businesses SET category = 'Healthcare' WHERE id = 682; -- Medical -> Healthcare
UPDATE businesses SET category = 'Healthcare' WHERE id = 683; -- Medical -> Healthcare
UPDATE businesses SET category = 'Healthcare' WHERE id = 684; -- Medical -> Healthcare
UPDATE businesses SET category = 'Healthcare' WHERE id = 685; -- Medical -> Healthcare

COMMIT;
