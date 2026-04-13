const { htmlCases } = require("../utils");

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
