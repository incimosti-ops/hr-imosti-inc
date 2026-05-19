import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://vvvrdleuyexoznpddgaa.supabase.co";

const supabaseKey =
  "sb_publishable_UqDKoXMQLN7fc27EUeLyRA_eCaYxlaB";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);