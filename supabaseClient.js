
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://wkyofedpqmewpzuqkkmx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreW9mZWRwcW1ld3B6dXFra214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMjgzMDAsImV4cCI6MjA1MjkwNDMwMH0.jt0hhzSz95ry1ZTAY6RresNH8jPaxAUq4z5xbdwhZEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
