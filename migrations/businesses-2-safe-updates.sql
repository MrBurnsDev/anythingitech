-- Businesses 2 Safe Updates
-- Generated: 2026-04-29T03:21:07.193Z
-- These updates ONLY fill in missing fields, never overwrite existing data
-- Total updates: 16

BEGIN;

-- Summercamp Hotel: phone: NULL → (508) 693-6611
UPDATE businesses SET phone = '(508) 693-6611', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 417;
-- Vineyard Harbor Motel: description: filled
UPDATE businesses SET description = 'Vineyard Harbor Motel offers comfortable rooms, a private beach and an incredible location.', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = undefined;
-- Outermost Inn: address: NULL → 7-room family inn and fine dining restaurant located in Aquinnah, high on the prominent Gay Head Cliffs - sweeping views, brilliant rooms, local food. Open seasonally from Memorial Day to Columbus Day.
UPDATE businesses SET full_address = '7-room family inn and fine dining restaurant located in Aquinnah, high on the prominent Gay Head Cliffs - sweeping views, brilliant rooms, local food. Open seasonally from Memorial Day to Columbus Day.', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 38;
-- Eisenhauer Gallery: phone: NULL → (508) 627-7003
UPDATE businesses SET phone = '(508) 627-7003', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 286;
-- Model Deli: phone: NULL → (508) 693-6100
UPDATE businesses SET phone = '(508) 693-6100', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 729;
-- Martha's Vineyard Film Festival: phone: NULL → (508) 696-9369
UPDATE businesses SET phone = '(508) 696-9369', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 8;
-- The Seafood Shanty: address: NULL → Waterfront dockside restaurant and bar overlooking Edgartown harbor, serving fine food & drinks for over fifty years, seafood and sushi, live music and DJs.
UPDATE businesses SET full_address = 'Waterfront dockside restaurant and bar overlooking Edgartown harbor, serving fine food & drinks for over fifty years, seafood and sushi, live music and DJs.', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 109;
-- Square Rigger Restaurant: phone: NULL → (508) 627-9968, address: NULL → 225 Edgartown Rd, Edgartown
UPDATE businesses SET phone = '(508) 627-9968', full_address = '225 Edgartown Rd, Edgartown', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 114;
-- Back Door Donuts: address: NULL → Back door donuts is part of Martha’s Vineyard Gourmet Cafe& Bakery in Oak Bluffs. Ordering and eating donuts from their back door is a Martha’s Vineyard tradition.
UPDATE businesses SET full_address = 'Back door donuts is part of Martha’s Vineyard Gourmet Cafe& Bakery in Oak Bluffs. Ordering and eating donuts from their back door is a Martha’s Vineyard tradition.', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 131;
-- Fat Ronnie's Burger Bar: phone: NULL → (508) 693-6600, address: NULL → 7 Circuit Ave, Oak Bluffs
UPDATE businesses SET phone = '(508) 693-6600', full_address = '7 Circuit Ave, Oak Bluffs', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 150;
-- Coop de Ville: phone: NULL → (508) 693-3420, address: NULL → 12 Circuit Ave Extension, Oak Bluffs
UPDATE businesses SET phone = '(508) 693-3420', full_address = '12 Circuit Ave Extension, Oak Bluffs', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 141;
-- Scottish Bakehouse: phone: NULL → (508) 693-6633
UPDATE businesses SET phone = '(508) 693-6633', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 219;
-- Edgartown Diner 🍨: address: NULL → 65 Main St, Edgartown
UPDATE businesses SET full_address = '65 Main St, Edgartown', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 722;
-- La Choza: phone: NULL → (508) 693-9050
UPDATE businesses SET phone = '(508) 693-9050', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 204;
-- The Porthunter: phone: NULL → (508) 627-7747, address: NULL → The Port Hunter is the premier seafood and live entertainment venue located in the heart of historic Edgartown Massachusetts on the island of Martha's Vineyard.
UPDATE businesses SET phone = '(508) 627-7747', full_address = 'The Port Hunter is the premier seafood and live entertainment venue located in the heart of historic Edgartown Massachusetts on the island of Martha''s Vineyard.', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 121;
-- Mikado Asian Bistro: phone: NULL → (508) 338-7096, address: NULL → 76 Main Street, Vineyard Haven
UPDATE businesses SET phone = '(508) 338-7096', full_address = '76 Main Street, Vineyard Haven', verification_source = 'businesses_2_import', last_verified_at = NOW(), updated_at = NOW() WHERE id = 206;

COMMIT;