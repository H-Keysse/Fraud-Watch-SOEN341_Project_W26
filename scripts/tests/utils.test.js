const { htmlCases, validateLoginInputs } = require("../utils");

test("htmlCases escapes dangerous HTML characters", () => {
  expect(htmlCases('<script>alert("x")</script>')).toBe(
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
});

test("htmlCases returns empty string for empty input", () => {
  expect(htmlCases("")).toBe("");
});
test("htmlCases returns empty string for null input", () => {
  expect(htmlCases(null)).toBe("");
});
test("validateLoginInputs returns false when email is missing", () => {
  expect(validateLoginInputs("", "password123")).toBe(false);
});

test("validateLoginInputs returns false when password is missing", () => {
  expect(validateLoginInputs("user@email.com", "")).toBe(false);
});

test("validateLoginInputs returns true when both email and password are provided", () => {
  expect(validateLoginInputs("user@email.com", "password123")).toBe(true);
});
