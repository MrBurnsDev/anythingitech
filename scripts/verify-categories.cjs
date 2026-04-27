const data = require("../data/exports/businesses.json");
const types = require("../data/exports/business-types.json");

const validCategories = [
  "Arts & Entertainment",
  "Automotive & Marine",
  "Banking, Finance & Insurance",
  "Beauty & Wellness",
  "Building & Construction",
  "Business & Professional Services",
  "Family, Community & Government",
  "Home Services & Trades",
  "House, Garden & Pets",
  "Lodging & Tourism",
  "Medical Services & Providers",
  "Real Estate & Rentals",
  "Restaurants, Food & Beverages",
  "Shopping & Specialty Retail",
  "Sports & Recreation",
  "Transportation & Utilities",
  "Wedding & Event Services"
];

console.log("CATEGORY VERIFICATION");
console.log("=====================");

const categories = {};
data.forEach(b => {
  categories[b.category] = (categories[b.category] || 0) + 1;
});

let allValid = true;
Object.entries(categories).forEach(([cat, count]) => {
  const valid = validCategories.includes(cat);
  const symbol = valid ? "✓" : "❌";
  console.log(symbol + " " + cat + ": " + count);
  if (!valid) allValid = false;
});

console.log("");
console.log(allValid ? "✓ ALL CATEGORIES ARE VALID CHAMBER CATEGORIES" : "❌ INVALID CATEGORIES FOUND");

// Check for Other category
const otherCount = data.filter(b => b.category === "Other").length;
console.log("");
console.log("Records with Other category: " + otherCount);

// Check for old categories
const oldCategories = ["Restaurant", "Lodging", "Shopping & Retail", "Contractors", "Professional Services"];
oldCategories.forEach(old => {
  const count = data.filter(b => b.category === old).length;
  if (count > 0) {
    console.log("❌ Old category " + old + " still present: " + count);
  }
});

console.log("");
console.log("Business types in export: " + types.length);
types.forEach(t => console.log("  - " + t.name + " (" + t.businessCount + ")"));
