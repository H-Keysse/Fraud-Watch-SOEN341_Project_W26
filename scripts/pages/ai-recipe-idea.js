

const OPENAI_API_KEY =
  "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";

const messageBanner = document.getElementById("message-banner");
const homeBtn = document.getElementById("home-btn");
const aiForm = document.getElementById("ai-form");
const ingredientsInput = document.getElementById("ingredients-input");
const submitBtn = document.getElementById("submit-btn");
const resultsSection = document.getElementById("results-section");
const resultsContainer = document.getElementById("results-container");

function showMessage(text, isError = false) {
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";
  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 5000);
}

function escapeHtml(unsafe) {
  return (unsafe || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildUserPrompt(ingredientsRaw) {
  const lines = ingredientsRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const listText = lines.length ? lines.map((x) => `- ${x}`).join("\n") : ingredientsRaw.trim();

  return `Here are the ingredients I have available:\n${listText}\n\nSuggest between 0 and 3 realistic recipes I can make using primarily these ingredients. You may assume basic pantry items only if essential (salt, pepper, oil, water) and say so in the steps if used. If nothing sensible can be made, return an empty recipes array.`;
}

const SYSTEM_PROMPT = `You are a helpful cooking assistant. The user will list ingredients they have.
Respond with a single JSON object only (no markdown fences) with this exact shape:
{"recipes":[{"title":"string","ingredients_used":["string"],"steps":"string"}]}
Rules:
- Include between 0 and 3 items in "recipes" (never more than 3).
- Each recipe must use ingredients from the user's list where possible; list which ones you use in "ingredients_used".
- "steps" should be brief numbered or short paragraph instructions.
- If no good recipes fit, return {"recipes":[]}.`;

function parseJsonFromAssistantContent(content) {
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

async function fetchRecipeIdeas(apiKey, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in API response.");
  }

  return parseJsonFromAssistantContent(content);
}

function renderRecipes(recipes) {
  resultsContainer.innerHTML = "";

  if (!recipes.length) {
    resultsContainer.innerHTML =
      '<p class="empty-results">No recipe ideas returned. Try adding more ingredients or different combinations.</p>';
    resultsSection.hidden = false;
    return;
  }

  recipes.forEach((recipe) => {
    const title = escapeHtml(recipe.title || "Untitled");
    const ingredients = Array.isArray(recipe.ingredients_used)
      ? recipe.ingredients_used.map((i) => `<li>${escapeHtml(i)}</li>`).join("")
      : "";
    const steps = escapeHtml(recipe.steps || "");

    const card = document.createElement("article");
    card.className = "recipe-suggestion-card";
    card.innerHTML = `
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
    resultsContainer.appendChild(card);
  });

  resultsSection.hidden = false;
}

homeBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});

aiForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!OPENAI_API_KEY.trim()) {
    showMessage("OpenAI API key is not configured in scripts/ai-recipe-idea.js.", true);
    return;
  }

  const ingredientsRaw = ingredientsInput.value.trim();
  if (!ingredientsRaw) {
    showMessage("Please list at least one ingredient.", true);
    return;
  }

  const userPrompt = buildUserPrompt(ingredientsRaw);
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Thinking...';

  try {
    const recipes = await fetchRecipeIdeas(OPENAI_API_KEY, userPrompt);
    renderRecipes(recipes);
    showMessage(
      recipes.length
        ? `Received ${recipes.length} recipe idea(s).`
        : "No recipes suggested for those ingredients.",
    );
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Something went wrong.", true);
    resultsSection.hidden = true;
    resultsContainer.innerHTML = "";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa fa-magic"></i> Get recipe ideas';
  }
});

async function init() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }
}

init();
