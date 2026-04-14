/*
  These tests verify the meal planner's same day recipe assignment logic.
  They check three main cases. 
  1. When there is no conflict. 
  2. When the same recipe is assigned to another meal slot on the same day 
  3. When the current slot being edited should not count as a duplicate.
*/

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWeeklySlotMap,
  isRecipeAssignedToAnotherSlotOnSameDay,
} from "../scripts/logic/mealPlannerLogic.js";


test("isRecipeAssignedToAnotherSlotOnSameDay is false when no conflict", () => {
  const weeklySlots = buildWeeklySlotMap([
    {
      day_of_week: 1,
      meal_type: "breakfast",
      recipe_id: 9,
      recipes: { name: "Jam Toast" },
    },
  ]);
  assert.equal(
    isRecipeAssignedToAnotherSlotOnSameDay({
      weeklySlots,
      dayOfWeek: 1,
      mealTypeForSlot: "lunch",
      recipeId: 10,
    }),
    false,
  );
});

test("isRecipeAssignedToAnotherSlotOnSameDay detects same recipe on another slot", () => {
  const weeklySlots = buildWeeklySlotMap([
    {
      day_of_week: 1,
      meal_type: "breakfast",
      recipe_id: 9,
      recipes: { name: "Jam Toast" },
    },
  ]);
  assert.equal(
    isRecipeAssignedToAnotherSlotOnSameDay({
      weeklySlots,
      dayOfWeek: 1,
      mealTypeForSlot: "lunch",
      recipeId: 9,
    }),
    true,
  );
});

test("isRecipeAssignedToAnotherSlotOnSameDay ignores the slot being edited", () => {
  const weeklySlots = buildWeeklySlotMap([
    {
      day_of_week: 1,
      meal_type: "lunch",
      recipe_id: 9,
      recipes: { name: "Steak" },
    },
  ]);
  assert.equal(
    isRecipeAssignedToAnotherSlotOnSameDay({
      weeklySlots,
      dayOfWeek: 1,
      mealTypeForSlot: "lunch",
      recipeId: 9,
    }),
    false,
  );
});
