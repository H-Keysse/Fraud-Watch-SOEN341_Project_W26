import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSignUpOptions,
  validateLoginInput,
  validateRegistrationInput,
} from "../scripts/logic/authLogic.js";

test("validateLoginInput rejects missing fields", () => {
  assert.equal(validateLoginInput("", "x").ok, false);
  assert.equal(validateLoginInput("a@b.com", "").ok, false);
});

test("validateLoginInput accepts email and password", () => {
  assert.equal(validateLoginInput("a@b.com", "secret").ok, true);
});

test("validateRegistrationInput enforces minimum password length", () => {
  const r = validateRegistrationInput({
    email: "a@b.com",
    password: "12345",
    firstName: "A",
    lastName: "B",
  });
  assert.equal(r.ok, false);
});

test("buildSignUpOptions shapes metadata", () => {
  assert.deepEqual(buildSignUpOptions("Jane", "Doe"), {
    data: { first_name: "Jane", last_name: "Doe" },
  });
});
