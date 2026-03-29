import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import db from "./db.js";
import jwt from "jsonwebtoken";
import createError from "http-errors";

console.log("JWT_SECRET:", process.env.JWT_SECRET);

async function createUser(email, password, companyName) {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw createError(400, "Email already in use");
  }
  
  const id = randomUUID();

  await db.send(
    new PutCommand({
      TableName: "Users",
      Item: {
        ID: id,
        email,
        password,
        companyName: companyName,
        created_at: new Date().toISOString(),
      },
    }),
  );

  const token = jwt.sign(
    { userId: id, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },  
  );

  return { token, userId: id, email };
}

async function loginUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw createError(401, "Invalid email or password");
  }

  if (user.password !== password) {
    throw createError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user.ID, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },  
  );

  return { token, userId: user.ID};
}

async function getUserById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: "Users",
      Key: { ID: id },
    }),
  );

  if (!result.Item) {
    throw createError(404, "User not found");
  }

  const { password, ...userInfo } = result.Item;
  return userInfo;
}

async function getUserByEmail(email) {
  const result = await db.send(
    new QueryCommand({
      TableName: "Users",
      IndexName: "email-index",
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
    }),
  );
  return result.Items?.[0];
}

export { createUser, loginUser, getUserById, getUserByEmail };
