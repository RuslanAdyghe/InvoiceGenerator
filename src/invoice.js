import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import db from "../db.js";
import { devNull } from "os";

async function createInvoice(userId, invoiceData) {
  const id = randomUUID();
  await db.send(
    new PutCommand({
      TableName: "Invoices",
      Item: {
        ID: id,
        user_id: userId,
        invoice_data: invoiceData,
        status: "created",
        created_at: new Date().toISOString(),
      },
    }),
  );
  return { id };
}

async function getInvoiceById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: id },
    }),
  );
  return result.Item;
}

async function getInvoicesByUserId(userid) {
  const result = await db.send(
    new QueryCommand({
      TableName: "Invoices",
      IndexName: "user_id-index",
      KeyConditionExpression: "user_id = :uid",
      ExpressionAttributeValues: { ":uid": userid },
    }),
  );
  return result.Items ?? [];
}
