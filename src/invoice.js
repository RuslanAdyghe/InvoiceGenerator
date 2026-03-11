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
