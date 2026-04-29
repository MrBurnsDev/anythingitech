import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  MapPin,
  Tags,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Stats {
  total: number;
  active: number;
  needsReview: number;
  byTown: Record<string, number>;
  byCategory: Record<string, number>;
  recentUpdates: number;
}

interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  currentBusinessId: number | null;
  businessName: string | null;
  businessSlug: string | null;
  description: string;
  performedBy: string;
  createdAt: string;
  changes: Record<string, unknown> | null;
  previousValues: Record<string, unknown> | null;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [cleanupResult, setCleanupResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const ACTIVITY_PER_PAGE = 15;

  const fetchActivity = async (page = 1) => {
    setIsLoadingActivity(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `/api/admin/businesses?action=activity&limit=${ACTIVITY_PER_PAGE}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setActivities(data.activities || []);
        if (data.pagination) {
          setActivityPage(data.pagination.page);
          setActivityTotalPages(data.pagination.totalPages);
          setActivityTotal(data.pagination.total);
        }
      } else {
        console.error("Activity fetch failed:", data);
      }
    } catch (err) {
      console.error("Activity fetch error:", err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");

      // Fetch all businesses by paginating through all pages
      let allBusinesses: Record<string, unknown>[] = [];
      let page = 1;
      let totalFromApi = 0;
      const limit = 100; // API max is 100

      while (true) {
        const response = await fetch(`/api/admin/businesses?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }

        const data = await response.json();
        const businesses = data.businesses || [];
        allBusinesses = allBusinesses.concat(businesses);

        // Get total from pagination info (most accurate)
        if (data.pagination) {
          totalFromApi = data.pagination.total;
          if (page >= data.pagination.totalPages) break;
        } else {
          // No more pages if we got fewer than limit
          if (businesses.length < limit) break;
        }
        page++;
      }

      // Compute stats from all fetched businesses
      const byTown: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let needsReview = 0;
      let active = 0;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      let recentUpdates = 0;

      allBusinesses.forEach((b: Record<string, unknown>) => {
        // Town counts
        const town = (b.town as string) || "Unknown";
        byTown[town] = (byTown[town] || 0) + 1;

        // Category counts
        const category = (b.category as string) || "Uncategorized";
        byCategory[category] = (byCategory[category] || 0) + 1;

        // Status counts
        if (b.needs_manual_review) needsReview++;
        if (b.business_status === "active") active++;

        // Recent updates
        if (b.updated_at && new Date(b.updated_at as string) > weekAgo) {
          recentUpdates++;
        }
      });

      setStats({
        total: totalFromApi || allBusinesses.length,
        active,
        needsReview,
        byTown,
        byCategory,
        recentUpdates,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExportResult({
          success: true,
          message: `Exported ${data.exported.businesses} businesses, ${data.exported.towns} towns, ${data.exported.categories} categories`,
        });
      } else {
        setExportResult({
          success: false,
          message: data.error || "Export failed",
        });
      }
    } catch {
      setExportResult({
        success: false,
        message: "Network error during export",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSync = async () => {
    if (!confirm("This will sync all businesses from the public JSON to Supabase. Continue?")) {
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      const token = localStorage.getItem("admin_token");

      // Call the migration API - server will read businesses.json directly
      const response = await fetch("/api/admin/migrate-directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncResult({
          success: true,
          message: `Synced ${data.stats.input} businesses: ${data.stats.updated} updated, ${data.stats.inserted} inserted, ${data.stats.errors?.length || 0} errors`,
        });
        // Refresh stats after sync
        fetchStats();
      } else {
        setSyncResult({
          success: false,
          message: data.error || "Sync failed",
        });
      }
    } catch (err) {
      setSyncResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error during sync",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm("This will find and mark duplicate businesses, creating redirects. Continue?")) {
      return;
    }

    setIsCleaning(true);
    setCleanupResult(null);

    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch("/api/admin/cleanup-duplicates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCleanupResult({
          success: true,
          message: `Found ${data.summary.duplicateGroupsFound} duplicate groups, marked ${data.summary.businessesMarkedDuplicate} as duplicates, created ${data.summary.redirectsCreated} redirects`,
        });
        fetchStats();
      } else {
        setCleanupResult({
          success: false,
          message: data.error || "Cleanup failed",
        });
      }
    } catch (err) {
      setCleanupResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error during cleanup",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const topTowns = Object.entries(stats?.byTown || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topCategories = Object.entries(stats?.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Martha's Vineyard Business Directory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCleanup} disabled={isCleaning}>
              {isCleaning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Duplicates
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sync from JSON
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Public Data
                </>
              )}
            </Button>
            <Button asChild>
              <Link to="/admin/businesses/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Business
              </Link>
            </Button>
          </div>
        </div>

        {/* Cleanup Result */}
        {cleanupResult && (
          <Alert
            className={
              cleanupResult.success
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {cleanupResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{cleanupResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Sync Result */}
        {syncResult && (
          <Alert
            className={
              syncResult.success
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {syncResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{syncResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Export Result */}
        {exportResult && (
          <Alert
            className={
              exportResult.success
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {exportResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{exportResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Businesses
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.active || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Towns
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats?.byTown || {}).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across the island
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats?.byCategory || {}).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Business types
              </p>
            </CardContent>
          </Card>

          <Card className={stats?.needsReview ? "border-amber-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Review
              </CardTitle>
              <AlertTriangle
                className={`h-4 w-4 ${stats?.needsReview ? "text-amber-500" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.needsReview || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.needsReview
                  ? "Requires attention"
                  : "All businesses reviewed"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {stats?.needsReview ? (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">
                    {stats.needsReview} businesses need review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review and verify business information
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/businesses?needs_review=true">
                  Review Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Town */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">By Town</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/businesses">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTowns.map(([town, count]) => (
                  <div key={town} className="flex items-center justify-between">
                    <Link
                      to={`/admin/businesses?town=${encodeURIComponent(town)}`}
                      className="text-sm hover:underline"
                    >
                      {town}
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(count / (stats?.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">By Category</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/businesses">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Link
                      to={`/admin/businesses?category=${encodeURIComponent(category)}`}
                      className="text-sm hover:underline truncate max-w-[180px]"
                    >
                      {category}
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(count / (stats?.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {activityTotal} total entries
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity) => {
                  const isBusinessAction = activity.entityType === "business" && activity.businessSlug;
                  const content = (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.performedBy} •{" "}
                          {formatRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          activity.action === "create"
                            ? "bg-green-500/10 text-green-600"
                            : activity.action === "archive"
                              ? "bg-red-500/10 text-red-600"
                              : activity.action === "login" || activity.action === "logout"
                                ? "bg-gray-500/10 text-gray-600"
                                : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {activity.action}
                      </span>
                    </>
                  );

                  // Only make clickable if business still exists (currentBusinessId was found)
                  return isBusinessAction && activity.currentBusinessId ? (
                    <Link
                      key={activity.id}
                      to={`/admin/businesses/${activity.currentBusinessId}/edit`}
                      className="flex items-start justify-between gap-4 py-2 px-2 -mx-2 border-b last:border-0 rounded hover:bg-muted/50 transition-colors"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between gap-4 py-2 border-b last:border-0"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {activityTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {activityPage} of {activityTotalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchActivity(activityPage - 1)}
                    disabled={activityPage <= 1 || isLoadingActivity}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchActivity(activityPage + 1)}
                    disabled={activityPage >= activityTotalPages || isLoadingActivity}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
