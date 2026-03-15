import { createUser, getUserById, getUserByEmail, loginUser } from "../src/auth.js";

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

  test("throws error when creating user with duplicate email", async () => {
    await expect(createUser(testEmail, "password123", "Stash Corp")).rejects.toMatchObject({
      status: 400,
      message: "Email already in use",
    });
  });

  test("logs in with correct credentials", async () => {
    const result = await loginUser(testEmail, "password123");
    expect(result.token).toBeDefined();
    expect(result.userId).toBeDefined();
  });

  test("throws error when logging in with wrong password", async () => {
    await expect(loginUser(testEmail, "wrongpassword")).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });

  test("throws error when logging in with non-existent email", async () => {
    await expect(loginUser("nobody@fake.com", "password123")).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });
});