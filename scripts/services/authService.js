/**
 * authService.js handles authentication-related service calls.
 *
 * What this file does:
 * - Communicates with Supabase Auth for login, logout, and session retrieval
 * - Keeps authentication requests separate from page logic
 *
 * Used by: login.js, home.js and register.js
 */

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
