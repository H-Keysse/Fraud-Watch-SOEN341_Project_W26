import * as authService from "../services/authService.js";
import {
  buildAiSuggestionCardHtml,
  buildUserPrompt,
} from "../logic/aiRecipeLogic.js";
import { escapeHtml } from "../logic/sharedLogic.js";
import {
  fetchRecipeIdeasFromOpenAI,
  getOpenAiKeyFromWindow,
} from "../services/aiRecipeService.js";

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

function renderRecipes(recipes) {
  resultsContainer.innerHTML = "";

  if (!recipes.length) {
    resultsContainer.innerHTML =
      '<p class="empty-results">No recipe ideas returned. Try adding more ingredients or different combinations.</p>';
    resultsSection.hidden = false;
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-suggestion-card";
    card.innerHTML = buildAiSuggestionCardHtml(recipe, escapeHtml);
    resultsContainer.appendChild(card);
  });

  resultsSection.hidden = false;
}

homeBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});

aiForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const apiKey = getOpenAiKeyFromWindow();
  if (!apiKey) {
    showMessage(
      "OpenAI API key is not configured. Add openai-config.local.js (see README) or set window.__MEAL_MAJOR_OPENAI_KEY__.",
      true,
    );
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
    const recipes = await fetchRecipeIdeasFromOpenAI({
      apiKey,
      userPrompt,
    });
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
  } = await authService.getSession();

  if (!session) {
    window.location.href = "login.html";
  }
}

init();
