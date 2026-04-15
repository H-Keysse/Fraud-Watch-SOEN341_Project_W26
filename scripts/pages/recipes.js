/**
 * recipes.js acts as the page controller for the Recipe Management page.
 *
 * What this file does:
 * - Checks whether the user is authenticated before loading recipes
 * - Loads the current user's recipes from the backend
 * - Applies search and max-cost filters
 * - Renders recipe cards in the UI
 * - Handles creating, editing, and deleting recipes
 * - Opens and closes the recipe and delete confirmation modals
 * - Connects page events to the service and logic layers
 *
 * Architecture role:
 * - Uses authService for session validation
 * - Uses recipeService for database operations
 * - Uses recipeLogic helpers for building filters, payloads, and UI HTML
 *
 */


import * as authService from "../services/authService.js"; // Imports authentication and recipe-related service functions, along with reusable recipe logic helpers used for filtering, payload building and recipe card rendering on this page.

import * as recipeService from "../services/recipeService.js";
import {
  buildRecipeCardHtml,
  buildRecipeFormPayload,
  buildRecipeOrFilter,
  emptyRecipesMessageHtml,
  normalizeMaxCostFilter,
} from "../logic/recipeLogic.js";

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

function showMessage(text, isError = false) { // Displays a temporary success or error message banner to the user
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";

  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 3000);
}

async function init() { // Initializes the page by checking for an authenticated session and then loading the user's recipes
  const {
    data: { session },
  } = await authService.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = session.user;
  await loadRecipes(); // Loads the current user's recipes using the active search and cost filter values
}

async function loadRecipes() {
  const orFilter = buildRecipeOrFilter(searchInput.value);
  const maxCost = normalizeMaxCostFilter(filterCostNumber.value);

  const { data, error } = await recipeService.fetchRecipesList({
    creatorId: currentUser.id,
    orFilter,
    maxCost,
  });

  if (error) {
    console.error("Error loading recipes:", error);
    showMessage("Error loading recipes.", true);
    return;
  }

  renderRecipes(data); // Renders the recipe cards in the page and attaches edit/delete button  listeners
}

function renderRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (recipes.length === 0) {
    recipesContainer.innerHTML = emptyRecipesMessageHtml;
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = buildRecipeCardHtml(recipe, currentUser?.id);
    recipesContainer.appendChild(card);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openEditModal(e.target.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => openDeleteModal(e.target.dataset.id));
  });
}

document.getElementById("add-recipe-btn").addEventListener("click", () => { // Opens the recipe modal in create mode with a cleared form
  recipeForm.reset();
  recipeIdInput.value = "";
  modalTitle.textContent = "Create Recipe";
  recipeModal.classList.add("active");
});

document.getElementById("close-modal").addEventListener("click", () => { // Closes the recipe modal when the user clicks the close icon
  recipeModal.classList.remove("active");
});

document.getElementById("cancel-btn").addEventListener("click", () => { // Closes the recipe modal without saving changes
  recipeModal.classList.remove("active");
});

document.getElementById("home-btn").addEventListener("click", () => { // Navigates back to the home page
  window.location.href = "home.html";
});

let debounceTimer;

function triggerSearch() { // Debounces search/filter updates so recipes are not reloaded on every single keystroke immediately
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadRecipes();
  }, 300);
}

filterCostRange.addEventListener("input", (e) => { // Syncs the numeric cost filter with the range input and reloads recipes with debounce
  filterCostNumber.value = e.target.value;
  triggerSearch();
});

filterCostNumber.addEventListener("input", (e) => {  // Syncs the range input with the numeric cost filter and reloads recipes with debounce
  filterCostRange.value = e.target.value;
  triggerSearch();
});

searchInput.addEventListener("input", triggerSearch); // Reloads recipes when the user types in the search bar, using debounce
 
clearFiltersBtn.addEventListener("click", () => { // Resets the search and cost filters to default values and reloads all recipes
  searchInput.value = "";
  filterCostRange.value = "100";
  filterCostNumber.value = "100";
  loadRecipes();
});

async function openEditModal(id) { // Loads a recipe by id and fills the edit form before opening the recipe modal
  const { data, error } = await recipeService.fetchRecipeById(
    id,
    currentUser.id,
  );

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

recipeForm.addEventListener("submit", async (e) => { // Handles both recipe creation and recipe updates depending on whether a recipe id is present
  e.preventDefault();

  const selectedAllergens = Array.from(
    document.querySelectorAll('input[name="allergens"]:checked'),
  ).map((cb) => cb.value);
  const selectedDietary = Array.from(
    document.querySelectorAll('input[name="dietary"]:checked'),
  ).map((cb) => cb.value);

  const recipeData = buildRecipeFormPayload({
    name: nameInput.value,
    ingredients: ingredientsInput.value,
    steps: stepsInput.value,
    cost: costInput.value,
    time: timeInput.value,
    allergens: selectedAllergens,
    dietaryTags: selectedDietary,
  });

  const recipeId = recipeIdInput.value;

  if (recipeId) {
    const { error } = await recipeService.updateRecipe(
      recipeId,
      recipeData,
      currentUser.id,
    );

    if (error) {
      showMessage("Failed to update recipe: " + error.message, true);
    } else {
      showMessage("Recipe updated successfully!");
      recipeModal.classList.remove("active");
      loadRecipes();
    }
  } else {
    recipeData.creator = currentUser.id;
    const { error } = await recipeService.insertRecipe(recipeData);

    if (error) {
      showMessage("Failed to create recipe: " + error.message, true);
    } else {
      showMessage("Recipe created successfully!");
      recipeModal.classList.remove("active");
      loadRecipes();
    }
  }
});

function openDeleteModal(id) { // Stores the selected recipe id and opens the delete confirmation modal
  recipeToDelete = id;
  deleteModal.classList.add("active");
}

document.getElementById("cancel-delete-btn").addEventListener("click", () => { // Closes the delete confirmation modal without deleting the selected recipe
  deleteModal.classList.remove("active");
  recipeToDelete = null;
});

document
  .getElementById("confirm-delete-btn")
  .addEventListener("click", async () => {
    if (!recipeToDelete) return;

    const { error } = await recipeService.deleteRecipe(
      recipeToDelete,
      currentUser.id,
    );

    deleteModal.classList.remove("active");

    if (error) {
      showMessage("Failed to delete recipe: " + error.message, true);
    } else {
      showMessage("Recipe deleted successfully!");
      loadRecipes();
    }
    recipeToDelete = null;
  });

window.addEventListener("click", (e) => { // Closes open modals when the user clicks outside of the modal content
  if (e.target === recipeModal) {
    recipeModal.classList.remove("active");
  }
  if (e.target === deleteModal) {
    deleteModal.classList.remove("active");
  }
});

init();
