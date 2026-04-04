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

  if (supplier.EndpointID) {
    party.ele("cbc:EndpointID").txt(supplier.EndpointID).up();
  }

  if (supplier.TradingName) {
    party
      .ele("cac:PartyName")
      .ele("cbc:Name")
      .txt(supplier.TradingName)
      .up()
      .up();
  }

  party
    .ele("cac:PartyLegalEntity")
    .ele("cbc:RegistrationName")
    .txt(supplier.Name)
    .up()
    .up();

  if (supplier.ID) {
    party
      .ele("cac:PartyIdentification")
      .ele("cbc:ID")
      .txt(supplier.ID)
      .up()
      .up();
  }

  if (supplier.PostalAddress) {
    const addr = party.ele("cac:PostalAddress");
    if (supplier.PostalAddress.StreetName)
      addr.ele("cbc:StreetName").txt(supplier.PostalAddress.StreetName).up();
    if (supplier.PostalAddress.AdditionalStreetName)
      addr
        .ele("cbc:AdditionalStreetName")
        .txt(supplier.PostalAddress.AdditionalStreetName)
        .up();
    if (supplier.PostalAddress.CityName)
      addr.ele("cbc:CityName").txt(supplier.PostalAddress.CityName).up();
    if (supplier.PostalAddress.PostalZone)
      addr.ele("cbc:PostalZone").txt(supplier.PostalAddress.PostalZone).up();
    if (supplier.PostalAddress.CountrySubentity)
      addr
        .ele("cbc:CountrySubentity")
        .txt(supplier.PostalAddress.CountrySubentity)
        .up();
    addr
      .ele("cac:Country")
      .ele("cbc:IdentificationCode")
      .txt(supplier.PostalAddress.Country)
      .up()
      .up();
    addr.up();
  }

  return party.up().up();
}

function customerFragment(customer) {
  const party = fragment().ele("cac:AccountingCustomerParty").ele("cac:Party");

  if (customer.EndpointID) {
    party.ele("cbc:EndpointID").txt(customer.EndpointID).up();
  }

  if (customer.TradingName) {
    party
      .ele("cac:PartyName")
      .ele("cbc:Name")
      .txt(customer.TradingName)
      .up()
      .up();
  }

  party
    .ele("cac:PartyLegalEntity")
    .ele("cbc:RegistrationName")
    .txt(customer.Name)
    .up()
    .up();

  if (customer.ID) {
    party
      .ele("cac:PartyIdentification")
      .ele("cbc:ID")
      .txt(customer.ID)
      .up()
      .up();
  }

  if (customer.PostalAddress) {
    const addr = party.ele("cac:PostalAddress");
    if (customer.PostalAddress.StreetName)
      addr.ele("cbc:StreetName").txt(customer.PostalAddress.StreetName).up();
    if (customer.PostalAddress.AdditionalStreetName)
      addr
        .ele("cbc:AdditionalStreetName")
        .txt(customer.PostalAddress.AdditionalStreetName)
        .up();
    if (customer.PostalAddress.CityName)
      addr.ele("cbc:CityName").txt(customer.PostalAddress.CityName).up();
    if (customer.PostalAddress.PostalZone)
      addr.ele("cbc:PostalZone").txt(customer.PostalAddress.PostalZone).up();
    if (customer.PostalAddress.CountrySubentity)
      addr
        .ele("cbc:CountrySubentity")
        .txt(customer.PostalAddress.CountrySubentity)
        .up();
    addr
      .ele("cac:Country")
      .ele("cbc:IdentificationCode")
      .txt(customer.PostalAddress.Country)
      .up()
      .up();
    addr.up();
  }

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

function toUBLXml(invoice) {
  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("Invoice", {
    xmlns: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    "xmlns:cac":
      "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "xmlns:cbc":
      "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  });

  // Top level fields
  root.ele("cbc:ID").txt(invoice.InvoiceID).up();
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

export default toUBLXml;
