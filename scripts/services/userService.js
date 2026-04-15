// User DB queries: fetch and update preferences & allergies

import { getSupabase } from "../supabaseClient.js";

export async function fetchUserPreferences(userId) {
  return getSupabase()
    .from("users")
    .select("dietary_preferences, allergies")
    .eq("id", userId)
    .single();
}

export async function upsertUserProfileRow(payload) {
  return getSupabase().from("users").upsert(payload);
}
