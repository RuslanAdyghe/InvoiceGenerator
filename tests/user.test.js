import { createUser, getUserById, getUserByEmail } from "../src/auth.js";

describe("DynamoDB User Tests", () => {
  let userId;
  const testEmail = `test-${Date.now()}@stashcorp.com`;
  test("creates a user", async () => {
    const user = await createUser(testEmail, "password123", "Stash Corp");
    expect(user.userId).toBeDefined();
    userId = user.userId;
  });

  test("gets user by ID", async () => {
    const user = await getUserById(userId);
    expect(user.email).toBe(testEmail);
  });

  test("gets user by email", async () => {
    const user = await getUserByEmail("antonio@stashcorp.com");
    expect(user.companyName).toBe("Stash Corp");
  });
});
