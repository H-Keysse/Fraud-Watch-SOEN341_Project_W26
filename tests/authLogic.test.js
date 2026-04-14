/*
  This test verifies the core authentication validation logic.
  It ensures that the registration input follows the expected rules,
  especially the minimum password length requirement.
*/

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSignUpOptions,
  validateLoginInput,
  validateRegistrationInput,
} from "../scripts/logic/authLogic.js";


test("validateRegistrationInput enforces minimum password length", () => {
  const r = validateRegistrationInput({
    email: "a@b.com",
    password: "12345",
    firstName: "A",
    lastName: "B",
  });
  assert.equal(r.ok, false);
});
