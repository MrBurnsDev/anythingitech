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
  return (
    <Link
      to={getBusinessUrl(business)}
      className="group card-service p-6 flex flex-col min-h-[180px] relative"
    >
      {/* Admin controls - only visible when logged in as admin */}
      <AdminControls business={business} onUpdated={onAdminUpdate} />
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl mb-1 group-hover:text-accent transition-colors truncate">
            {business.name}
          </h3>
          {showTown && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{business.town}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full shrink-0">
          {business.category}
        </span>
      </div>

      {business.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
          {business.description}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-border flex flex-wrap items-center gap-4 text-sm">
        {business.phone && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {business.phone}
          </span>
        )}
        {business.website && (
          <span className="flex items-center gap-1.5 text-accent">
            <Globe className="h-3.5 w-3.5" />
            Website
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
