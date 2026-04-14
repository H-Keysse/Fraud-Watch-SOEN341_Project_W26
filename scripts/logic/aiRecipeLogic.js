//Guide prompt for AI response

export const aiSystemPrompt = `You are a helpful cooking assistant. The user will list ingredients they have.
Respond with a single JSON object only (no markdown fences) with this exact shape:
{"recipes":[{"title":"string","ingredients_used":["string"],"steps":"string"}]}
Rules:
- Include between 0 and 3 items in "recipes" (never more than 3).
- Each recipe must use ingredients from the user's list where possible; list which ones you use in "ingredients_used".
- "steps" should be brief numbered or short paragraph instructions.
- If no good recipes fit, return {"recipes":[]}.`;

//Formats ingredient inputs into list

export function buildUserPrompt(ingredientsRaw) {
  const lines = ingredientsRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const listText = lines.length
    ? lines.map((x) => `- ${x}`).join("\n")
    : ingredientsRaw.trim();

  //Final prompt fed to OpenAI
  return `Here are the ingredients I have available:\n${listText}\n\nSuggest between 0 and 3 realistic recipes I can make using primarily these ingredients. You may assume basic pantry items only if essential (salt, pepper, oil, water) and say so in the steps if used. If nothing sensible can be made, return an empty recipes array.`;
}


export function parseJsonFromAssistantContent(content) {
  let trimmed = (content || "").trim();
  if (trimmed.startsWith("```")) {
    trimmed = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/u, "");
  }
  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.recipes)) {
    throw new Error("Invalid response shape from model.");
  }
  return parsed.recipes.slice(0, 3);
}

export function buildAiSuggestionCardHtml(recipe, escapeHtmlFn) {
  const title = escapeHtmlFn(recipe.title || "Untitled");
  const ingredients = Array.isArray(recipe.ingredients_used)
    ? recipe.ingredients_used.map((i) => `<li>${escapeHtmlFn(i)}</li>`).join("")
    : "";
  const steps = escapeHtmlFn(recipe.steps || "");

  return `
      <h3>${title}</h3>
      <div class="recipe-suggestion-section">
        <strong>Ingredients used (from your list)</strong>
        <ul>${ingredients || "<li>—</li>"}</ul>
      </div>
      <div class="recipe-suggestion-section">
        <strong>Steps</strong>
        <p class="recipe-steps">${steps || "—"}</p>
      </div>
    `;
}
