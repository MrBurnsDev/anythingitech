import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * GET /api/directory/resolve-slug?slug=old-business-slug
 *
 * Checks if a slug is valid or needs redirect:
 * 1. If slug matches a current business, returns { found: true, slug, business }
 * 2. If slug matches a redirect, returns { found: false, redirect: true, newSlug }
 * 3. If slug doesn't exist, returns { found: false, redirect: false }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug parameter required" });
  }

  try {
    // First, check if slug exists as a current business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, slug, business_name, town, category")
      .eq("slug", slug)
      .eq("is_duplicate", false)
      .eq("business_status", "active")
      .single();

    if (business && !businessError) {
      return res.status(200).json({
        found: true,
        redirect: false,
        slug: business.slug,
        business: {
          id: business.id,
          name: business.business_name,
          town: business.town,
          category: business.category,
        },
      });
    }

    // Check if this is an old slug that should redirect
    const { data: redirect, error: redirectError } = await supabase
      .from("slug_redirects")
      .select("new_slug, business_id")
      .eq("old_slug", slug)
      .single();

    if (redirect && !redirectError) {
      // Get the current business info for the redirect target
      const { data: targetBusiness } = await supabase
        .from("businesses")
        .select("id, slug, business_name, town, category")
        .eq("id", redirect.business_id)
        .eq("is_duplicate", false)
        .single();

      return res.status(200).json({
        found: false,
        redirect: true,
        newSlug: redirect.new_slug,
        business: targetBusiness ? {
          id: targetBusiness.id,
          name: targetBusiness.business_name,
          town: targetBusiness.town,
          category: targetBusiness.category,
        } : null,
      });
    }

    // Slug not found anywhere
    return res.status(200).json({
      found: false,
      redirect: false,
    });
  } catch (error) {
    console.error("Slug resolution error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
