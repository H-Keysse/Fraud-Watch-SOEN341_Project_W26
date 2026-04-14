
//Makes sure email and pw are provided
export function validateLoginInput(email, password) {
  if (!email || !password) {
    return { ok: false, message: "Please enter both email and password" };
  }
  return { ok: true };
}

//Checks registration fields
export function validateRegistrationInput({
  email,
  password,
  firstName,
  lastName,
}) {
  //Must be filled
  if (!email || !password || !firstName || !lastName) {
    return { ok: false, message: "Please fill in all fields" };
  }
  //PW length longer than 6 characters
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters" };
  }
  return { ok: true };
}

//Additional data at signup
export function buildSignUpOptions(firstName, lastName) {
  return {
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  };
}
