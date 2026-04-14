import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiSuggestionCardHtml,
  buildUserPrompt,
  parseJsonFromAssistantContent,
} from "../scripts/logic/aiRecipeLogic.js";
import { escapeHtml } from "../scripts/logic/sharedLogic.js";

test("buildUserPrompt lists ingredients", () => {
  const p = buildUserPrompt("eggs, milk\nspinach");
  assert.ok(p.includes("- eggs"));
  assert.ok(p.includes("- milk"));
  assert.ok(p.includes("- spinach"));
});

test("parseJsonFromAssistantContent strips markdown fences", () => {
  const raw = "```json\n{\"recipes\":[{\"title\":\"T\",\"ingredients_used\":[],\"steps\":\"s\"}]}\n```";
  const recipes = parseJsonFromAssistantContent(raw);
  assert.equal(recipes.length, 1);
  assert.equal(recipes[0].title, "T");
});

test("parseJsonFromAssistantContent caps at three recipes", () => {
  const recipes = Array.from({ length: 5 }, (_, i) => ({
    title: `R${i}`,
    ingredients_used: [],
    steps: "",
  }));
  const content = JSON.stringify({ recipes });
  const parsed = parseJsonFromAssistantContent(content);
  assert.equal(parsed.length, 3);
});

test("buildAiSuggestionCardHtml uses escape function", () => {
  const html = buildAiSuggestionCardHtml(
    { title: "<x>", ingredients_used: ["a"], steps: "y" },
    escapeHtml,
  );
  assert.ok(html.includes("&lt;x&gt;"));
});
