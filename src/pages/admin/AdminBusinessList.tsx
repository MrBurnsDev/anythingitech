import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Business {
  id: number;
  business_name: string;
  slug: string;
  town: string;
  category: string;
  subcategory: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  business_status: string;
  needs_manual_review: number;
  review_reason: string | null;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MV_TOWNS = [
  "Aquinnah",
  "Chilmark",
  "Edgartown",
  "Menemsha",
  "Oak Bluffs",
  "Tisbury",
  "Unknown",
  "Vineyard Haven",
  "West Tisbury",
];

const CATEGORIES = [
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
  "Wedding & Event Services",
];

export default function AdminBusinessList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get filters from URL
  const search = searchParams.get("search") || "";
  const town = searchParams.get("town") || "all";
  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const needsReview = searchParams.get("needs_review") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== "page") {
      params.delete("page");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();

      params.set("page", page.toString());
      params.set("limit", "25");
      if (search) params.set("search", search);
      if (town && town !== "all") params.set("town", town);
      if (category && category !== "all") params.set("category", category);
      if (status && status !== "all") params.set("status", status);
      if (needsReview) params.set("needs_review", needsReview);

      const response = await fetch(`/api/admin/businesses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  }, [search, town, category, status, needsReview, page]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/businesses?id=${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete business");
      }

      // Refresh list
      fetchBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const hasFilters = search || town !== "all" || category !== "all" || status !== "all" || needsReview;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">Businesses</h1>
            <p className="text-muted-foreground mt-1">
              {pagination ? `${pagination.total} total businesses` : "Loading..."}
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/businesses/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Business
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Town filter */}
            <Select value={town} onValueChange={(v) => updateFilter("town", v)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="All Towns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Towns</SelectItem>
                {MV_TOWNS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select
              value={category}
              onValueChange={(v) => updateFilter("category", v)}
            >
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={status} onValueChange={(v) => updateFilter("status", v)}>
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-center justify-between">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchBusinesses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No businesses found</p>
              {hasFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {business.business_name}
                          {business.needs_manual_review ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {business.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{business.town}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {business.category}
                        {business.subcategory && (
                          <span className="text-muted-foreground">
                            {" / "}
                            {business.subcategory}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          business.business_status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={cn(
                          business.business_status === "active" &&
                            "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        )}
                      >
                        {business.business_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/businesses/${business.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        {business.website && (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(business.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    updateFilter("page", (pagination.page - 1).toString())
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    updateFilter("page", (pagination.page + 1).toString())
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the business and remove it from the public directory.
              The data will be preserved and can be restored if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Archiving...
                </>
              ) : (
                "Archive"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
