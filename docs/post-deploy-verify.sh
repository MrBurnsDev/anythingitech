#!/usr/bin/env bash
# Post-deploy verification for the SEO redirect/canonical fixes.
# Run AFTER `npm run deploy` completes and DNS has caught up.
# Usage: bash docs/post-deploy-verify.sh

set -u
BASE="https://anythingitechmv.com"
PASS=0
FAIL=0

check_redirect() {
  local url="$1"
  local expect="$2"
  local label="$3"
  local result
  result=$(curl -sI -o /dev/null -w "%{http_code} %{redirect_url}" --max-time 10 "$url")
  # Self-redirect guard: Location must never equal the requested path
  local req_path="${url#https://anythingitechmv.com}"
  req_path="${req_path:-/}"
  local loc="${result#* }"
  local loc_path="${loc#https://anythingitechmv.com}"
  loc_path="${loc_path%/}"
  local req_path_norm="${req_path%/}"
  if [[ -n "$loc" && "$loc_path" == "$req_path_norm" ]]; then
    echo "  ✗ $label  ❗ SELF-REDIRECT"
    echo "      $url"
    echo "      Location: $loc"
    FAIL=$((FAIL+1))
    return
  fi
  if [[ "$result" == "$expect"* ]]; then
    echo "  ✓ $label"
    echo "      $url → $result"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label"
    echo "      $url"
    echo "      Got:    $result"
    echo "      Expect: $expect"
    FAIL=$((FAIL+1))
  fi
}

