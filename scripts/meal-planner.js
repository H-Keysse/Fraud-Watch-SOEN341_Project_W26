let currentUser = null;
let currentWeekStart = getMonday(new Date());
let recipes = [];
let weeklySlots = {};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

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

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDateISO(date) {
  return date.toISOString().split("T")[0];
}

function formatWeekRange(mondayDate) {
  const endDate = new Date(mondayDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${mondayDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

function slotKey(dayOfWeek, mealType) {
  return `${dayOfWeek}-${mealType}`;
}

function escapeHtml(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getOrCreateMealPlan(weekStartDate) {
  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(
      {
        user_id: currentUser.id,
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

async function fetchWeeklyPlan(weekStartDate) {
  const mealPlan = await getOrCreateMealPlan(weekStartDate);

  const { data, error } = await supabase
    .from("meal_plan_items")
    .select("id, day_of_week, meal_type, recipe_id, recipes(id, name)")
    .eq("meal_plan_id", mealPlan.id);

  if (error) {
    throw error;
  }

  return { mealPlan, items: data || [] };
}

async function upsertMealSlot({ weekStartDate, dayOfWeek, mealType, recipeId }) {
  const mealPlan = await getOrCreateMealPlan(weekStartDate);

  const { error } = await supabase.from("meal_plan_items").upsert(
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

async function removeMealSlot({ weekStartDate, dayOfWeek, mealType }) {
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();

  if (mealPlanError) {
    throw mealPlanError;
  }
  if (!mealPlan) {
    return;
  }

  const { error } = await supabase
    .from("meal_plan_items")
    .delete()
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType);

  if (error) {
    throw error;
  }
}

async function loadRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  recipes = data || [];
  const options = recipes
    .map((recipe) => `<option value="${recipe.id}">${escapeHtml(recipe.name)}</option>`)
    .join("");

  assignRecipeSelect.innerHTML = `<option value="">Select a recipe</option>${options}`;
}

function renderGrid() {
  plannerGridBody.innerHTML = "";

  mealTypes.forEach((mealType) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th class="meal-type-cell">${mealType}</th>`;

    for (let day = 1; day <= 7; day += 1) {
      const slot = weeklySlots[slotKey(day, mealType)];
      const recipeName = slot && slot.recipes ? escapeHtml(slot.recipes.name) : "";

      row.innerHTML += `
        <td>
          <div class="slot-card">
            <div class="slot-recipe">${recipeName || "<span class='empty-slot'>No meal assigned</span>"}</div>
            <div class="slot-actions">
              <button class="btn btn-primary assign-btn" data-day="${day}" data-meal-type="${mealType}">
                ${slot ? "Edit" : "Assign"}
              </button>
              ${
                slot
                  ? `<button class="btn btn-danger remove-btn" data-day="${day}" data-meal-type="${mealType}">Remove</button>`
                  : ""
              }
            </div>
          </div>
        </td>
      `;
    }

    plannerGridBody.appendChild(row);
  });
}

async function refreshWeekData() {
  const weekStartDate = formatDateISO(currentWeekStart);
  weekLabel.textContent = formatWeekRange(currentWeekStart);

  const { items } = await fetchWeeklyPlan(weekStartDate);
  weeklySlots = {};

  items.forEach((item) => {
    weeklySlots[slotKey(item.day_of_week, item.meal_type)] = item;
  });

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
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = session.user;

  try {
    await loadRecipes();
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

document.getElementById("close-assign-modal").addEventListener("click", closeAssignModal);
document.getElementById("cancel-assign-btn").addEventListener("click", closeAssignModal);

assignForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const recipeId = assignRecipeSelect.value;
  if (!recipeId) {
    showMessage("Please select a recipe.", true);
    return;
  }

  try {
    await upsertMealSlot({
      weekStartDate: formatDateISO(currentWeekStart),
      dayOfWeek: Number(assignDayInput.value),
      mealType: assignMealTypeInput.value,
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
    await removeMealSlot({
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
