

import { escapeHtml } from "./sharedLogic.js";


export function sanitizeIlikeSearchTerm(raw) {
  return (raw || "").trim().replace(/%/g, "").replace(/_/g, "");
}

export function buildRecipeOrFilter(searchTerm) {
  const q = sanitizeIlikeSearchTerm(searchTerm);
  if (!q) return null;
  const pattern = `%${q}%`;
  return `name.ilike.${pattern},ingredients.ilike.${pattern},steps.ilike.${pattern}`;
}

export function normalizeMaxCostFilter(value) {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export function buildRecipeFormPayload({
  name,
  ingredients,
  steps,
  cost,
  time,
  allergens,
  dietaryTags,
}) {
  return {
    name: name.trim(),
    ingredients: ingredients.trim(),
    steps: steps.trim(),
    cost: parseFloat(cost),
    time: parseInt(time, 10),
    allergens,
    dietary_tags: dietaryTags,
  };
}

export function formatRecipeCostDisplay(cost) {
  const n = parseFloat(cost);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

export function formatRecipeTimeDisplay(minutes) {
  if (minutes == null || minutes === "") return "N/A";
  const n = Number(minutes);
  if (Number.isNaN(n)) return "N/A";
  return `${n} mins`;
}


export function buildRecipeCardHtml(recipe, currentUserId) {
  const isCreator = currentUserId && recipe.creator === currentUserId;

  let actionsHtml = "";
  if (isCreator) {
    actionsHtml = `
                        <div class="card-actions">
                            <button class="btn btn-secondary edit-btn" data-id="${recipe.id}">Edit</button>
                            <button class="btn btn-danger delete-btn" data-id="${recipe.id}">Delete</button>
                        </div>
                    `;
  }

  let allergensHtml = "";
  const allergens = recipe.allergens;
  if (allergens && allergens.length > 0) {
    allergensHtml = `
                        <div style="margin-top: 10px;">
                            ${allergens.map((a) => `<span class="badge badge-allergen">${escapeHtml(a)}</span>`).join("")}
                        </div>
                    `;
  }

  let dietHtml = "";
  const tags = recipe.dietary_tags;
  if (tags && tags.length > 0) {
    dietHtml = `
                        <div style="margin-top: 5px;">
                            ${tags.map((t) => `<span class="badge badge-diet">${escapeHtml(t)}</span>`).join("")}
                        </div>
                    `;
  }

  return `
                    <h3>${escapeHtml(recipe.name)}</h3>
                    <div class="recipe-section">
                        <strong>Ingredients:</strong>
                        <p>${escapeHtml(recipe.ingredients)}</p>
                    </div>
                    <div class="recipe-section">
                        <strong>Steps:</strong>
                        <p>${escapeHtml(recipe.steps)}</p>
                    </div>
                    ${allergensHtml}
                    ${dietHtml}
                    <div class="recipe-meta">
                        <div class="recipe-time">
                            <i class="fa fa-clock-o"></i> ${formatRecipeTimeDisplay(recipe.time)}
                        </div>
                        <div class="recipe-cost">
                            $${formatRecipeCostDisplay(recipe.cost)}
                        </div>
                    </div>
                    ${actionsHtml}
                `;
}

export const emptyRecipesMessageHtml =
  '<p style="color: white; grid-column: 1/-1; text-align: center; font-size: 18px; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 10px;">No recipes match your criteria.</p>';
