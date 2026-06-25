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
  onSaved?: (updatedBusiness: AdminBusinessData, slugChanged?: boolean, newSlug?: string) => void;
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
  "Lodging",
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
  const [supabaseId, setSupabaseId] = useState<number | null>(null); // Store Supabase ID for reliable lookups
  const [originalSlug, setOriginalSlug] = useState<string>(""); // Track original slug for change detection
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slugError, setSlugError] = useState("");

  // Fetch full business data from admin API when drawer opens
  // Try ID first (reliable), then fall back to slug, then try slug_redirects
  useEffect(() => {
    if (open && business && isAuthenticated) {
      // If we already have the Supabase ID for this business, use it
      if (supabaseId && formData?.business_name === business.name) {
        fetchBusinessDataById(supabaseId);
      } else {
        // First time opening - try slug lookup
        fetchBusinessDataBySlug(business.slug);
      }
    }
  }, [open, business, isAuthenticated]);

  // Reset state when closed, but preserve supabaseId for same business
  useEffect(() => {
    if (!open) {
      setFormData(null);
      setError("");
      setSuccess("");
      setSlugError("");
      // Don't reset supabaseId - keep it for next open
    }
  }, [open]);

  // Reset supabaseId when switching to a different business
  useEffect(() => {
    if (business && formData && business.name !== formData.business_name) {
      setSupabaseId(null);
    }
  }, [business?.name]);

  const fetchBusinessDataById = async (id: number) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/businesses?id=${id}`, {
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

      populateFormData(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinessDataBySlug = async (slug: string) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");

      // Try direct slug lookup first
      let response = await fetch(`/api/admin/businesses?slug=${encodeURIComponent(slug)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = await response.json();
      let found = data.business;

      // If not found, try resolving through slug_redirects
      if (!found && response.status === 404) {
        const redirectResponse = await fetch(`/api/directory/resolve-slug?slug=${encodeURIComponent(slug)}`);
        const redirectData = await redirectResponse.json();

        if (redirectData.redirect && redirectData.newSlug) {
          // Try the new slug
          response = await fetch(`/api/admin/businesses?slug=${encodeURIComponent(redirectData.newSlug)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          data = await response.json();
          found = data.business;
        }
      }

      if (!found) {
        throw new Error("Business not found in admin database. It may need to be synced.");
      }

      populateFormData(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormData = (found: Record<string, unknown>) => {
    const id = found.id as number;
    setSupabaseId(id); // Store the Supabase ID for future lookups
    setFormData({
      id,
      business_name: (found.business_name as string) || "",
      slug: (found.slug as string) || "",
      town: (found.town as string) || "",
      category: (found.category as string) || "",
      subcategory: (found.subcategory as string) || "",
      short_description: (found.short_description as string) || "",
      full_address: (found.full_address as string) || "",
      phone: (found.phone as string) || "",
      email: (found.email as string) || "",
      website: (found.website as string) || "",
      business_status: (found.business_status as string) || "active",
      needs_manual_review: !!found.needs_manual_review,
      review_reason: (found.review_reason as string) || "",
      notes: (found.notes as string) || "",
    });
    setOriginalSlug((found.slug as string) || "");
  };

  // Validate slug format
  const validateSlug = (slug: string): string | null => {
    if (!slug) return "Slug cannot be empty";
    if (slug.length < 3) return "Slug must be at least 3 characters";
    if (slug.length > 200) return "Slug must be less than 200 characters";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return "Use lowercase letters, numbers, and hyphens only";
    }
    return null;
  };

  // Normalize slug on input
  const normalizeSlug = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (
    field: keyof AdminBusinessData,
    value: string | boolean
  ) => {
    if (!formData) return;

    // Special handling for slug field
    if (field === "slug" && typeof value === "string") {
      const normalized = normalizeSlug(value);
      setFormData((prev) => (prev ? { ...prev, slug: normalized } : null));
      const validationError = validateSlug(normalized);
      setSlugError(validationError || "");
      return;
    }

    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validate slug if it was changed
    const slugIsChanging = formData.slug !== originalSlug;
    if (slugIsChanging) {
      const slugValidation = validateSlug(formData.slug);
      if (slugValidation) {
        setSlugError(slugValidation);
        setError("Please fix the slug error before saving");
        return;
      }
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Build the request body
      const requestBody: Record<string, unknown> = {
        ...formData,
        lookup_slug: originalSlug, // Use original slug to find the record
      };

      // If slug is changing, send as new_slug
      if (slugIsChanging) {
        requestBody.new_slug = formData.slug;
        delete requestBody.slug; // Remove slug from regular fields
      } else {
        delete requestBody.slug; // Don't send slug if unchanged
      }

      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save business");
      }

      if (data.slugChanged) {
        setSuccess(`Saved! Slug changed from "${data.previousSlug}" to "${data.slug}". Old URL will redirect.`);
        onSaved?.(formData, true, data.slug);
      } else {
        setSuccess("Changes saved successfully!");
        onSaved?.(formData, false);
      }

      // Close drawer after short delay
      setTimeout(() => {
        onClose();
      }, 2000);
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

              {/* Slug editing */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                  URL Slug
                  {formData.slug !== originalSlug && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      Changed
                    </span>
                  )}
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="business-name-town"
                  className={slugError ? "border-red-500" : ""}
                />
                {slugError && (
                  <p className="text-xs text-red-500">{slugError}</p>
                )}
                {formData.slug !== originalSlug && !slugError && (
                  <p className="text-xs text-amber-600">
                    Changing the slug will create a redirect from the old URL
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Current: /marthas-vineyard/.../
                  <span className="font-mono">{formData.slug}</span>
                </p>
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
