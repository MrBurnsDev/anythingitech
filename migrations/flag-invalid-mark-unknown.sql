-- Final Town Corrections and Invalid Record Flagging
-- Generated: 2026-04-25T23:55:11.524Z
--
-- This migration:
-- 1. Flags 11 invalid records
-- 2. Marks 74 unverified VH records as Unknown
--
-- Review before applying!

BEGIN TRANSACTION;

-- Flag invalid records
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: square_site' WHERE id = 33;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: social_media_platform' WHERE id = 34;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: square_site' WHERE id = 79;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: generic_page_title' WHERE id = 227;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: social_media_platform' WHERE id = 328;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: page_error' WHERE id = 368;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: generic_domain' WHERE id = 461;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: generic_domain' WHERE id = 466;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: page_error' WHERE id = 485;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: url_as_name' WHERE id = 489;
UPDATE businesses SET needs_manual_review = 1, review_reason = 'invalid_record: domain_as_name' WHERE id = 571;

-- Mark unverified Vineyard Haven records as Unknown
UPDATE businesses SET town = 'Unknown' WHERE id = 31; -- Martha's Vineyard Magazine
UPDATE businesses SET town = 'Unknown' WHERE id = 191; -- Artcliff Diner
UPDATE businesses SET town = 'Unknown' WHERE id = 196; -- Bobbybs
UPDATE businesses SET town = 'Unknown' WHERE id = 200; -- Delicious MV
UPDATE businesses SET town = 'Unknown' WHERE id = 204; -- The La Choza Difference: Flavor Without 
UPDATE businesses SET town = 'Unknown' WHERE id = 206; -- Mikado
UPDATE businesses SET town = 'Unknown' WHERE id = 208; -- About Motts
UPDATE businesses SET town = 'Unknown' WHERE id = 219; -- Scottish Bakehouse
UPDATE businesses SET town = 'Unknown' WHERE id = 231; -- Native Earth Teaching Farm
UPDATE businesses SET town = 'Unknown' WHERE id = 253; -- Larsen
UPDATE businesses SET town = 'Unknown' WHERE id = 255; -- Menemsha Fish Market
UPDATE businesses SET town = 'Unknown' WHERE id = 262; -- Mvwine Store
UPDATE businesses SET town = 'Unknown' WHERE id = 273; -- Vineyard Scripts
UPDATE businesses SET town = 'Unknown' WHERE id = 280; -- Blanchardphoto
UPDATE businesses SET town = 'Unknown' WHERE id = 282; -- Entertainmentcinemas.Com/Locations/Edgar
UPDATE businesses SET town = 'Unknown' WHERE id = 295; -- Louisa Gould Photographer
UPDATE businesses SET town = 'Unknown' WHERE id = 304; -- Merry Farm Pottery
UPDATE businesses SET town = 'Unknown' WHERE id = 306; -- Michaeljimage
UPDATE businesses SET town = 'Unknown' WHERE id = 326; -- The Vineyard's Drive
UPDATE businesses SET town = 'Unknown' WHERE id = 348; -- Mvana
UPDATE businesses SET town = 'Unknown' WHERE id = 349; -- Refuge Recovery World Services
UPDATE businesses SET town = 'Unknown' WHERE id = 350; -- Smart Recovery
UPDATE businesses SET town = 'Unknown' WHERE id = 351; -- Airportfitness
UPDATE businesses SET town = 'Unknown' WHERE id = 355; -- Crossfitmarthas
UPDATE businesses SET town = 'Unknown' WHERE id = 372; -- Vineyard Vinyasa
UPDATE businesses SET town = 'Unknown' WHERE id = 399; -- Book a Hostel
UPDATE businesses SET town = 'Unknown' WHERE id = 417; -- Summercamp Hotel
UPDATE businesses SET town = 'Unknown' WHERE id = 425; -- Captain Flanders Inn
UPDATE businesses SET town = 'Unknown' WHERE id = 431; -- Duckinnon
UPDATE businesses SET town = 'Unknown' WHERE id = 433; -- Lark Hotels
UPDATE businesses SET town = 'Unknown' WHERE id = 459; -- Altheadesigns
UPDATE businesses SET town = 'Unknown' WHERE id = 463; -- Bellezzamvsalon
UPDATE businesses SET town = 'Unknown' WHERE id = 470; -- Brickman
UPDATE businesses SET town = 'Unknown' WHERE id = 472; -- Brunos
UPDATE businesses SET town = 'Unknown' WHERE id = 476; -- Cape Cod 5
UPDATE businesses SET town = 'Unknown' WHERE id = 478; -- Cb Stark Jewelers
UPDATE businesses SET town = 'Unknown' WHERE id = 483; -- Chickenalley
UPDATE businesses SET town = 'Unknown' WHERE id = 487; -- Claudia Jewelry
UPDATE businesses SET town = 'Unknown' WHERE id = 496; -- Darosa's
UPDATE businesses SET town = 'Unknown' WHERE id = 503; -- E. C. Cottle, Inc.
UPDATE businesses SET town = 'Unknown' WHERE id = 512; -- The Edgartown Council on Aging
UPDATE businesses SET town = 'Unknown' WHERE id = 518; -- Edgartownpaintshoppe
UPDATE businesses SET town = 'Unknown' WHERE id = 520; -- Fine Fettle
UPDATE businesses SET town = 'Unknown' WHERE id = 523; -- Good Dog Goods
UPDATE businesses SET town = 'Unknown' WHERE id = 536; -- Islandmusic
UPDATE businesses SET town = 'Unknown' WHERE id = 540; -- Jardin Mahoney
UPDATE businesses SET town = 'Unknown' WHERE id = 549; -- Larry
UPDATE businesses SET town = 'Unknown' WHERE id = 565; -- Martha's Vineyard Made
UPDATE businesses SET town = 'Unknown' WHERE id = 577; -- Menemshablues
UPDATE businesses SET town = 'Unknown' WHERE id = 591; -- Phillips Hardware Closed
UPDATE businesses SET town = 'Unknown' WHERE id = 593; -- Marthasvineyardescaperoom
UPDATE businesses SET town = 'Unknown' WHERE id = 597; -- Revive by Sarka ~ European Skincare, Bou
UPDATE businesses SET town = 'Unknown' WHERE id = 599; -- Personal & Business Banking
UPDATE businesses SET town = 'Unknown' WHERE id = 606; -- Sea Bags
UPDATE businesses SET town = 'Unknown' WHERE id = 608; -- Sea Legs
UPDATE businesses SET town = 'Unknown' WHERE id = 610; -- Sea Spasalon
UPDATE businesses SET town = 'Unknown' WHERE id = 618; -- Slip 77
UPDATE businesses SET town = 'Unknown' WHERE id = 620; -- Soft As a Grape
UPDATE businesses SET town = 'Unknown' WHERE id = 623; -- Sole
UPDATE businesses SET town = 'Unknown' WHERE id = 629; -- Summershadessunglasses
UPDATE businesses SET town = 'Unknown' WHERE id = 637; -- Boneyard Surf Co.
UPDATE businesses SET town = 'Unknown' WHERE id = 646; -- Tisburyma.Gov/Council-Aging
UPDATE businesses SET town = 'Unknown' WHERE id = 652; -- Martha’s Vineyard Home Décor
UPDATE businesses SET town = 'Unknown' WHERE id = 656; -- Vineyard Hearth Patio & Spa
UPDATE businesses SET town = 'Unknown' WHERE id = 660; -- Vineyard Vines
UPDATE businesses SET town = 'Unknown' WHERE id = 663; -- Wheelhappybicycles
UPDATE businesses SET town = 'Unknown' WHERE id = 665; -- Sail Surf and Paddle on Martha's Vineyar
UPDATE businesses SET town = 'Unknown' WHERE id = 702; -- 9 Craft Kitchen And Bar
UPDATE businesses SET town = 'Unknown' WHERE id = 704; -- Beach Road
UPDATE businesses SET town = 'Unknown' WHERE id = 719; -- Martha's Vineyard Pizza
UPDATE businesses SET town = 'Unknown' WHERE id = 720; -- Art Cliff Diner
UPDATE businesses SET town = 'Unknown' WHERE id = 723; -- Rosie's Frozen Yogurt
UPDATE businesses SET town = 'Unknown' WHERE id = 728; -- La Strada
UPDATE businesses SET town = 'Unknown' WHERE id = 729; -- Model Deli Is a Model of Deliciousness

COMMIT;
