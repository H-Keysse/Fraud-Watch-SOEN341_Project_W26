/**
 * home.js
 * -----------------------------------------------------------------------------
 * Responsibility: Auth-protected home page + user profile preferences.
 *
 * Features in this file:
 * - Session guard: if user is not logged in -> redirect to login.html
 * - Display "You are logged in as <email>"
 * - Load + save user profile preferences (dietary_preferences, allergies)
 *
 * Data contract (Supabase tables used here):
 * Table: users
 * - id (uuid)                   : primary key AND matches auth.users.id (auth.uid())
 * - email (text)                : user email (optional to store; Auth also has it)
 * - full_name (text)            : optional profile field
 * - avatar_url (text)           : optional profile field
 * - created_at (timestamptz)    : timestamp (set by DB)
 * - dietary_preferences (text[]) : array of dietary preferences/tags
 * - allergies (text[])           : array of allergies
 *
 * Relationship:
 * - users.id references auth.users.id (one-to-one profile row for each auth user)
 */

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
