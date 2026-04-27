import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessData {
  id?: number;
  business_name: string;
  slug: string;
  town: string;
  category: string;
  subcategory: string;
  short_description: string;
  full_address: string;
  street_address: string;
  phone: string;
  email: string;
  website: string;
  facebook_url: string;
  instagram_url: string;
  yelp_url: string;
  tripadvisor_url: string;
  business_status: string;
  confidence_score: number;
  needs_manual_review: boolean;
  review_reason: string;
  notes: string;
  latitude: string;
  longitude: string;
}

const emptyBusiness: BusinessData = {
  business_name: "",
  slug: "",
  town: "",
  category: "",
  subcategory: "",
  short_description: "",
  full_address: "",
  street_address: "",
  phone: "",
  email: "",
  website: "",
  facebook_url: "",
  instagram_url: "",
  yelp_url: "",
  tripadvisor_url: "",
  business_status: "active",
  confidence_score: 50,
  needs_manual_review: false,
  review_reason: "",
  notes: "",
  latitude: "",
  longitude: "",
};

const MV_TOWNS = [
  "Aquinnah",
  "Chilmark",
  "Edgartown",
  "Oak Bluffs",
  "Tisbury",
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

export default function AdminBusinessEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [business, setBusiness] = useState<BusinessData>(emptyBusiness);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      fetchBusiness(id);
    }
  }, [id, isNew]);

  const fetchBusiness = async (businessId: string) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/businesses?id=${businessId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch business");
      }

      const data = await response.json();
      const found = data.business;

      if (!found) {
        throw new Error("Business not found");
      }

      setBusiness({
        id: found.id,
        business_name: found.business_name || "",
        slug: found.slug || "",
        town: found.town || "",
        category: found.category || "",
        subcategory: found.subcategory || "",
        short_description: found.short_description || "",
        full_address: found.full_address || "",
        street_address: found.street_address || "",
        phone: found.phone || "",
        email: found.email || "",
        website: found.website || "",
        facebook_url: found.facebook_url || "",
        instagram_url: found.instagram_url || "",
        yelp_url: found.yelp_url || "",
        tripadvisor_url: found.tripadvisor_url || "",
        business_status: found.business_status || "active",
        confidence_score: found.confidence_score || 50,
        needs_manual_review: !!found.needs_manual_review,
        review_reason: found.review_reason || "",
        notes: found.notes || "",
        latitude: found.latitude?.toString() || "",
        longitude: found.longitude?.toString() || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string, town: string): string => {
    const nameSlug = name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 80);

    const townSlug = town
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${nameSlug}-${townSlug}`;
  };

  const handleChange = (
    field: keyof BusinessData,
    value: string | number | boolean
  ) => {
    setBusiness((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name or town changes
      if ((field === "business_name" || field === "town") && isNew) {
        updated.slug = generateSlug(
          field === "business_name" ? (value as string) : prev.business_name,
          field === "town" ? (value as string) : prev.town
        );
      }

      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      const payload = {
        ...business,
        latitude: business.latitude ? parseFloat(business.latitude) : null,
        longitude: business.longitude ? parseFloat(business.longitude) : null,
        confidence_score: business.confidence_score || 50,
      };

      const response = await fetch("/api/admin/businesses", {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save business");
      }

      setSuccess(isNew ? "Business created successfully!" : "Changes saved!");

      if (isNew && data.id) {
        // Navigate to edit page after creation
        setTimeout(() => {
          navigate(`/admin/businesses/${data.id}/edit`, { replace: true });
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
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

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/businesses")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-semibold">
                {isNew ? "Add Business" : "Edit Business"}
              </h1>
              {!isNew && (
                <p className="text-muted-foreground mt-1">{business.slug}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && business.website && (
              <Button type="button" variant="outline" asChild>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? "Create Business" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Review Warning */}
        {business.needs_manual_review && (
          <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Needs Review:</strong> {business.review_reason || "Manual review required"}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="business_name"
                  value={business.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={business.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="auto-generated"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="town">
                  Town <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={business.town}
                  onValueChange={(v) => handleChange("town", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select town" />
                  </SelectTrigger>
                  <SelectContent>
                    {MV_TOWNS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={business.category}
                  onValueChange={(v) => handleChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={business.subcategory}
                  onChange={(e) => handleChange("subcategory", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Description</Label>
              <Textarea
                id="short_description"
                value={business.short_description}
                onChange={(e) => handleChange("short_description", e.target.value)}
                rows={3}
                placeholder="Brief description of the business"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={business.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(508) 555-1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={business.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="info@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={business.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_address">Full Address</Label>
                <Input
                  id="full_address"
                  value={business.full_address}
                  onChange={(e) => handleChange("full_address", e.target.value)}
                  placeholder="123 Main St, Edgartown, MA 02539"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={business.street_address}
                  onChange={(e) => handleChange("street_address", e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  type="url"
                  value={business.facebook_url}
                  onChange={(e) => handleChange("facebook_url", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={business.instagram_url}
                  onChange={(e) => handleChange("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yelp_url">Yelp</Label>
                <Input
                  id="yelp_url"
                  type="url"
                  value={business.yelp_url}
                  onChange={(e) => handleChange("yelp_url", e.target.value)}
                  placeholder="https://yelp.com/biz/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripadvisor_url">TripAdvisor</Label>
                <Input
                  id="tripadvisor_url"
                  type="url"
                  value={business.tripadvisor_url}
                  onChange={(e) => handleChange("tripadvisor_url", e.target.value)}
                  placeholder="https://tripadvisor.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Coordinates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={business.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="41.3881"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={business.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="-70.5134"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_status">Status</Label>
                <Select
                  value={business.business_status}
                  onValueChange={(v) => handleChange("business_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence_score">
                  Confidence Score ({business.confidence_score}%)
                </Label>
                <Input
                  id="confidence_score"
                  type="range"
                  min="0"
                  max="100"
                  value={business.confidence_score}
                  onChange={(e) =>
                    handleChange("confidence_score", parseInt(e.target.value, 10))
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <Label htmlFor="needs_review" className="text-base">
                  Needs Manual Review
                </Label>
                <p className="text-sm text-muted-foreground">
                  Flag this business for manual verification
                </p>
              </div>
              <Switch
                id="needs_review"
                checked={business.needs_manual_review}
                onCheckedChange={(checked) =>
                  handleChange("needs_manual_review", checked)
                }
              />
            </div>

            {business.needs_manual_review && (
              <div className="space-y-2">
                <Label htmlFor="review_reason">Review Reason</Label>
                <Input
                  id="review_reason"
                  value={business.review_reason}
                  onChange={(e) => handleChange("review_reason", e.target.value)}
                  placeholder="Why does this need review?"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={business.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                placeholder="Notes visible only to admins"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/businesses")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNew ? "Create Business" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
