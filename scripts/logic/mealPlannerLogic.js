//Labels for days & meal types
export const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

//Returns the Monday of the week given a date
export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

//Date formatting (YYYY-MM-DD format)
export function formatDateISO(date) {
  return date.toISOString().split("T")[0];
}

//Formats week range
export function formatWeekRange(mondayDate) {
  const endDate = new Date(mondayDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${mondayDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

//Unique key for slot in the meal planner
export function slotKey(dayOfWeek, mealType) {
  return `${dayOfWeek}-${mealType}`;
}
//lookup map for the slots
export function buildWeeklySlotMap(items) {
  const weeklySlots = {};
  (items || []).forEach((item) => {
    weeklySlots[slotKey(item.day_of_week, item.meal_type)] = item;
  });
  return weeklySlots;
}

// Checks for duplicate recipe in the same week
export function isRecipeAssignedToAnotherSlotOnSameDay({
  weeklySlots,
  dayOfWeek,
  mealTypeForSlot,
  recipeId,
}) {
  const id = String(recipeId);
  for (let day = 1; day <= 7; day += 1) {
    for (const mealType of mealTypes) {
      if (day === dayOfWeek && mealType === mealTypeForSlot) continue;
      const slot = weeklySlots[slotKey(day, mealType)];
      if (
        slot != null &&
        slot.recipe_id != null &&
        String(slot.recipe_id) === id
      ) {
        return true;
      }
    }
  }
  return false;
}

//Generates HTML for each row in the meal planner
export function buildPlannerRowHtml(mealType, weeklySlots, escapeHtmlFn) {
  let cells = `<th class="meal-type-cell">${mealType}</th>`;

  for (let day = 1; day <= 7; day += 1) {
    const slot = weeklySlots[slotKey(day, mealType)];
    const recipeName =
      slot && slot.recipes ? escapeHtmlFn(slot.recipes.name) : "";

    cells += `
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

  return `<tr>${cells}</tr>`;
}
