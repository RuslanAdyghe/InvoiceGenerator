import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import db from "./db.js";
import { devNull } from "os";
import createError from "http-errors";
import { uploadXml, getXmlUrl } from "./s3.js";

import toUBLXml from "./XmlConverter.js";

async function createInvoice(userId, invoiceData) {
  if (!userId || !invoiceData) {
    throw createError(400, "userId and invoiceData are required");
  }

  const id = randomUUID();
  let xmlS3Key;
  try {
    const xml = toUBLXml(invoiceData);
    xmlS3Key = await uploadXml(id, xml);
  } catch (error) {
    console.error("S3 upload error:", error);
    throw createError(500, "Failed to upload invoice XML");
  }

  try {
    await db.send(
      new PutCommand({
        TableName: "Invoices",
        Item: {
          ID: id,
          user_id: userId,
          invoice_data: invoiceData,
          xml_s3_key: xmlS3Key,
          status: "created",
          created_at: new Date().toISOString(),
        },
      }),
    );
  } catch (error) {
    console.error("DynamoDB error:", error);
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

export { createInvoice, getInvoiceById, getInvoicesByUserId, transformInvoice };
