import * as authService from "../services/authService.js";
import * as mealPlannerService from "../services/mealPlannerService.js";
import { escapeHtml } from "../logic/sharedLogic.js";
import {
  dayLabels,
  mealTypes,
  buildPlannerRowHtml,
  buildWeeklySlotMap,
  formatDateISO,
  formatWeekRange,
  getMonday,
  isRecipeAssignedToAnotherSlotOnSameDay,
  slotKey,
} from "../logic/mealPlannerLogic.js";

let currentUser = null;
let currentWeekStart = getMonday(new Date());
let weeklySlots = {};

const messageBanner = document.getElementById("message-banner");
const weekLabel = document.getElementById("week-label");
const plannerGridBody = document.getElementById("planner-grid-body");
const assignModal = document.getElementById("assign-modal");
const assignForm = document.getElementById("assign-form");
const assignRecipeSelect = document.getElementById("assign-recipe");
const assignContext = document.getElementById("assign-context");
const assignDayInput = document.getElementById("assign-day");
const assignMealTypeInput = document.getElementById("assign-meal-type");

function showMessage(text, isError = false) {
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";
  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 3000);
}

async function loadRecipesIntoSelect() {
  const { data, error } = await mealPlannerService.fetchRecipeOptionsForSelect(
    currentUser.id,
  );

  if (error) {
    throw error;
  }

  const recipes = data || [];
  const options = recipes
    .map(
      (recipe) =>
        `<option value="${recipe.id}">${escapeHtml(recipe.name)}</option>`,
    )
    .join("");

  assignRecipeSelect.innerHTML = `<option value="">Select a recipe</option>${options}`;
}

function renderGrid() {
  plannerGridBody.innerHTML = "";

  mealTypes.forEach((mealType) => {
    const row = document.createElement("tr");
    row.innerHTML = buildPlannerRowHtml(mealType, weeklySlots, escapeHtml);
    plannerGridBody.appendChild(row);
  });
}

async function refreshWeekData() {
  const weekStartDate = formatDateISO(currentWeekStart);
  weekLabel.textContent = formatWeekRange(currentWeekStart);

  const { items } = await mealPlannerService.fetchWeeklyPlan(
    currentUser.id,
    weekStartDate,
  );
  weeklySlots = buildWeeklySlotMap(items);

  renderGrid();
}

function openAssignModal(dayOfWeek, mealType) {
  assignDayInput.value = dayOfWeek;
  assignMealTypeInput.value = mealType;

  const existing = weeklySlots[slotKey(dayOfWeek, mealType)];
  assignRecipeSelect.value = existing ? existing.recipe_id : "";

  assignContext.textContent = `${dayLabels[dayOfWeek - 1]} - ${mealType}`;
  assignModal.classList.add("active");
}

function closeAssignModal() {
  assignModal.classList.remove("active");
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

  try {
    await loadRecipesIntoSelect();
    await refreshWeekData();
  } catch (error) {
    showMessage(`Failed to load planner: ${error.message}`, true);
  }
}

document.getElementById("prev-week-btn").addEventListener("click", async () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  try {
    await refreshWeekData();
  } catch (error) {
    showMessage(`Failed to load previous week: ${error.message}`, true);
  }
});

document.getElementById("next-week-btn").addEventListener("click", async () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  try {
    await refreshWeekData();
  } catch (error) {
    showMessage(`Failed to load next week: ${error.message}`, true);
  }
});

document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});

document.getElementById("recipes-btn").addEventListener("click", () => {
  window.location.href = "recipes.html";
});

document
  .getElementById("close-assign-modal")
  .addEventListener("click", closeAssignModal);
document
  .getElementById("cancel-assign-btn")
  .addEventListener("click", closeAssignModal);

assignForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const recipeId = assignRecipeSelect.value;
  if (!recipeId) {
    showMessage("Please select a recipe.", true);
    return;
  }

  const dayOfWeek = Number(assignDayInput.value);
  const mealType = assignMealTypeInput.value;

  if (
    isRecipeAssignedToAnotherSlotOnSameDay({
      weeklySlots,
      dayOfWeek,
      mealTypeForSlot: mealType,
      recipeId,
    })
  ) {
    showMessage(
      "That recipe is already assigned to another meal this week. Pick a different recipe or clear the other slot first.",
      true,
    );
    return;
  }

  try {
    await mealPlannerService.upsertMealSlot({
      userId: currentUser.id,
      weekStartDate: formatDateISO(currentWeekStart),
      dayOfWeek,
      mealType,
      recipeId,
    });
    closeAssignModal();
    await refreshWeekData();
    showMessage("Meal slot saved.");
  } catch (error) {
    showMessage(`Failed to save meal slot: ${error.message}`, true);
  }
});

plannerGridBody.addEventListener("click", async (event) => {
  const assignBtn = event.target.closest(".assign-btn");
  if (assignBtn) {
    openAssignModal(Number(assignBtn.dataset.day), assignBtn.dataset.mealType);
    return;
  }

  const removeBtn = event.target.closest(".remove-btn");
  if (!removeBtn) return;

  try {
    await mealPlannerService.removeMealSlot({
      userId: currentUser.id,
      weekStartDate: formatDateISO(currentWeekStart),
      dayOfWeek: Number(removeBtn.dataset.day),
      mealType: removeBtn.dataset.mealType,
    });
    await refreshWeekData();
    showMessage("Meal slot removed.");
  } catch (error) {
    showMessage(`Failed to remove meal slot: ${error.message}`, true);
  }
});

window.addEventListener("click", (event) => {
  if (event.target === assignModal) {
    closeAssignModal();
  }
});

init();
