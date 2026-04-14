import { getSupabase } from "../supabaseClient.js";

export async function getSession() {
  return getSupabase().auth.getSession();
}

export async function signInWithPassword(email, password) {
  return getSupabase().auth.signInWithPassword({ email, password });
}

export async function signUp(email, password, options) {
  return getSupabase().auth.signUp({ email, password, options });
}

export async function signOut() {
  return getSupabase().auth.signOut();
}
