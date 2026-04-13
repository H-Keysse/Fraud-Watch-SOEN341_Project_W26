function htmlCases(input) {
  return (input || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateLoginInputs(email, password) {
  return Boolean(email && password);
}

function Profilecheck(userId, selectedDiet, selectedAllergies) {
  return {
    id: userId,
    dietary_preferences: selectedDiet,
    allergies: selectedAllergies,
  };
}

module.exports = {
  escapeHtml,
  validateLoginInputs,
  Profilecheck
};
