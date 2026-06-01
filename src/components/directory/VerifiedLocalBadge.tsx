import { ShieldCheck } from "lucide-react";

interface VerifiedLocalBadgeProps {
  className?: string;
  /** Compact pill version (default). When false, shows an info tooltip-style label. */
  compact?: boolean;
}

/**
 * Trust signal shown on a business when it appears in at least one established
 * Vineyard directory (Chamber, Vineyard Gazette, or Go Martha's Vineyard).
 *
 * Language is intentionally neutral — "Verified Local Business" describes
 * directory presence, not certification or endorsement. The membership detail
 * (which directories it's listed in) is rendered separately by
 * <DirectoryListings/>.
 */
export function VerifiedLocalBadge({ className = "", compact = true }: VerifiedLocalBadgeProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-2.5 py-1 text-xs font-medium ${className}`}
        title="This business appears in one or more established Martha's Vineyard directories"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified Local Business
      </span>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 ${className}`}>
      <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
      <span className="text-sm">Verified Local Business</span>
    </div>
  );
}
