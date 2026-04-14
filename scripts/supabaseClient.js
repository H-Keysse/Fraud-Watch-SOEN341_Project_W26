export function getSupabase() {
  const client = window.__MEAL_MAJOR_SUPABASE__;
  if (!client) {
    throw new Error("Supabase client not initialized. Load supabase-init.js first.");
  }
  return client;
}
