import * as authService from "../services/authService.js";
import { validateLoginInput } from "../logic/authLogic.js";

document
  .querySelector(".button.login button")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("uname").value;
    const password = document.getElementById("pwd").value;
    const btn = e.target.closest("button");
    const originalText = btn.innerHTML;

    const validation = validateLoginInput(email, password);
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    btn.innerHTML = "<span>Loading...</span>";
    btn.disabled = true;

    try {
      const { error } = await authService.signInWithPassword(email, password);

      if (error) throw error;

      window.location.href = "home.html";
    } catch (error) {
      console.error("Error logging in:", error.message);
      alert("Error logging in: " + error.message);
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
