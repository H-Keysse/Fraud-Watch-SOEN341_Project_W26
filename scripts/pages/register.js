import * as authService from "../services/authService.js";
import {
  buildSignUpOptions,
  validateRegistrationInput,
} from "../logic/authLogic.js";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("pwd").value;
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("lname").value;
  const btn = document.querySelector(".button.register button");
  const originalText = btn.innerHTML;

  const validation = validateRegistrationInput({
    email,
    password,
    firstName,
    lastName,
  });
  if (!validation.ok) {
    alert(validation.message);
    return;
  }

  btn.innerHTML = "<span>Registering...</span>";
  btn.disabled = true;

  try {
    const options = buildSignUpOptions(firstName, lastName);
    const { data, error } = await authService.signUp(email, password, options);

    if (error) throw error;

    if (data.session) {
      alert("Registration successful! Redirecting...");
      window.location.href = "home.html";
    }
  } catch (error) {
    console.error("Error registering:", error.message);
    alert("Error registering: " + error.message);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});
