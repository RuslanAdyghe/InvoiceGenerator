import { createUser, getUserById, getUserByEmail } from "../src/auth.js";

describe("DynamoDB User Tests", () => {
  let userId;

  test("creates a user", async () => {
    const user = await createUser("antonio@stashcorp.com", "Stash Corp");
    expect(user.id).toBeDefined();
    userId = user.id;
  });

  test("gets user by ID", async () => {
    const user = await getUserById(userId);
    expect(user.email).toBe("antonio@stashcorp.com");
  });

  test("gets user by email", async () => {
    const user = await getUserByEmail("antonio@stashcorp.com");
    expect(user.companyName).toBe("Stash Corp");
  });
});
