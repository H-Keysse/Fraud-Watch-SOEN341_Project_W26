

const supabaseUrl = 'https://fymnbakgjpjisnymrfst.supabase.co';
const supabaseKey = 'sb_publishable_2xFC4C41fcvTnUbTIlwSDw_Tc4r2JiK';
const _supabase = window.supabase;
window.supabase = _supabase.createClient(supabaseUrl, supabaseKey);
