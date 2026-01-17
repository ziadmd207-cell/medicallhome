import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nxacpvgxhjzscydouayq.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_Fb_c4h0JotdEvqUb388qug_7qrPOesX";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);