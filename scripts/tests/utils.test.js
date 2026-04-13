const { escapeHtml } = require("../utils");

test("escapeHtml escapes dangerous HTML characters", () => {
  expect(escapeHtml('<script>alert("x")</script>')).toBe(
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
});
