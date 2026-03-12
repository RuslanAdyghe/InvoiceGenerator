import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import db from "./db.js";

async function createUser(email, companyName) {
  const id = randomUUID();
  await db.send(
    new PutCommand({
      TableName: "Users",
      Item: {
        id,
        email,
        companyName: companyName,
        created_at: new Date().toISOString(),
      },
    }),
  );
  return { id };
}

async function getUserById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: "Users",
      Key: { id },
    }),
  );
  return result.Item;
}

async function getUserByEmail(email) {
  const result = await db.send(
    new QueryCommand({
      TableName: "Users",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    }),
  );
  return result.Items?.[0];
}

export { createUser, getUserById, getUserByEmail };
