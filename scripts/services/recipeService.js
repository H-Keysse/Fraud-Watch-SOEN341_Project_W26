/**
Recipe supabase queries: create, edit, delete recipes
**/


import { getSupabase } from "../supabaseClient.js";


export async function fetchRecipesList({ creatorId, orFilter, maxCost }) {
  let query = getSupabase()
    .from("recipes")
    .select("*")
    .eq("creator", creatorId)
    .order("created_at", { ascending: false });

  if (orFilter) {
    query = query.or(orFilter);
  }

  if (maxCost != null) {
    query = query.lte("cost", maxCost);
  }

  return query;
}

export async function fetchRecipeById(id, creatorId) {
  return getSupabase()
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("creator", creatorId)
    .single();
}

export async function updateRecipe(recipeId, recipeData, creatorId) {
  return getSupabase()
    .from("recipes")
    .update(recipeData)
    .eq("id", recipeId)
    .eq("creator", creatorId);
}

export async function insertRecipe(recipeData) {
  return getSupabase().from("recipes").insert([recipeData]);
}

export async function deleteRecipe(recipeId, creatorId) {
  return getSupabase()
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("creator", creatorId);
}
