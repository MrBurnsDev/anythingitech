import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error("Warning: SUPABASE_SERVICE_ROLE_KEY not set");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Business = {
  id: number;
  business_name: string;
  slug: string;
  town: string;
  category: string;
  subcategory: string | null;
  short_description: string | null;
  full_address: string | null;
  street_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  yelp_url: string | null;
  tripadvisor_url: string | null;
  business_status: string;
  confidence_score: number;
  needs_manual_review: boolean;
  review_reason: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
  display_name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};
