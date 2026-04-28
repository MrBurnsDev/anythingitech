import { Link } from "react-router-dom";
import { Business, getBusinessUrl } from "@/data/directory";
import { MapPin, Phone, Globe, ArrowUpRight } from "lucide-react";
import { AdminControls } from "./AdminControls";

interface BusinessCardProps {
  business: Business;
  showTown?: boolean;
  onAdminUpdate?: () => void;
}

export function BusinessCard({ business, showTown = true, onAdminUpdate }: BusinessCardProps) {
  // Determine the best category label to show
  const categoryLabel = business.category || business.businessType;

  return (
    <Link
      to={getBusinessUrl(business)}
      className="group card-service p-6 flex flex-col min-h-[200px] relative"
    >
      {/* Admin controls - only visible when logged in as admin */}
      <AdminControls business={business} onUpdated={onAdminUpdate} />

      {/* Business Name - Primary element, allows wrapping */}
      <h3 className="font-display text-xl leading-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">
        {business.name}
      </h3>

      {/* Category - Subtle, below name */}
      <div className="text-xs text-muted-foreground mb-1">
        {categoryLabel}
      </div>

      {/* Town - Clear separate line */}
      {showTown && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{business.town}</span>
        </div>
      )}

      {/* Description - Optional, max 2 lines */}
      {business.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
          {business.description}
        </p>
      )}

      {/* Contact Row - Website · Social · Phone */}
      <div className="mt-auto pt-4 border-t border-border flex flex-wrap items-center gap-3 text-sm">
        {business.website && (
          <span className="flex items-center gap-1.5 text-accent">
            <Globe className="h-3.5 w-3.5" />
            Website
          </span>
        )}
        {business.social?.instagram && (
          <span className="text-muted-foreground">Instagram</span>
        )}
        {business.social?.facebook && !business.social?.instagram && (
          <span className="text-muted-foreground">Facebook</span>
        )}
        {business.phone && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {business.phone}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
