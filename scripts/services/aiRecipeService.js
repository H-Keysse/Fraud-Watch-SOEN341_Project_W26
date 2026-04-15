/**
OpenAI API integration, request recipe ideas & retrieve api key
**/

import {
  aiSystemPrompt,
  parseJsonFromAssistantContent,
} from "../logic/aiRecipeLogic.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";


export async function fetchRecipeIdeasFromOpenAI({
  apiKey,
  userPrompt,
  fetchImpl = fetch,
}) {
  const res = await fetchImpl(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: aiSystemPrompt },
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

export function getOpenAiKeyFromWindow() {
  if (typeof window === "undefined") return "";
  return (window.__MEAL_MAJOR_OPENAI_KEY__ || "").trim();
}
