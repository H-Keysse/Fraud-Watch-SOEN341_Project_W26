import { getSupabase } from "../supabaseClient.js";

import {
  escapeHtml,
  buildRecipeOrFilter,
  normalizeMaxCostFilter,
} from "../logic/sharedLogic.js";




let currentUser = null;
let recipeToDelete = null;

const recipesContainer = document.getElementById("recipes-container");
const recipeModal = document.getElementById("recipe-modal");
const deleteModal = document.getElementById("delete-modal");
const recipeForm = document.getElementById("recipe-form");
const modalTitle = document.getElementById("modal-title");
const messageBanner = document.getElementById("message-banner");

const searchInput = document.getElementById("search-input");
const filterCostRange = document.getElementById("filter-cost-range");
const filterCostNumber = document.getElementById("filter-cost-number");
const clearFiltersBtn = document.getElementById("clear-filters-btn");

const recipeIdInput = document.getElementById("recipe-id");
const nameInput = document.getElementById("recipe-name");
const ingredientsInput = document.getElementById("recipe-ingredients");
const stepsInput = document.getElementById("recipe-steps");
const costInput = document.getElementById("recipe-cost");
const timeInput = document.getElementById("recipe-time");

async function init() {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = session.user;
  await loadRecipes();
}

function showMessage(text, isError = false) {
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";

  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 3000);
}

async function loadRecipes() {
  const orFilter = buildRecipeOrFilter(searchInput.value);
  const maxCost = normalizeMaxCostFilter(filterCostNumber.value);

  let query = getSupabase()
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (orFilter) {
    query = query.or(orFilter);
  }

  if (maxCost != null) {
    query = query.lte("cost", maxCost);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading recipes:", error);
    showMessage("Error loading recipes.", true);
    return;
  }

  renderRecipes(data);
}

function renderRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (recipes.length === 0) {
    recipesContainer.innerHTML =
      '<p style="color: white; grid-column: 1/-1; text-align: center; font-size: 18px; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 10px;">No recipes match your criteria.</p>';
    return;
  }

  recipes.forEach((recipe) => {
    const isCreator = currentUser && recipe.creator === currentUser.id;

    const card = document.createElement("div");
    card.className = "recipe-card";

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
    if (recipe.allergens && recipe.allergens.length > 0) {
      allergensHtml = `
                        <div style="margin-top: 10px;">
                            ${recipe.allergens.map((a) => `<span class="badge badge-allergen">${escapeHtml(a)}</span>`).join("")}
                        </div>
                    `;
    }

    let dietHtml = "";
    if (recipe.dietary_tags && recipe.dietary_tags.length > 0) {
      dietHtml = `
                        <div style="margin-top: 5px;">
                            ${recipe.dietary_tags.map((t) => `<span class="badge badge-diet">${escapeHtml(t)}</span>`).join("")}
                        </div>
                    `;
    }

    card.innerHTML = `
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
                            <i class="fa fa-clock-o"></i> ${recipe.time ? recipe.time + " mins" : "N/A"}
                        </div>
                        <div class="recipe-cost">
                            $${parseFloat(recipe.cost).toFixed(2)}
                        </div>
                    </div>
                    ${actionsHtml}
                `;

    recipesContainer.appendChild(card);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openEditModal(e.target.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openDeleteModal(e.target.dataset.id));
  });
}



document.getElementById("add-recipe-btn").addEventListener("click", () => {
  recipeForm.reset();
  recipeIdInput.value = "";
  modalTitle.textContent = "Create Recipe";
  recipeModal.classList.add("active");
});

document.getElementById("close-modal").addEventListener("click", () => {
  recipeModal.classList.remove("active");
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  recipeModal.classList.remove("active");
});

document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});

let debounceTimer;

function triggerSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadRecipes();
  }, 300);
}

filterCostRange.addEventListener("input", (e) => {
  filterCostNumber.value = e.target.value;
  triggerSearch();
});

filterCostNumber.addEventListener("input", (e) => {
  filterCostRange.value = e.target.value;
  triggerSearch();
});

searchInput.addEventListener("input", triggerSearch);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterCostRange.value = "100";
  filterCostNumber.value = "100";
  loadRecipes();
});

async function openEditModal(id) {
  const { data, error } = await getSupabase()
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showMessage("Error fetching recipe details.", true);
    return;
  }

  recipeIdInput.value = data.id;
  nameInput.value = data.name;
  ingredientsInput.value = data.ingredients;
  stepsInput.value = data.steps;
  costInput.value = data.cost;
  timeInput.value = data.time || "";

  const allergens = data.allergens || [];
  document.querySelectorAll('input[name="allergens"]').forEach((cb) => {
    cb.checked = allergens.includes(cb.value);
  });

  const dietaryTags = data.dietary_tags || [];
  document.querySelectorAll('input[name="dietary"]').forEach((cb) => {
    cb.checked = dietaryTags.includes(cb.value);
  });

  modalTitle.textContent = "Edit Recipe";
  recipeModal.classList.add("active");
}

recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedAllergens = Array.from(
    document.querySelectorAll('input[name="allergens"]:checked'),
  ).map((cb) => cb.value);
  const selectedDietary = Array.from(
    document.querySelectorAll('input[name="dietary"]:checked'),
  ).map((cb) => cb.value);

  const recipeData = {
    name: nameInput.value.trim(),
    ingredients: ingredientsInput.value.trim(),
    steps: stepsInput.value.trim(),
    cost: parseFloat(costInput.value),
    time: parseInt(timeInput.value, 10),
    allergens: selectedAllergens,
    dietary_tags: selectedDietary,
  };

  const recipeId = recipeIdInput.value;

  if (recipeId) {
    const { error } = await getSupabase()
      .from("recipes")
      .update(recipeData)
      .eq("id", recipeId)
      .eq("creator", currentUser.id);

    if (error) {
      showMessage("Failed to update recipe: " + error.message, true);
    } else {
      showMessage("Recipe updated successfully!");
      recipeModal.classList.remove("active");
      loadRecipes();
    }
  } else {
    recipeData.creator = currentUser.id;
    const { error } = await getSupabase().from("recipes").insert([recipeData]);

    if (error) {
      showMessage("Failed to create recipe: " + error.message, true);
    } else {
      showMessage("Recipe created successfully!");
      recipeModal.classList.remove("active");
      loadRecipes();
    }
  }
});

function openDeleteModal(id) {
  recipeToDelete = id;
  deleteModal.classList.add("active");
}

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  deleteModal.classList.remove("active");
  recipeToDelete = null;
});

document
  .getElementById("confirm-delete-btn")
  .addEventListener("click", async () => {
    if (!recipeToDelete) return;

    const { error } = await getSupabase()
      .from("recipes")
      .delete()
      .eq("id", recipeToDelete)
      .eq("creator", currentUser.id);

    deleteModal.classList.remove("active");

    if (error) {
      showMessage("Failed to delete recipe: " + error.message, true);
    } else {
      showMessage("Recipe deleted successfully!");
      loadRecipes();
    }
    recipeToDelete = null;
  });

window.addEventListener("click", (e) => {
  if (e.target === recipeModal) {
    recipeModal.classList.remove("active");
  }
  if (e.target === deleteModal) {
    deleteModal.classList.remove("active");
  }
});

init();
