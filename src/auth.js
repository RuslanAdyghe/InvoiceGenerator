import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import db from "./db.js";

async function createUser(UserEmail, companyName) {
  const id = crypto.randomUUID();
  await db.send(
    new PutCommand({
      TableName: "users",
      Item: {
        id,
        email,
        companyName: companyName,
        created_at: new Date().toISOString,
      },
    }),
  );
  return { id };
}

async function getUserById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: "users",
      Key: { id },
    }),
  );
  return result.Item;
}

async function getUserByEmail(email) {
  const result = await db.send(
    new QueryCommand({
      TableName: "users",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    }),
  );
  return result.Items?.[0];
}

export { createUser, getUserById, getUserByEmail };
