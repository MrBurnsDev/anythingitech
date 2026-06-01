import { ExternalLink } from "lucide-react";
import type { Business, MembershipSource } from "@/data/directory";

interface DirectoryListingsProps {
  memberships: Business["memberships"];
  className?: string;
}

// Neutral, non-certification labels. Order is the display order on the page.
const SOURCE_LABELS: { source: MembershipSource; label: string }[] = [
  { source: "chamber", label: "Listed in Chamber Directory" },
  { source: "gazette", label: "Listed in Vineyard Gazette Directory" },
  { source: "gomv", label: "Listed in Go Martha's Vineyard Directory" },
  { source: "blackOwned", label: "Listed in BlackOwnedMV" },
];

/**
 * Renders the set of external directories a business is listed in, with deep
 * links to each source. Use the neutral "Listed in …" wording (not
 * "Member of" or "Certified by") — directory inclusion is a temporal
 * observation, not an endorsement.
 *
 * Returns null when there are no memberships, so the parent can render a
 * sibling section without an empty placeholder.
 */
export function DirectoryListings({ memberships, className = "" }: DirectoryListingsProps) {
  if (!memberships) return null;
  const items = SOURCE_LABELS.filter(({ source }) => memberships[source]?.listed);
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="font-display text-lg mb-3">Directory Listings</h2>
      <ul className="space-y-2">
        {items.map(({ source, label }) => {
          const m = memberships[source]!;
          const content = (
            <span className="inline-flex items-center gap-1.5">
              {label}
              {m.externalUrl ? <ExternalLink className="h-3.5 w-3.5 opacity-60" /> : null}
            </span>
          );
          return (
            <li key={source} className="text-sm">
              {m.externalUrl ? (
                <a
                  href={m.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent transition-colors link-underline"
                >
                  {content}
                </a>
              ) : (
                <span className="text-foreground">{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
