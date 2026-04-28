import { useState, useMemo } from "react";
import { Business } from "@/data/directory";
import { BusinessCard } from "./BusinessCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BusinessListProps {
  businesses: Business[];
  showTown?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
  onAdminUpdate?: () => void;
}

export function BusinessList({
  businesses,
  showTown = true,
  searchable = true,
  emptyMessage = "No businesses found.",
  onAdminUpdate,
}: BusinessListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const lower = searchQuery.toLowerCase();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(lower) ||
        b.category.toLowerCase().includes(lower) ||
        (b.description && b.description.toLowerCase().includes(lower))
    );
  }, [businesses, searchQuery]);

  return (
    <div className="space-y-8">
      {searchable && businesses.length > 6 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-lg bg-background"
          />
        </div>
      )}

      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              showTown={showTown}
              onAdminUpdate={onAdminUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          {searchQuery ? "No businesses match your search." : emptyMessage}
        </div>
      )}
    </div>
  );
}
