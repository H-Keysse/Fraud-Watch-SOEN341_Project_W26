/*
  These tests verify the core AI recipe logic.
  They check that assistant responses are parsed correctly and that
  generated recipe suggestion cards safely escape rendered content.
*/

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiSuggestionCardHtml,
  parseJsonFromAssistantContent,
} from "../scripts/logic/aiRecipeLogic.js";
import { escapeHtml } from "../scripts/logic/sharedLogic.js";

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
