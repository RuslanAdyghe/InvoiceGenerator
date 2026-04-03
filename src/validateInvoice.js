// NOTE: Current custom validation structure is used to validate xml as currently isn't up to UBL standards due to missing fields.
// full UBL 2.4 XSD validation will be implemented when output xml has all correct fields.

import libxmljs from "libxmljs2";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import db from "./db.js";
import { downloadXml } from "./s3.js";

function validateXmlStructure(xmlDoc) {
  const errors = [];

  // Define namespaces for XPath
  const namespaces = {
    cbc: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    cac: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  };

  // Check required elements exist using XPath
  const requiredElements = [
    "//cbc:ProfileID",
    "//cbc:IssueDate",
    "//cbc:DueDate",
    "//cac:OrderReference",
    "//cac:Delivery",
    "//cac:PaymentMeans",
    "//cac:AccountingSupplierParty",
    "//cac:AccountingCustomerParty",
    "//cac:LegalMonetaryTotal",
  ];

  for (const xpath of requiredElements) {
    const nodes = xmlDoc.find(xpath, namespaces);
    if (nodes.length === 0) {
      const elementName = xpath.replace("//", "");
      errors.push({ message: `Missing required element: ${elementName}` });
    }
  }

  // Check date formats are valid
  const issueDateNodes = xmlDoc.find("//cbc:IssueDate", namespaces);
  const dueDateNodes = xmlDoc.find("//cbc:DueDate", namespaces);

  if (
    issueDateNodes.length > 0 &&
    isNaN(Date.parse(issueDateNodes[0].text()))
  ) {
    errors.push({ message: "IssueDate is not a valid date" });
  }

  if (dueDateNodes.length > 0 && isNaN(Date.parse(dueDateNodes[0].text()))) {
    errors.push({ message: "DueDate is not a valid date" });
  }

  // Check currencyID attributes on required monetary amounts
  const monetaryElements = [
    "LineExtensionAmount",
    "TaxExclusiveAmount",
    "TaxInclusiveAmount",
    "PayableAmount",
  ];

  for (const element of monetaryElements) {
    const nodes = xmlDoc.find(`//cbc:${element}`, namespaces);
    if (nodes.length > 0 && !nodes[0].attr("currencyID")) {
      errors.push({
        message: `${element} is missing required currencyID attribute`,
      });
    }
  }

  return errors;
}

function validateBusinessRules(invoiceData) {
  const errors = [];
  const lmt = invoiceData.LegalMonetaryTotal;

  // TaxInclusiveAmount should be greater than TaxExclusiveAmount
  if (lmt.TaxInclusiveAmount <= lmt.TaxExclusiveAmount) {
    errors.push({
      message: "TaxInclusiveAmount must be greater than TaxExclusiveAmount",
    });
  }

  // PayableAmount check
  let expectedPayable = lmt.TaxInclusiveAmount;
  if (lmt.PrepaidAmount) {
    expectedPayable = lmt.TaxInclusiveAmount - lmt.PrepaidAmount;
  }

  if (Math.abs(lmt.PayableAmount - expectedPayable) > 0.01) {
    errors.push({
      message: `PayableAmount ${lmt.PayableAmount} does not match expected ${expectedPayable}`,
    });
  }

  // DueDate should not be before IssueDate
  if (new Date(invoiceData.DueDate) < new Date(invoiceData.IssueDate)) {
    errors.push({ message: "DueDate cannot be before IssueDate" });
  }

  // Currency consistency
  if (
    lmt.Currency !== invoiceData.PaymentMeans.PayeeFinancialAccount.Currency
  ) {
    errors.push({
      message:
        "Currency mismatch between LegalMonetaryTotal and PayeeFinancialAccount",
    });
  }

  return errors;
}

async function validateInvoice(invoiceId) {
  // Step 1 - fetch invoice from DynamoDB
  const result = await db.send(
    new GetCommand({
      TableName: "Invoices",
      Key: { ID: invoiceId },
    }),
  );

  if (!result.Item) {
    throw createError(404, "Invoice not found");
  }

  const invoice = result.Item;

  // Step 2 - check invoice has been transformed
  if (invoice.status !== "transformed") {
    throw createError(
      400,
      "Invoice has not been transformed yet, call /transform first",
    );
  }

  // Step 3 - pull XML from S3
  const xmlString = await downloadXml(invoiceId);

  // Step 4 - check XML is well formed and parse once
  let xmlDoc;
  try {
    xmlDoc = libxmljs.parseXml(xmlString);
  } catch (e) {
    return {
      invoiceId,
      valid: false,
      errors: [{ message: `XML is not well formed: ${e.message}` }],
    };
  }

  // Step 5 - structural validation using parsed document
  const structureErrors = validateXmlStructure(xmlDoc);

  // Step 6 - business rule validation
  const businessErrors = validateBusinessRules(invoice.invoice_data);

  // Step 7 - combine all errors
  const allErrors = [...structureErrors, ...businessErrors];

  return {
    invoiceId,
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

export { validateInvoice };
