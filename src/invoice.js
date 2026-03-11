import { create, fragment } from "xmlbuilder2";

function orderReferenceFragment(OrderReference) {
  return fragment()
    .ele("cac:OrderReference")
    .ele("cbc:ID")
    .txt(orderReference.ID)
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
    (frag
      .first()
      .ele("cbc:ActualDeliveryTime")
      .txt(delivery.ActualDeliverytime),
      up());
  }
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
  const frag = fragment().ele("cac:AccountingSupplierParty").ele("cac:Party");

  if (supplier.ID) {
    frag.first().first().ele("cbc:EndpointID").txt(supplier.ID).up();
  }

  frag
    .first()
    .first()
    .ele("cac:PartyName")
    .ele("cbc:Name")
    .txt(supplier.Name)
    .up()
    .up();

  return frag;
}

function customerFragment(customer) {
  const frag = fragment().ele("cac:AccountingCustomerParty").ele("cac:Party");

  if (customer.ID) {
    frag.first().first().ele("cbc:CustomerID").txt(customer.ID).up();
  }

  frag
    .first()
    .first()
    .ele("cac:PartyName")
    .ele("cbc:Name")
    .txt(customer.Name)
    .up()
    .up();

  return frag;
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

function legalMonetaryTotalFragment(LegalMonetaryTotal) {
  const frag = fragment().ele("LegalMonetaryTotal");
}
