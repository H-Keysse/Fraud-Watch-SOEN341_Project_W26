(function initMealMajorSupabase() {
  const lib = window.supabase;
  if (!lib || typeof lib.createClient !== "function") {
    console.error("MealMajor: @supabase/supabase-js must load before supabase-init.js");
    return;
  }

  const supabaseUrl = "https://fymnbakgjpjisnymrfst.supabase.co";
  const supabaseKey = "sb_publishable_2xFC4C41fcvTnUbTIlwSDw_Tc4r2JiK";
  window.__MEAL_MAJOR_SUPABASE__ = lib.createClient(supabaseUrl, supabaseKey);
})();
