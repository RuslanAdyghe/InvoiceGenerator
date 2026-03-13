import libxmljs from "libxmljs2";
import { readFileSync } from "fs";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import createError from "http-errors";
import db from "./db.js";
import { downloadXml } from "./s3.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load XSD schemas once at startup
const invoiceXsd = readFileSync(join(__dirname, "schemas/xsd/maindoc/UBL-Invoice-2.4.xsd"), "utf8");

const xsdDoc = libxmljs.parseXml(invoiceXsd);

function validateBusinessRules(invoiceData) {
    const errors = [];
    const lmt = invoiceData.LegalMonetaryTotal;

    // TaxInclusiveAmount should be greater than TaxExclusiveAmount
    if (lmt.TaxInclusiveAmount <= lmt.TaxExclusiveAmount) {
        errors.push({ message: "TaxInclusiveAmount must be greater than TaxExclusiveAmount" });
    }

    // PayableAmount check
    let expectedPayable = lmt.TaxInclusiveAmount;
    if (lmt.PrepaidAmount) {
        expectedPayable = lmt.TaxInclusiveAmount - lmt.PrepaidAmount;
    }

    if (Math.abs(lmt.PayableAmount - expectedPayable) > 0.01) {
        errors.push({ message: `PayableAmount ${lmt.PayableAmount} does not match expected ${expectedPayable}` });
    }

    // DueDate should not be before IssueDate
    if (new Date(invoiceData.DueDate) < new Date(invoiceData.IssueDate)) {
        errors.push({ message: "DueDate cannot be before IssueDate" });
    }

    // Currency consistency
    if (lmt.Currency !== invoiceData.PaymentMeans.PayeeFinancialAccount.Currency) {
        errors.push({ message: "Currency mismatch between LegalMonetaryTotal and PayeeFinancialAccount" });
    }

    return errors;
}

async function validateInvoice(invoiceId) {
    // Step 1 - fetch invoice from DynamoDB
    const result = await db.send(
        new GetCommand({
            TableName: "Invoices",
            Key: { ID: invoiceId },
        })
    );

    if (!result.Item) {
        throw createError(404, "Invoice not found");
    }

    const invoice = result.Item;

    // Step 2 - check invoice has been transformed
    if (invoice.status !== "transformed") {
        throw createError(400, "Invoice has not been transformed yet, call /transform first");
    }

    // Step 3 - pull XML from S3
    const xmlString = await downloadXml(invoiceId);

    // Step 4 - XSD validation
    const xmlDoc = libxmljs.parseXml(xmlString);
    const xsdValid = xmlDoc.validate(xsdDoc);
    const xsdErrors = xmlDoc.validationErrors.map((e) => ({
        message: e.message.trim(),
    }));

    // Step 5 - business rule validation
    const businessErrors = validateBusinessRules(invoice.invoice_data);

    // Step 6 - combine all errors
    const allErrors = [...xsdErrors, ...businessErrors];

    return {
        invoiceId,
        valid: allErrors.length === 0,
        errors: allErrors,
    };
}

export { validateInvoice }