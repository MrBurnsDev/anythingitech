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
} from "lucide-react";

interface Stats {
  total: number;
  active: number;
  needsReview: number;
  byTown: Record<string, number>;
  byCategory: Record<string, number>;
  recentUpdates: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");

      // Fetch all businesses to compute stats
      const response = await fetch("/api/admin/businesses?limit=1000", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      const businesses = data.businesses || [];

      // Compute stats
      const byTown: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let needsReview = 0;
      let active = 0;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      let recentUpdates = 0;

      businesses.forEach((b: Record<string, unknown>) => {
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
        total: businesses.length,
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

      // Fetch the public businesses.json
      const jsonResponse = await fetch("/data/exports/businesses.json");
      if (!jsonResponse.ok) {
        throw new Error("Failed to load businesses.json");
      }
      const businesses = await jsonResponse.json();

      // Call the migration API
      const response = await fetch("/api/admin/migrate-directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businesses }),
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {stats?.recentUpdates || 0} updates this week
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Activity log coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
