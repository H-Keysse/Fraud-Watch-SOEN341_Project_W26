/**
 * supabase-init.js
 * Responsibility:
 * - Creates a single Supabase client instance used by all pages.
 *
 * Notes:
 * - This file should be loaded BEFORE scripts that call supabase.
 */

// Initialize the Supabase client
const supabaseUrl = 'https://fymnbakgjpjisnymrfst.supabase.co';
const supabaseKey = 'sb_publishable_2xFC4C41fcvTnUbTIlwSDw_Tc4r2JiK';
const _supabase = window.supabase;
window.supabase = _supabase.createClient(supabaseUrl, supabaseKey);
