import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRecipeCardHtml,
  buildRecipeOrFilter,
  formatRecipeCostDisplay,
  normalizeMaxCostFilter,
  sanitizeIlikeSearchTerm,
} from "../scripts/logic/recipeLogic.js";

test("sanitizeIlikeSearchTerm trims and removes wildcard chars", () => {
  assert.equal(sanitizeIlikeSearchTerm("  egg%_  "), "egg");
});

test("buildRecipeOrFilter returns null for empty search", () => {
  assert.equal(buildRecipeOrFilter("   "), null);
});

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

test("formatRecipeCostDisplay", () => {
  assert.equal(formatRecipeCostDisplay(3), "3.00");
  assert.equal(formatRecipeCostDisplay("2.5"), "2.50");
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

test("buildRecipeCardHtml hides actions for other users", () => {
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
    "u2",
  );
  assert.equal(html.includes("edit-btn"), false);
});
