import Anthropic from "@anthropic-ai/sdk";
import createError from "http-errors";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an invoice data extractor. Extract invoice fields and return ONLY valid JSON with no extra text, matching this exact schema:

{
  "InvoiceID": "string",
  "ProfileID": "string",
  "IssueDate": "YYYY-MM-DD",
  "DueDate": "YYYY-MM-DD",
  "InvoiceTypeCode": "string",
  "DocumentCurrencyCode": "string",
  "OrderReference": {
    "ID": "string"
  },
  "Delivery": {
    "ActualDeliveryDate": "YYYY-MM-DD",
    "ActualDeliveryTime": "HH:MM:SS"
  },
  "PaymentMeans": {
    "PaymentMeansCode": "string",
    "PaymentDueDate": "YYYY-MM-DD",
    "PayeeFinancialAccount": {
      "ID": "string",
      "Name": "string"
    }
  },
  "LegalMonetaryTotal": {
    "LineExtensionAmount": "number",
    "TaxExclusiveAmount": "number",
    "TaxInclusiveAmount": "number",
    "AllowanceTotalAmount": "number",
    "ChargeTotalAmount": "number",
    "PrepaidAmount": "number",
    "PayableAmount": "number"
  },
  "Supplier": {
    "EndpointID": "string",
    "PartyName": "string",
    "Name": "string",
    "ID": "string",
    "PostalAddress": {
      "StreetName": "string",
      "AdditionalStreetName": "string",
      "CityName": "string",
      "PostalZone": "string",
      "CountrySubentity": "string",
      "Country": "string"
    }
  },
  "Customer": {
    "EndpointID": "string",
    "PartyName": "string",
    "Name": "string",
    "ID": "string",
    "PostalAddress": {
      "StreetName": "string",
      "AdditionalStreetName": "string",
      "CityName": "string",
      "PostalZone": "string",
      "CountrySubentity": "string",
      "Country": "string"
    }
  }
}

Rules:
- Use null for any fields you cannot find.
- Dates must be in YYYY-MM-DD format.
- Times must be in HH:MM:SS format.
- All monetary values must be numbers (not strings).
- Do not include any extra fields or text outside the JSON.
- Ensure nested objects exist even if their fields are null.
- InvoiceID is read-only; extract it only if explicitly present in the invoice.

Return ONLY the JSON.`;

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
