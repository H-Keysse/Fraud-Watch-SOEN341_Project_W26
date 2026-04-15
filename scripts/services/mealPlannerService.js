/**
Meal planner: creation, deletion & editing of the weekly slots
**/


import { getSupabase } from "../supabaseClient.js";

export async function getOrCreateMealPlan(userId, weekStartDate) {
  const { data, error } = await getSupabase()
    .from("meal_plans")
    .upsert(
      {
        user_id: userId,
        week_start_date: weekStartDate,
      },
      { onConflict: "user_id,week_start_date" },
    )
    .select("id, week_start_date")
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function fetchMealPlanItems(mealPlanId) {
  return getSupabase()
    .from("meal_plan_items")
    .select("id, day_of_week, meal_type, recipe_id, recipes(id, name)")
    .eq("meal_plan_id", mealPlanId);
}

export async function fetchWeeklyPlan(userId, weekStartDate) {
  const mealPlan = await getOrCreateMealPlan(userId, weekStartDate);
  const { data, error } = await fetchMealPlanItems(mealPlan.id);

  if (error) {
    throw error;
  }

  return { mealPlan, items: data || [] };
}

export async function upsertMealSlot({
  userId,
  weekStartDate,
  dayOfWeek,
  mealType,
  recipeId,
}) {
  await assertRecipeOwnedByUser(Number(recipeId), userId);

  const mealPlan = await getOrCreateMealPlan(userId, weekStartDate);

  const { error } = await getSupabase().from("meal_plan_items").upsert(
    {
      meal_plan_id: mealPlan.id,
      day_of_week: dayOfWeek,
      meal_type: mealType,
      recipe_id: Number(recipeId),
    },
    { onConflict: "meal_plan_id,day_of_week,meal_type" },
  );

  if (error) {
    throw error;
  }
}

export async function removeMealSlot({ userId, weekStartDate, dayOfWeek, mealType }) {
  const { data: mealPlan, error: mealPlanError } = await getSupabase()
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();

  if (mealPlanError) {
    throw mealPlanError;
  }
  if (!mealPlan) {
    return;
  }

  const { error } = await getSupabase()
    .from("meal_plan_items")
    .delete()
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType);

  if (error) {
    throw error;
  }
}

export async function fetchRecipeOptionsForSelect(userId) {
  return getSupabase()
    .from("recipes")
    .select("id, name")
    .eq("creator", userId)
    .order("name", { ascending: true });
}

async function assertRecipeOwnedByUser(recipeId, userId) {
  const { data, error } = await getSupabase()
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("creator", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("That recipe is not in your library.");
  }
}
