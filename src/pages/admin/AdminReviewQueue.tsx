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
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Edit2,
  Check,
  X,
  GitMerge,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
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
  website: string | null;
  business_status: string;
  confidence_score: number | null;
  needs_manual_review: boolean;
  review_reason: string | null;
  verification_source: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  total: number;
  highConfidence: number;
  lowConfidence: number;
  approvedToday: number;
  rejectedToday: number;
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

const SOURCES = [
  "vineyard_gazette_business_directory",
  "businesses_2_import",
  "manual_entry",
  "web_scrape",
];

export default function AdminReviewQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);

  // Filters from URL
  const search = searchParams.get("search") || "";
  const town = searchParams.get("town") || "all";
  const source = searchParams.get("source") || "all";
  const confidence = searchParams.get("confidence") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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
      params.set("needs_review", "true");
      if (search) params.set("search", search);
      if (town && town !== "all") params.set("town", town);
      if (source && source !== "all") params.set("source", source);

      const response = await fetch(`/api/admin/businesses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      let filteredBusinesses = (data.businesses || []).filter(
        (b: Business) => b.needs_manual_review || b.business_status === "needs_review"
      );

      // Apply confidence filter client-side
      if (confidence === "high") {
        filteredBusinesses = filteredBusinesses.filter(
          (b: Business) => (b.confidence_score || 0) >= 70
        );
      } else if (confidence === "low") {
        filteredBusinesses = filteredBusinesses.filter(
          (b: Business) => (b.confidence_score || 0) < 70
        );
      }

      setBusinesses(filteredBusinesses);
      setPagination(data.pagination);

      // Calculate stats
      const total = filteredBusinesses.length;
      const highConfidence = filteredBusinesses.filter(
        (b: Business) => (b.confidence_score || 0) >= 70
      ).length;
      const lowConfidence = total - highConfidence;

      setStats({
        total,
        highConfidence,
        lowConfidence,
        approvedToday: 0, // Would need backend tracking
        rejectedToday: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  }, [search, town, source, confidence, page]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleApprove = async (ids: number[]) => {
    setActionInProgress("approve");
    const token = localStorage.getItem("admin_token");

    try {
      for (const id of ids) {
        const response = await fetch(`/api/admin/businesses`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id,
            business_status: "active",
            needs_manual_review: false,
            approved_at: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          console.error(`Failed to approve business ${id}`);
        }
      }

      setSelectedIds(new Set());
      fetchBusinesses();
    } catch (err) {
      setError("Failed to approve businesses");
    } finally {
      setActionInProgress(null);
      setApproveDialogOpen(false);
      setBulkAction(null);
    }
  };

  const handleReject = async (ids: number[]) => {
    setActionInProgress("reject");
    const token = localStorage.getItem("admin_token");

    try {
      for (const id of ids) {
        const response = await fetch(`/api/admin/businesses`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id,
            business_status: "rejected",
            needs_manual_review: false,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to reject business ${id}`);
        }
      }

      setSelectedIds(new Set());
      fetchBusinesses();
    } catch (err) {
      setError("Failed to reject businesses");
    } finally {
      setActionInProgress(null);
      setRejectDialogOpen(false);
      setBulkAction(null);
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === businesses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(businesses.map((b) => b.id)));
    }
  };

  const hasFilters = search || town !== "all" || source !== "all" || confidence !== "all";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">Review Queue</h1>
            <p className="text-muted-foreground mt-1">
              Approve, edit, or reject staged business listings
            </p>
          </div>
          <Button variant="outline" onClick={fetchBusinesses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Staged</span>
              </div>
              <p className="text-2xl font-display font-semibold">{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">High Confidence</span>
              </div>
              <p className="text-2xl font-display font-semibold">{stats.highConfidence}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Low Confidence</span>
              </div>
              <p className="text-2xl font-display font-semibold">{stats.lowConfidence}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Check className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Approved Today</span>
              </div>
              <p className="text-2xl font-display font-semibold">{stats.approvedToday}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Rejected Today</span>
              </div>
              <p className="text-2xl font-display font-semibold">{stats.rejectedToday}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

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

            <Select value={source} onValueChange={(v) => updateFilter("source", v)}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={confidence} onValueChange={(v) => updateFilter("confidence", v)}>
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="All Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (70+)</SelectItem>
                <SelectItem value="low">Low (&lt;70)</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedIds.size} business{selectedIds.size > 1 ? "es" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setBulkAction("approve");
                  setApproveDialogOpen(true);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setBulkAction("reject");
                  setRejectDialogOpen(true);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Reject Selected
              </Button>
            </div>
          </div>
        )}

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
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1">No businesses need review right now.</p>
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
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedIds.size === businesses.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(business.id)}
                        onCheckedChange={() => toggleSelect(business.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{business.business_name}</div>
                        <div className="text-sm text-muted-foreground">{business.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>{business.town}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {business.category}
                        {business.subcategory && (
                          <span className="text-muted-foreground"> / {business.subcategory}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {business.verification_source?.replace(/_/g, " ") || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          (business.confidence_score || 0) >= 70
                            ? "bg-green-500/10 text-green-600"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {business.confidence_score || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(business.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setApproveDialogOpen(true);
                          }}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit">
                          <Link to={`/admin/businesses/${business.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setDetailsDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setRejectDialogOpen(true);
                          }}
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
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
                  onClick={() => updateFilter("page", (pagination.page - 1).toString())}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilter("page", (pagination.page + 1).toString())}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Business?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "approve"
                ? `This will approve ${selectedIds.size} selected business${selectedIds.size > 1 ? "es" : ""} and make them visible in the public directory.`
                : selectedBusiness
                  ? `This will approve "${selectedBusiness.business_name}" and make it visible in the public directory.`
                  : "This will approve the selected business."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleApprove(
                  bulkAction === "approve"
                    ? Array.from(selectedIds)
                    : selectedBusiness
                      ? [selectedBusiness.id]
                      : []
                )
              }
              disabled={!!actionInProgress}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionInProgress === "approve" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Business?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "reject"
                ? `This will reject ${selectedIds.size} selected business${selectedIds.size > 1 ? "es" : ""}. They will not appear in the public directory.`
                : selectedBusiness
                  ? `This will reject "${selectedBusiness.business_name}". It will not appear in the public directory.`
                  : "This will reject the selected business."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleReject(
                  bulkAction === "reject"
                    ? Array.from(selectedIds)
                    : selectedBusiness
                      ? [selectedBusiness.id]
                      : []
                )
              }
              disabled={!!actionInProgress}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionInProgress === "reject" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBusiness?.business_name}</DialogTitle>
            <DialogDescription>Business details and review information</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Town</label>
                  <p className="font-medium">{selectedBusiness.town}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Category</label>
                  <p className="font-medium">{selectedBusiness.category}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedBusiness.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Website</label>
                  <p className="font-medium">
                    {selectedBusiness.website ? (
                      <a
                        href={selectedBusiness.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedBusiness.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Confidence Score</label>
                  <p className="font-medium">{selectedBusiness.confidence_score || 0}%</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Source</label>
                  <p className="font-medium">
                    {selectedBusiness.verification_source?.replace(/_/g, " ") || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Created</label>
                  <p className="font-medium">
                    {new Date(selectedBusiness.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Status</label>
                  <p className="font-medium">{selectedBusiness.business_status}</p>
                </div>
              </div>
              {selectedBusiness.review_reason && (
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <label className="text-sm text-amber-600 font-medium">Review Reason</label>
                  <p className="text-sm mt-1">{selectedBusiness.review_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link to={`/admin/businesses/${selectedBusiness?.id}/edit`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Business
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
