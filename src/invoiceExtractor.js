import Anthropic from "@anthropic-ai/sdk";
import createError from "http-errors";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an invoice data extractor. Extract invoice fields and return ONLY valid JSON with no extra text, matching this exact schema:
{
  "ProfileID": "string",
  "IssueDate": "YYYY-MM-DD",
  "DueDate": "YYYY-MM-DD",
  "OrderReference": { "ID": "string" },
  "Delivery": {
    "ActualDeliveryDate": "YYYY-MM-DD",
    "ActualDeliveryTime": "HH:MM:SS"
  },
  "PaymentMeans": {
    "PaymentMeansCode": "string",
    "PaymentDueDate": "YYYY-MM-DD",
    "PayeeFinancialAccount": {
      "ID": "string",
      "Name": "string",
      "Currency": "string"
    }
  },
  "Supplier": { "ID": "string", "Name": "string" },
  "Customer": { "ID": "string", "Name": "string" },
  "LegalMonetaryTotal": {
    "Currency": "string",
    "LineExtensionAmount": "string",
    "TaxExclusiveAmount": "string",
    "TaxInclusiveAmount": "string",
    "PayableAmount": "string"
  }
}
Use null for any fields you cannot find.`;

export async function extractInvoiceFromFile(fileBuffer, mimeType) {
  const isCSV = mimeType === "text/csv";
  const isPDF = mimeType === "application/pdf";

  if (!isCSV && !isPDF) {
    throw createError(400, "Only PDF and CSV files are supported");
  }

  let messageContent;

  if (isPDF) {
    const base64Data = fileBuffer.toString("base64");
    messageContent = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64Data,
        },
      },
      { type: "text", text: "Extract the invoice data from this PDF." },
    ];
  } else {
    const csvText = fileBuffer.toString("utf-8");
    messageContent = [
      {
        type: "text",
        text: `Extract the invoice data from this CSV:\n\n${csvText}`,
      },
    ];
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: messageContent }],
  });

  try {
    const raw = response.content[0].text.replace(/```json|```/g, "").trim();
    return JSON.parse(raw);
  } catch {
    throw createError(500, "Failed to parse extracted invoice data");
  }
}
