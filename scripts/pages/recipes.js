import * as authService from "../services/authService.js";
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

function showMessage(text, isError = false) {
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";

  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 3000);
}

async function init() {
  const {
    data: { session },
  } = await authService.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = session.user;
  await loadRecipes();
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

  renderRecipes(data);
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

recipeForm.addEventListener("submit", async (e) => {
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

window.addEventListener("click", (e) => {
  if (e.target === recipeModal) {
    recipeModal.classList.remove("active");
  }
  if (e.target === deleteModal) {
    deleteModal.classList.remove("active");
  }
});

init();
