

export function buildProfileUpsertPayload(userId, dietaryPreferences, allergies) {
  return {
    id: userId,
    dietary_preferences: dietaryPreferences,
    allergies,
  };
}
