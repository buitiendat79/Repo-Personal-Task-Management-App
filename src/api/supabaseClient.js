import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uremxixlyiblaqywbxxc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZW14aXhseWlibGFxeXdieHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Mzg4NTUsImV4cCI6MjA2NTAxNDg1NX0.LzErSH5TBzptPdIDC1lYBR8OUIDxLve_JkGXJ40Gh7Y"
);

export { supabase };
