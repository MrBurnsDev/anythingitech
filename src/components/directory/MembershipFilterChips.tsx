import { useSearchParams } from "react-router-dom";
import type { Business, MembershipSource } from "@/data/directory";

/**
 * Membership-based filter chips for directory listing pages (TownPage,
 * BusinessTypePage, TownBusinessTypePage).
 *
 * State is held in the URL (?filter=verified|chamber|gazette|gomv|blackOwned).
 * URL state means:
 *   - shareable and back-button-friendly
 *   - crawlable by Google when linked from filter landing pages
 *   - no extra global state to manage
 *
 * Only one filter can be active at a time on listing pages. The five filter
 * landing pages at /businesses/* are the equivalent of these chips, but
 * applied to the full directory rather than scoped to a town/category.
 */

type FilterKey = "verified" | "chamber" | "gazette" | "gomv" | "blackOwned";

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "verified", label: "Verified Local" },
  { key: "chamber", label: "Chamber Listed" },
  { key: "gazette", label: "Gazette Listed" },
  { key: "gomv", label: "GoMV Listed" },
  { key: "blackOwned", label: "Black-Owned" },
];

const PREDICATES: Record<FilterKey, (b: Business) => boolean> = {
  verified: (b) => Boolean(b.verifiedLocalBusiness),
  chamber: (b) => Boolean(b.memberships?.chamber?.listed),
  gazette: (b) => Boolean(b.memberships?.gazette?.listed),
  gomv: (b) => Boolean(b.memberships?.gomv?.listed),
  blackOwned: (b) => Boolean(b.memberships?.blackOwned?.listed),
};

/**
 * Read the current filter from the URL. Returns null for unknown values.
 */
export function useMembershipFilter(): FilterKey | null {
  const [params] = useSearchParams();
  const f = params.get("filter");
  if (!f) return null;
  return (Object.keys(PREDICATES) as FilterKey[]).includes(f as FilterKey)
    ? (f as FilterKey)
    : null;
}

/**
 * Apply the current membership filter to a list. Pass the result of
 * useMembershipFilter() (or null to no-op).
 */
export function applyMembershipFilter<T extends Business>(
  businesses: T[],
  filter: FilterKey | null
): T[] {
  if (!filter) return businesses;
  const pred = PREDICATES[filter];
  return businesses.filter(pred);
}

export function MembershipFilterChips({ className = "" }: { className?: string }) {
  const [params, setParams] = useSearchParams();
  const active = params.get("filter");

  function setFilter(key: FilterKey | null) {
    const next = new URLSearchParams(params);
    if (key === null) next.delete("filter");
    else next.set("filter", key);
    // replace: true keeps the back button useful — multiple filter clicks
    // shouldn't bury the user under N history entries.
    setParams(next, { replace: true });
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Filter businesses by directory listing">
      <button
        type="button"
        onClick={() => setFilter(null)}
        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
          !active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
        }`}
        aria-pressed={!active}
      >
        All
      </button>
      {FILTER_LABELS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(isActive ? null : key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
            }`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
