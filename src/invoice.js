import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import db from "./db.js";
import { devNull } from "os";
import createError from "http-errors";

const VALID_TRANSITIONS = {
  created: ["transformed", "cancelled"],
  transformed: ["sent", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
  credited: [],
};

async function updateInvoiceStatus(invoiceId, newStatus) {
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
    }),
  );

  if (!result.Item) {
    throw createError(404, "Invoice not found");
  }

  const currentStatus = result.Item.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowedTransitions.includes(newStatus)) {
    throw createError(
      400,
      `Invalid transition: ${currentStatus} → ${newStatus}`,
    );
  }

  const setClauses = ["SET #status = :status"];
  const expressionValues = { ":status": newStatus };

  if (newStatus === "sent") {
    setClauses.push("sent_at = :sent_at");
    expressionValues[":sent_at"] = new Date().toISOString();
  }
  if (newStatus === "paid") {
    setClauses.push("paid_at = :paid_at");
    expressionValues[":paid_at"] = new Date().toISOString();
  }
  if (newStatus === "overdue") {
    setClauses.push("overdue_since = :overdue_since");
    expressionValues[":overdue_since"] = new Date().toISOString();
  }

  await db.send(
    new UpdateCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
      UpdateExpression: setClauses.join(", "),
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: expressionValues,
    }),
  );

  return { invoiceId, status: newStatus };
}

import toUBLXml from "./XmlConverter.js";
import { uploadXml, deleteXml } from "./s3.js";

async function createInvoice(userId, invoiceData) {
  if (!userId || !invoiceData) {
    throw createError(400, "userId and invoiceData are required");
  }

  const id = randomUUID();
  const xmlS3Key = `invoices/${id}.xml`;

  try {
    await db.send(
      new PutCommand({
        TableName: "Invoices",
        Item: {
          ID: id,
          user_id: userId,
          xmlS3Key: xmlS3Key,
          invoice_data: invoiceData,
          status: "created",
          created_at: new Date().toISOString(),
        },
      }),
    );
  } catch {
    throw createError(500, "Failed to create invoice");
  }

  return { invoiceId: id, status: "created" };
}

async function getInvoiceById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: id },
    }),
  );

  if (!result.Item) {
    throw createError(404, "Invoice not found");
  }
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

async function transformInvoice(invoiceId) {
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
    }),
  );

  if (!result.Item) {
    throw createError(404, "Invoice not found");
  }

  try {
    const invoiceXml = toUBLXml(result.Item.invoice_data);
    await uploadXml(invoiceId, invoiceXml);

    // Update status in Dynamodb
    await updateInvoiceStatus(invoiceId, "transformed");

    return {
      invoiceId,
      status: "transformed",
      invoiceXml,
    };
  } catch (error) {
    console.log(error);
    throw createError(500, "Failed to transform invoice");
  }
}

async function deleteInvoice(invoiceId) {
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
    }),
  );

  if (!result.Item) {
    throw createError(404, "Invoice not found");
  }

  // delete from S3
  if (result.Item.xmlS3Key) {
    await deleteXml(result.Item.xmlS3Key);
  }

  // delete from DynamoDB
  await db.send(
    new DeleteCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
    }),
  );

  return { invoiceId, status: "deleted" };
}

export {
  createInvoice,
  getInvoiceById,
  getInvoicesByUserId,
  transformInvoice,
  deleteInvoice,
  updateInvoiceStatus,
};
