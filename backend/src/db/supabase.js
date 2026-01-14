const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

// Service role client for backend operations (bypasses RLS)
// Fall back to anon key if service key not provided
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || supabaseAnonKey || '');

module.exports = { supabase };