# Verify a canonical URL returns 200 (NOT a redirect to itself or anywhere)
check_canonical_200() {
  local url="$1"
  local label="$2"
  local code
  code=$(curl -sI -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [[ "$code" == "200" ]]; then
    echo "  ✓ $label returns 200 (no redirect)"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label returns $code instead of 200"
    echo "      $url"
    local loc
    loc=$(curl -sI --max-time 10 "$url" | grep -i '^location:' | head -1)
    [[ -n "$loc" ]] && echo "      $loc"
    FAIL=$((FAIL+1))
  fi
}

check_canonical() {
  local url="$1"
  local expect="$2"
  local label="$3"
  local canonical
  canonical=$(curl -sL --max-time 10 "$url" | grep -oE 'rel="canonical"[^>]+href="[^"]+"' | head -1 | sed 's/.*href="\([^"]*\)".*/\1/')
  if [[ "$canonical" == "$expect" ]]; then
    echo "  ✓ $label"
    echo "      canonical = $canonical"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label"
    echo "      url: $url"
    echo "      Got:    $canonical"
    echo "      Expect: $expect"
    FAIL=$((FAIL+1))
  fi
}

echo "═══════════════════════════════════════════════════════════════════════"
echo " 1. Domain canonicalization (single-hop)"
echo "═══════════════════════════════════════════════════════════════════════"
check_redirect "https://www.anythingitechmv.com/"    "308 ${BASE}/" "www → non-www"
check_redirect "http://anythingitechmv.com/"          "308 ${BASE}/" "HTTP → HTTPS"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " 2. Legacy category slug 308s"
echo "═══════════════════════════════════════════════════════════════════════"
check_redirect "${BASE}/marthas-vineyard/lodging-tourism" \
               "308 ${BASE}/marthas-vineyard/lodging-and-tourism" \
               "/lodging-tourism (1-segment)"

check_redirect "${BASE}/marthas-vineyard/oak-bluffs/lodging-tourism" \
               "308 ${BASE}/marthas-vineyard/oak-bluffs/lodging-and-tourism" \
               "/town/lodging-tourism (2-segment)"

check_redirect "${BASE}/marthas-vineyard/oak-bluffs/lodging-tourism/morgan-hotel-oak-bluffs" \
               "308 ${BASE}/marthas-vineyard/oak-bluffs/lodging-and-tourism/morgan-hotel-oak-bluffs" \
               "/town/lodging-tourism/biz (3-segment)"

check_redirect "${BASE}/marthas-vineyard/oak-bluffs/shopping-specialty-retail/boneyard-surf-co-oak-bluffs" \
               "308 ${BASE}/marthas-vineyard/oak-bluffs/shopping-and-specialty-retail/boneyard-surf-co-oak-bluffs" \
               "shopping-specialty-retail → shopping-and-specialty-retail"

check_redirect "${BASE}/marthas-vineyard/edgartown/restaurant/the-pelican-club" \
               "308 ${BASE}/marthas-vineyard/edgartown/restaurants-food-beverages/the-pelican-club" \
               "restaurant → restaurants-food-beverages"

check_redirect "${BASE}/marthas-vineyard/chilmark/health-wellness/peakedhillstudio-chilmark" \
               "308 ${BASE}/marthas-vineyard/chilmark/medical-services-and-providers/peakedhillstudio-chilmark" \
               "health-wellness → medical-services-and-providers"

check_redirect "${BASE}/marthas-vineyard/edgartown/other/anything" \
               "308 ${BASE}/marthas-vineyard/edgartown" \
               "/town/other/* → /town"

check_redirect "${BASE}/marthas-vineyard/unknown/other/foo" \
               "308 ${BASE}/marthas-vineyard" \
               "/unknown/* → /marthas-vineyard"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " 3. WP legacy paths"
echo "═══════════════════════════════════════════════════════════════════════"
check_redirect "${BASE}/iphone-repair"     "308 ${BASE}/services/apple-repair" "iphone-repair → apple-repair"
check_redirect "${BASE}/about-us"          "308 ${BASE}/about"                 "about-us → about"
check_redirect "${BASE}/feed"              "308 ${BASE}/"                      "feed → /"
check_redirect "${BASE}/archives/502"      "308 ${BASE}/tech-tips"             "archives/:id → /tech-tips"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " 4a. Canonical URLs must return 200 (no self-redirects, no redirects)"
echo "═══════════════════════════════════════════════════════════════════════"
check_canonical_200 "${BASE}/"                                                                                    "Home"
check_canonical_200 "${BASE}/marthas-vineyard"                                                                    "Directory"
check_canonical_200 "${BASE}/marthas-vineyard/edgartown"                                                          "Town index"
check_canonical_200 "${BASE}/services/wifi-network"                                                               "Service page"
check_canonical_200 "${BASE}/tech-tips/why-i-built-is-the-ferry-running"                                          "Tech tip"

echo ""
echo "  Specific regression test: 6 categories that previously self-redirected."
echo "  These must all be 200, not 308."
check_canonical_200 "${BASE}/marthas-vineyard/lodging-and-tourism"               "Cat: lodging-and-tourism"
check_canonical_200 "${BASE}/marthas-vineyard/restaurants-food-beverages"        "Cat: restaurants-food-beverages"
check_canonical_200 "${BASE}/marthas-vineyard/shopping-and-specialty-retail"     "Cat: shopping-and-specialty-retail"
check_canonical_200 "${BASE}/marthas-vineyard/business-and-professional-services" "Cat: business-and-professional-services"
check_canonical_200 "${BASE}/marthas-vineyard/family-community-government"       "Cat: family-community-government"
check_canonical_200 "${BASE}/marthas-vineyard/medical-services-and-providers"    "Cat: medical-services-and-providers"

echo ""
echo "  Town+category permutations (previously 308-self):"
check_canonical_200 "${BASE}/marthas-vineyard/edgartown/lodging-and-tourism"                          "edgartown/lodging-and-tourism"
check_canonical_200 "${BASE}/marthas-vineyard/oak-bluffs/restaurants-food-beverages"                  "oak-bluffs/restaurants-food-beverages"
check_canonical_200 "${BASE}/marthas-vineyard/vineyard-haven/shopping-and-specialty-retail"           "vineyard-haven/shopping-and-specialty-retail"

echo ""
echo "  Business pages (previously 308-self):"
check_canonical_200 "${BASE}/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown"           "Harbor View Hotel"
check_canonical_200 "${BASE}/marthas-vineyard/oak-bluffs/restaurants-food-beverages/offshore-ale-company-oak-bluffs"  "Offshore Ale Company"
check_canonical_200 "${BASE}/marthas-vineyard/vineyard-haven/shopping-and-specialty-retail/bunch-of-grapes-bookstore-vineyard-haven"  "Bunch of Grapes Bookstore"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " 4b. Canonical tags on prerendered pages (must be in static HTML)"
echo "═══════════════════════════════════════════════════════════════════════"
check_canonical "${BASE}/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown" \
                "${BASE}/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown" \
                "Business page (Harbor View Hotel)"

check_canonical "${BASE}/marthas-vineyard/oak-bluffs/restaurants-food-beverages" \
                "${BASE}/marthas-vineyard/oak-bluffs/restaurants-food-beverages" \
                "Town+category index"

check_canonical "${BASE}/marthas-vineyard/edgartown" \
                "${BASE}/marthas-vineyard/edgartown" \
                "Town index"

check_canonical "${BASE}/marthas-vineyard/lodging-and-tourism" \
                "${BASE}/marthas-vineyard/lodging-and-tourism" \
                "Category index"

check_canonical "${BASE}/marthas-vineyard" \
                "${BASE}/marthas-vineyard" \
                "Directory home"

check_canonical "${BASE}/services/wifi-network" \
                "${BASE}/services/wifi-network" \
                "Service page"

check_canonical "${BASE}/tech-tips/why-i-built-is-the-ferry-running" \
                "${BASE}/tech-tips/why-i-built-is-the-ferry-running" \
                "Tech tip post"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " 5. Sitemap + robots.txt"
echo "═══════════════════════════════════════════════════════════════════════"
SITEMAP_COUNT=$(curl -s "${BASE}/sitemap.xml" | grep -c '<loc>')
echo "  ${BASE}/sitemap.xml URL count: ${SITEMAP_COUNT}"
[[ $SITEMAP_COUNT -gt 250 ]] && { echo "  ✓ Sitemap looks healthy"; PASS=$((PASS+1)); } || { echo "  ✗ Sitemap appears truncated or missing"; FAIL=$((FAIL+1)); }

ROBOTS_HOST=$(curl -s "${BASE}/robots.txt" | grep -oE 'Host: [^[:space:]]+' | head -1)
echo "  robots.txt Host: ${ROBOTS_HOST}"
[[ "$ROBOTS_HOST" == "Host: anythingitechmv.com" ]] && { echo "  ✓ robots.txt declares non-www host"; PASS=$((PASS+1)); } || { echo "  ✗ robots.txt host mismatch"; FAIL=$((FAIL+1)); }

ROBOTS_SM=$(curl -s "${BASE}/robots.txt" | grep -oE 'Sitemap: [^[:space:]]+' | head -1)
echo "  robots.txt Sitemap: ${ROBOTS_SM}"
[[ "$ROBOTS_SM" == "Sitemap: ${BASE}/sitemap.xml" ]] && { echo "  ✓ robots.txt sitemap is canonical"; PASS=$((PASS+1)); } || { echo "  ✗ robots.txt sitemap mismatch"; FAIL=$((FAIL+1)); }

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " RESULTS: ${PASS} passed, ${FAIL} failed"
echo "═══════════════════════════════════════════════════════════════════════"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
