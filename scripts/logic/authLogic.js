

export function validateLoginInput(email, password) {
  if (!email || !password) {
    return { ok: false, message: "Please enter both email and password" };
  }
  return { ok: true };
}

export function validateRegistrationInput({
  email,
  password,
  firstName,
  lastName,
}) {
  if (!email || !password || !firstName || !lastName) {
    return { ok: false, message: "Please fill in all fields" };
  }
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters" };
  }
  return { ok: true };
}

export function buildSignUpOptions(firstName, lastName) {
  return {
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  };
}
