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
    frag
      .first()
      .ele("cbc:ActualDeliveryTime")
      .txt(delivery.ActualDeliverytime)
      .up();
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
    frag
      .first()
      .ele("cbc:PaymentDueDate")
      .txt(paymentMeans.PaymentDueDate)
      .up();
  }

  frag
    .first()
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

  return fragment()
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
    .up()
    .ele("cbc:AllowanceTotalAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.AllowanceTotalAmount)
    .up()
    .ele("cbc:ChargeTotalAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.ChargeTotalAmount)
    .up()
    .ele("cbc:PrepaidAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.PrepaidAmount)
    .up()
    .ele("cbc:PayableAmount")
    .att("currencyID", currency)
    .txt(legalMonetaryTotal.PayableAmount)
    .up()
    .up();
}

function toUBLXml(invoice) {
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

export function transformInvoice(invoiceId) {
  const data = getData();
  const invoice = data.invoices.find((inv) => inv.invoiceId === invoiceId);

  if (!invoice) {
    throw HTTPError(404, "Invoice not found");
  }

  const validationResult = validateSchema(invoice);
  if (!validationResult.valid) {
    throw HTTPError(400, "Invoice data cannot be transformed into UBL XML");
  }

  try {
    const invoiceXml = toUBLXml(invoice);

    return {
      invoiceId,
      status: "transformed",
      invoiceXml
    }
  } catch (error) {
    throw HTTPError(500, "Unexpected system failure");
  }
}

export default toUBLXml;
