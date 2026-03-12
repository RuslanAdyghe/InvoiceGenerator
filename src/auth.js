import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import db from "../db.js";

export async function createUser(UserEmail, companyName) {
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
