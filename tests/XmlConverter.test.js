import toUBLXml from "../src/XmlConverter";

function fullInvoice() {
  return {
    ProfileID: "Profile 1",
    IssueDate: "2024-01-15",
    DueDate: "2024-02-15",
    DocumentCurrencyCode: "EUR",

    OrderReference: {
      ID: "ORD-001",
    },

    Delivery: {
      ActualDeliveryDate: "2024-01-14",
      ActualDeliveryTime: "14:30:00",
    },

    PaymentMeans: {
      PaymentMeansCode: "30",
      PaymentDueDate: "2024-02-15",
      PayeeFinancialAccount: {
        ID: "GB29NWBK60161331926819",
        Name: "Stash Corp",
      },
    },

    Supplier: {
      Name: "Stash Corp",
      ID: "SUP-001",
      PostalAddress: {
        Country: "AU",
      },
    },

    Customer: {
      Name: "Client Ltd",
      ID: "CUST-001",
      PostalAddress: {
        Country: "AU",
      },
    },

    LegalMonetaryTotal: {
      Currency: "EUR",
      LineExtensionAmount: 1436.5,
      TaxExclusiveAmount: 1436.5,
      TaxInclusiveAmount: 1729,
      AllowanceTotalAmount: 100,
      ChargeTotalAmount: 100,
      PrepaidAmount: 1000,
      PayableAmount: 729,
    },
  };
}

describe("XmlConverter tests", () => {
  test("generates valid UBL XML with all fields", () => {
    const xml = toUBLXml(fullInvoice());
    expect(xml).toContain("<Invoice");
    expect(xml).toContain("<cbc:ProfileID>");
    expect(xml).toContain("<cbc:IssueDate>");
    expect(xml).toContain("<cbc:DueDate>");
    expect(xml).toContain("<cac:OrderReference>");
    expect(xml).toContain("<cac:Delivery>");
    expect(xml).toContain("<cac:PaymentMeans>");
    expect(xml).toContain("<cac:AccountingSupplierParty>");
    expect(xml).toContain("<cac:AccountingCustomerParty>");
    expect(xml).toContain("<cac:LegalMonetaryTotal>");
  });

  test("generates XML without optional ActualDeliveryTime", () => {
    const invoice = fullInvoice();
    delete invoice.Delivery.ActualDeliveryTime;
    const xml = toUBLXml(invoice);
    expect(xml).toContain("<cbc:ActualDeliveryDate>");
    expect(xml).not.toContain("<cbc:ActualDeliveryTime>");
  });

  test("generates XML without optional PaymentDueDate", () => {
    const invoice = fullInvoice();
    delete invoice.PaymentMeans.PaymentDueDate;
    const xml = toUBLXml(invoice);
    expect(xml).toContain("<cbc:PaymentMeansCode>");
    expect(xml).not.toContain("<cbc:PaymentDueDate>");
  });

  test("generates XML without optional Supplier ID", () => {
    const invoice = fullInvoice();
    delete invoice.Supplier.ID;
    const xml = toUBLXml(invoice);
    expect(xml).toContain("<cac:AccountingSupplierParty>");
    expect(xml).toContain("Stash Corp");
  });

  test("generates XML without optional Customer ID", () => {
    const invoice = fullInvoice();
    delete invoice.Customer.ID;
    const xml = toUBLXml(invoice);
    expect(xml).toContain("<cac:AccountingCustomerParty>");
    expect(xml).toContain("Client Ltd");
  });

  test("generates XML without optional AllowanceTotalAmount", () => {
    const invoice = fullInvoice();
    delete invoice.LegalMonetaryTotal.AllowanceTotalAmount;
    const xml = toUBLXml(invoice);
    expect(xml).not.toContain("<cbc:AllowanceTotalAmount>");
    expect(xml).toContain("<cbc:PayableAmount currencyID=");
  });

  test("generates XML without optional ChargeTotalAmount", () => {
    const invoice = fullInvoice();
    delete invoice.LegalMonetaryTotal.ChargeTotalAmount;
    const xml = toUBLXml(invoice);
    expect(xml).not.toContain("<cbc:ChargeTotalAmount>");
    expect(xml).toContain("<cbc:PayableAmount currencyID=");
  });

  test("generates XML without optional PrepaidAmount", () => {
    const invoice = fullInvoice();
    delete invoice.LegalMonetaryTotal.PrepaidAmount;
    const xml = toUBLXml(invoice);
    expect(xml).not.toContain("<cbc:PrepaidAmount>");
    expect(xml).toContain("<cbc:PayableAmount currencyID=");
  });

  test("generates XML with all optional LegalMonetaryTotal fields absent", () => {
    const invoice = fullInvoice();
    delete invoice.LegalMonetaryTotal.AllowanceTotalAmount;
    delete invoice.LegalMonetaryTotal.ChargeTotalAmount;
    delete invoice.LegalMonetaryTotal.PrepaidAmount;
    const xml = toUBLXml(invoice);
    expect(xml).toContain("<cbc:LineExtensionAmount");
    expect(xml).toContain("<cbc:PayableAmount");
  });
});
