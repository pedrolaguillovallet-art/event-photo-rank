import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !supabaseUrl || !supabaseAnonKey;

export const supabase = !isDemoMode
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export const maxUploadMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 8);
