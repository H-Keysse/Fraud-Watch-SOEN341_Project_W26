/*
  This test verifies the core shared HTML escaping logic.
  It ensures that special characters are safely escaped before rendering content.
*/


import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml } from "../scripts/logic/sharedLogic.js";

test("escapeHtml escapes HTML special characters", () => {
  assert.equal(
    escapeHtml(`<a href="x">y & z's</a>`),
    "&lt;a href=&quot;x&quot;&gt;y &amp; z&#039;s&lt;/a&gt;",
  );
});

