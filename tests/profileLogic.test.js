import assert from "node:assert/strict";
import test from "node:test";
import { buildProfileUpsertPayload } from "../scripts/logic/profileLogic.js";

test("buildProfileUpsertPayload includes user id and arrays", () => {
  const payload = buildProfileUpsertPayload("user-1", ["Vegan"], ["Peanuts"]);
  assert.deepEqual(payload, {
    id: "user-1",
    dietary_preferences: ["Vegan"],
    allergies: ["Peanuts"],
  });
});
