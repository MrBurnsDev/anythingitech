import { useState, useEffect, FormEvent } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Business } from "@/data/directory";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";

interface AdminBusinessData {
  id: number;
  business_name: string;
  slug: string;
  town: string;
  category: string;
  subcategory: string;
  short_description: string;
  full_address: string;
  phone: string;
  email: string;
  website: string;
  business_status: string;
  needs_manual_review: boolean;
  review_reason: string;
  notes: string;
}

interface AdminEditDrawerProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
  onSaved?: (updatedBusiness: AdminBusinessData) => void;
}

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

export function AdminEditDrawer({
  business,
  open,
  onClose,
  onSaved,
}: AdminEditDrawerProps) {
  const { isAuthenticated } = useAdminAuth();
  const [formData, setFormData] = useState<AdminBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch full business data from admin API when drawer opens
  // Use slug for lookup - IDs may not match between public JSON and Supabase
  useEffect(() => {
    if (open && business && isAuthenticated) {
      fetchBusinessData(business.slug);
    }
  }, [open, business, isAuthenticated]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setFormData(null);
      setError("");
      setSuccess("");
    }
  }, [open]);

  const fetchBusinessData = async (slug: string) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/businesses?slug=${encodeURIComponent(slug)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch business data");
      }

      const data = await response.json();
      const found = data.business;

      if (!found) {
        throw new Error("Business not found");
      }

      setFormData({
        id: found.id,
        business_name: found.business_name || "",
        slug: found.slug || "",
        town: found.town || "",
        category: found.category || "",
        subcategory: found.subcategory || "",
        short_description: found.short_description || "",
        full_address: found.full_address || "",
        phone: found.phone || "",
        email: found.email || "",
        website: found.website || "",
        business_status: found.business_status || "active",
        needs_manual_review: !!found.needs_manual_review,
        review_reason: found.review_reason || "",
        notes: found.notes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof AdminBusinessData,
    value: string | boolean
  ) => {
    if (!formData) return;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validation: ensure we're editing the correct record
    if (business && formData.slug !== business.slug) {
      setError(`SAFETY CHECK FAILED: Drawer opened for "${business.slug}" but loaded "${formData.slug}". Refusing to save.`);
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Send slug with update to ensure correct record is updated
      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, slug: business?.slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save business");
      }

      setSuccess("Changes saved successfully!");
      onSaved?.(formData);

      // Close drawer after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAction = async (action: "flag_review" | "set_inactive") => {
    if (!formData) return;

    setError("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const updates: Partial<AdminBusinessData> = { id: formData.id };

      if (action === "flag_review") {
        updates.needs_manual_review = true;
        updates.review_reason = "Flagged by admin while browsing";
      } else if (action === "set_inactive") {
        updates.business_status = "inactive";
        updates.needs_manual_review = true;
        updates.review_reason = "Hidden from public by admin";
      }

      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update business");
      }

      setSuccess(
        action === "flag_review"
          ? "Flagged for review!"
          : "Business hidden from public!"
      );

      // Update local state
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null
      );

      onSaved?.({ ...formData, ...updates } as AdminBusinessData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Edit Business
            {formData?.business_status === "inactive" && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Inactive
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {business?.name || "Loading..."}
          </SheetDescription>
          {/* Defensive display: verify correct record is loaded */}
          {formData && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground font-mono">
              <div>ID: {formData.id} | Slug: {formData.slug}</div>
              <div>Name: {formData.business_name}</div>
              <div>Town: {formData.town}</div>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : formData ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pb-4 border-b border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("flag_review")}
                disabled={isSaving || formData.needs_manual_review}
              >
                {formData.needs_manual_review ? "Already Flagged" : "Flag for Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("set_inactive")}
                disabled={isSaving || formData.business_status === "inactive"}
                className="text-red-600 hover:text-red-700"
              >
                Hide from Public
              </Button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="town">Town</Label>
                  <Select
                    value={formData.town}
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
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleChange("subcategory", e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) =>
                    handleChange("short_description", e.target.value)
                  }
                  rows={3}
                  placeholder="Brief description"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-medium">Contact Info</h4>

              <div className="space-y-2">
                <Label htmlFor="full_address">Address</Label>
                <Input
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) => handleChange("full_address", e.target.value)}
                  placeholder="123 Main St, Town, MA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(508) 555-1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="info@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex gap-2">
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  {formData.website && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-medium">Status</h4>

              <div className="space-y-2">
                <Label htmlFor="business_status">Visibility</Label>
                <Select
                  value={formData.business_status}
                  onValueChange={(v) => handleChange("business_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Public)</SelectItem>
                    <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="closed">Permanently Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <Label htmlFor="needs_review" className="text-sm font-medium">
                    Needs Review
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Flag for manual verification
                  </p>
                </div>
                <Switch
                  id="needs_review"
                  checked={formData.needs_manual_review}
                  onCheckedChange={(checked) =>
                    handleChange("needs_manual_review", checked)
                  }
                />
              </div>

              {formData.needs_manual_review && (
                <div className="space-y-2">
                  <Label htmlFor="review_reason">Review Reason</Label>
                  <Input
                    id="review_reason"
                    value={formData.review_reason}
                    onChange={(e) =>
                      handleChange("review_reason", e.target.value)
                    }
                    placeholder="Why does this need review?"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={2}
                  placeholder="Admin notes (not public)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border sticky bottom-0 bg-background py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load business data</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
