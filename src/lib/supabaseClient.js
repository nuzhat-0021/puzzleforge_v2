import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://akjrxisqrskpnmvdklge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFranJ4aXNxcnBrbnBtdmRrbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDY0MzcsImV4cCI6MjEwNTQ4MjQzN30.jHJKXnviaw_7soXedUed5MuQjuoFU_3mqVzM2YpiPZ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
