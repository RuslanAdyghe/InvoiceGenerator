import { create, fragment } from "xmlbuilder2";

function orderReferenceFragment(OrderReference) {
  return fragment()
    .ele("cac:OrderReference")
    .ele("cbc:ID")
    .txt(OrderReference.ID)
    .up()
    .up();
}

function deliveryFragment(delivery) {
  const frag = fragment()
    .ele("cac:Delivery")
    .ele("cbc:ActualDeliveryDate")
    .txt(delivery.ActualDeliveryDate)
    .up();

  if (delivery.ActualDeliveryTime) {
    frag.ele("cbc:ActualDeliveryTime").txt(delivery.ActualDeliveryTime).up();
  }

  return frag;
}

function paymentMeansFragment(paymentMeans) {
  const pfa = paymentMeans.PayeeFinancialAccount;

  const frag = fragment()
    .ele("cac:PaymentMeans")
    .ele("cbc:PaymentMeansCode")
    .txt(paymentMeans.PaymentMeansCode)
    .up();

  if (paymentMeans.PaymentDueDate) {
    frag.ele("cbc:PaymentDueDate").txt(paymentMeans.PaymentDueDate).up();
  }

  frag
    .ele("cac:PayeeFinancialAccount")
    .ele("cbc:ID")
    .txt(pfa.ID)
    .up()
    .ele("cbc:Name")
    .txt(pfa.Name)
    .up()
    .ele("cbc:CurrencyCode")
    .att("currencyID", pfa.Currency)
    .txt(pfa.Currency)
    .up()
    .up();

  return frag;
}

function supplierFragment(supplier) {
  const party = fragment().ele("cac:AccountingSupplierParty").ele("cac:Party");

  if (supplier.ID) {
    party.ele("cbc:EndpointID").txt(supplier.ID).up();
  }

  party.ele("cac:PartyName").ele("cbc:Name").txt(supplier.Name).up().up();

  return party.up().up();
}

function customerFragment(customer) {
  const party = fragment().ele("cac:AccountingCustomerParty").ele("cac:Party");

  if (customer.ID) {
    party.ele("cbc:EndpointID").txt(customer.ID).up();
  }

  party.ele("cac:PartyName").ele("cbc:Name").txt(customer.Name).up().up();

  return party.up().up();
}

function legalMonetaryTotalFragment(legalMonetaryTotal) {
  const { Currency: currency } = legalMonetaryTotal;

  const frag = fragment()
    .ele("cac:LegalMonetaryTotal")
    .ele("cbc:LineExtensionAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.LineExtensionAmount)
    .up()
    .ele("cbc:TaxExclusiveAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.TaxExclusiveAmount)
    .up()
    .ele("cbc:TaxInclusiveAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.TaxInclusiveAmount)
    .up();

  if (legalMonetaryTotal.AllowanceTotalAmount !== undefined) {
    frag
      .ele("cbc:AllowanceTotalAmount")
      .att("currencyID", currency)
      .txt(legalMonetaryTotal.AllowanceTotalAmount)
      .up();
  }

  if (legalMonetaryTotal.ChargeTotalAmount !== undefined) {
    frag
      .ele("cbc:ChargeTotalAmount")
      .att("currencyID", currency)
      .txt(legalMonetaryTotal.ChargeTotalAmount)
      .up();
  }

  if (legalMonetaryTotal.PrepaidAmount !== undefined) {
    frag
      .ele("cbc:PrepaidAmount")
      .att("currencyID", currency)
      .txt(legalMonetaryTotal.PrepaidAmount)
      .up();
  }

  frag
    .ele("cbc:PayableAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.PayableAmount)
    .up()
    .up();

  return frag;
}

function toUBLXmlV1(invoice) {
  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("Invoice", {
    xmlns: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    "xmlns:cac":
      "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "xmlns:cbc":
      "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  });

  // Top level fields
  root.ele("cbc:ProfileID").txt(invoice.ProfileID).up();
  root.ele("cbc:IssueDate").txt(invoice.IssueDate).up();
  root.ele("cbc:DueDate").txt(invoice.DueDate).up();

  // Sections
  root.import(orderReferenceFragment(invoice.OrderReference));
  root.import(deliveryFragment(invoice.Delivery));
  root.import(paymentMeansFragment(invoice.PaymentMeans));
  root.import(supplierFragment(invoice.Supplier));
  root.import(customerFragment(invoice.Customer));
  root.import(legalMonetaryTotalFragment(invoice.LegalMonetaryTotal));

  return root.doc().end({ prettyPrint: true });
}
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

async function validateInvoiceV1(invoiceId) {
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

async function transformInvoiceV1(invoiceId) {
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
    await db.send(
      new UpdateCommand({
        TableName: "Invoices",
        Key: { ID: invoiceId },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "transformed" },
      }),
    );

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

export { validateInvoiceV1, toUBLXmlV1, transformInvoiceV1 };
