

let currentUser = null;
const messageBanner = document.getElementById("message-banner");

function showMessage(text, isError = false) {
  messageBanner.textContent = text;
  messageBanner.className = isError ? "error-msg" : "success-msg";
  messageBanner.style.display = "block";

  setTimeout(() => {
    messageBanner.style.display = "none";
  }, 3000);
}

document.getElementById("recipes-btn").addEventListener("click", () => {
  window.location.href = "recipes.html";
});

document.getElementById("planner-btn").addEventListener("click", () => {
  window.location.href = "meal-planner.html";
});

document.getElementById("ai-recipe-btn").addEventListener("click", () => {
  window.location.href = "ai-recipe-idea.html";
});

async function checkSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
  } else {
    console.log("User:", session.user);
    currentUser = session.user;
    const email = session.user.email;
    document.getElementById("welcome-msg").textContent =
      `You are logged in as ${email}`;

    await loadUserPreferences();
  }
}

async function loadUserPreferences() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from("users")
    .select("dietary_preferences, allergies")
    .eq("id", currentUser.id)
    .single();

  if (data) {
    const dietPrefs = data.dietary_preferences || [];
    document.querySelectorAll('input[name="profile_dietary"]').forEach((cb) => {
      cb.checked = dietPrefs.includes(cb.value);
    });

    const allergies = data.allergies || [];
    document
      .querySelectorAll('input[name="profile_allergies"]')
      .forEach((cb) => {
        cb.checked = allergies.includes(cb.value);
      });
  }
}

checkSession();

document
  .getElementById("save-profile-btn")
  .addEventListener("click", async () => {
    if (!currentUser) return;

    const selectedDiet = Array.from(
      document.querySelectorAll('input[name="profile_dietary"]:checked'),
    ).map((cb) => cb.value);
    const selectedAllergies = Array.from(
      document.querySelectorAll('input[name="profile_allergies"]:checked'),
    ).map((cb) => cb.value);

    const { error } = await supabase.from("users").upsert({
      id: currentUser.id,
      dietary_preferences: selectedDiet,
      allergies: selectedAllergies,
    });

    if (error) {
      showMessage("Error saving preferences: " + error.message, true);
    } else {
      showMessage("Preferences saved successfully!");
    }
  });

document.getElementById("logout-btn").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = "login.html";
  } else {
    alert("Error logging out: " + error.message);
  }
});
