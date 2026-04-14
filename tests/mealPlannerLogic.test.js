import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWeeklySlotMap,
  formatDateISO,
  getMonday,
  isRecipeAssignedToAnotherSlotOnSameDay,
  slotKey,
} from "../scripts/logic/mealPlannerLogic.js";

test("getMonday returns Monday for a Wednesday", () => {
  const wed = new Date(2026, 3, 8, 12, 0, 0);
  assert.equal(wed.getDay(), 3);
  const mon = getMonday(wed);
  assert.equal(mon.getDay(), 1);
});

test("formatDateISO returns YYYY-MM-DD", () => {
  const d = new Date(Date.UTC(2026, 3, 13));
  assert.equal(formatDateISO(d), "2026-04-13");
});

test("slotKey is stable", () => {
  assert.equal(slotKey(2, "lunch"), "2-lunch");
});

test("buildWeeklySlotMap indexes by slot key", () => {
  const map = buildWeeklySlotMap([
    {
      day_of_week: 1,
      meal_type: "breakfast",
      recipe_id: 9,
      recipes: { name: "Toast" },
    },
  ]);
  assert.equal(map["1-breakfast"].recipes.name, "Toast");
});

test("isRecipeAssignedToAnotherSlotOnSameDay is false when no conflict", () => {
  const weeklySlots = buildWeeklySlotMap([
    {
      day_of_week: 1,
      meal_type: "breakfast",
      recipe_id: 9,
      recipes: { name: "Toast" },
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
      recipes: { name: "Toast" },
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
      recipes: { name: "Toast" },
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
