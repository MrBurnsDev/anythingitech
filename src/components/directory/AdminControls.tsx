import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Business } from "@/data/directory";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Settings2, Pencil, Flag, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { AdminEditDrawer } from "./AdminEditDrawer";

interface AdminControlsProps {
  business: Business;
  variant?: "icon" | "button";
  onUpdated?: () => void;
}

export function AdminControls({
  business,
  variant = "icon",
  onUpdated,
}: AdminControlsProps) {
  const { isAuthenticated } = useAdminAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [hideConfirmOpen, setHideConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't render anything if not authenticated
  if (!isAuthenticated) return null;

  const handleFlagForReview = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: business.id,
          needs_manual_review: true,
          review_reason: "Flagged by admin while browsing public directory",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to flag business");
      }

      onUpdated?.();
    } catch (err) {
      console.error("Failed to flag business:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHideFromPublic = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: business.id,
          business_status: "inactive",
          needs_manual_review: true,
          review_reason: "Hidden from public directory by admin",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to hide business");
      }

      setHideConfirmOpen(false);
      onUpdated?.();

      // Force page refresh to update the listing
      window.location.reload();
    } catch (err) {
      console.error("Failed to hide business:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "icon" ? (
            <button
              className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent z-10"
              onClick={(e) => e.preventDefault()}
              title="Admin actions"
            >
              <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <Button variant="outline" size="sm" onClick={(e) => e.preventDefault()}>
              <Settings2 className="h-4 w-4 mr-2" />
              Manage
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Listing
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFlagForReview();
            }}
            disabled={isProcessing}
          >
            <Flag className="h-4 w-4 mr-2" />
            Flag for Review
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHideConfirmOpen(true);
            }}
            className="text-red-600 focus:text-red-600"
            disabled={isProcessing}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide from Public
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href={`/admin/businesses/${business.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Admin
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Drawer */}
      <AdminEditDrawer
        business={business}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          onUpdated?.();
        }}
      />

      {/* Hide Confirmation Dialog */}
      <AlertDialog open={hideConfirmOpen} onOpenChange={setHideConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide from Public Directory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set <strong>{business.name}</strong> to inactive and hide it
              from the public directory. The listing will still be visible in the
              admin dashboard and can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHideFromPublic}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Hiding...
                </>
              ) : (
                "Hide Listing"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
