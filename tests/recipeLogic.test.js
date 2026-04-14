/*
  These tests verify the core recipe logic used for filtering and rendering recipes.
  They check that recipe search and cost filtering behave correctly, and that
  recipe cards show the proper actions when the recipe belongs to the current user.
*/

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRecipeCardHtml,
  buildRecipeOrFilter,
  normalizeMaxCostFilter,
} from "../scripts/logic/recipeLogic.js";



test("buildRecipeOrFilter builds PostgREST or expression", () => {
  const f = buildRecipeOrFilter("pasta");
  assert.ok(f.includes("name.ilike.%pasta%"));
  assert.ok(f.includes("ingredients.ilike.%pasta%"));
});

test("normalizeMaxCostFilter", () => {
  assert.equal(normalizeMaxCostFilter("12.5"), 12.5);
  assert.equal(normalizeMaxCostFilter(0), null);
  assert.equal(normalizeMaxCostFilter("x"), null);
});



test("buildRecipeCardHtml marks creator actions", () => {
  const html = buildRecipeCardHtml(
    {
      id: 1,
      name: "Soup",
      ingredients: "water",
      steps: "boil",
      cost: 1,
      time: 5,
      creator: "u1",
      allergens: [],
      dietary_tags: [],
    },
    "u1",
  );
  assert.ok(html.includes("edit-btn"));
  assert.ok(html.includes("delete-btn"));
});


