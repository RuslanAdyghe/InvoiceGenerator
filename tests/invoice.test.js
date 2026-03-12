import { create } from "xmlbuilder2";
import {
  createInvoice,
  getInvoiceById,
  getInvoicesByUserId,
} from "../src/invoice";

function validInvoice() {
  return {
    ProfileID: "Profile 1",
    IssueDate: "2024-01-15",
    DueDate: "2024-02-15",

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
        Currency: "JOD",
      },
    },

    Supplier: {
      Name: "Stash Corp",
      ID: "SUP-001",
    },

    Customer: {
      Name: "Client Ltd",
      ID: "CUST-001",
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

describe("DynamoDB Invoice tests", () => {
  let invoiceId;

  test("Creates an Invoice", async () => {
    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    expect(invoice.id).toBeDefined();
    invoiceId = invoice.id;
  });

  test("gets invoice by ID", async () => {
    const invoice = await getInvoiceById(invoiceId);
    console.log("Invoice by ID:", JSON.stringify(invoice, null, 2));
    expect(invoice).toBeDefined();
    expect(invoice.ID).toBe(invoiceId);
  });

  test("gets invoices by user ID", async () => {
    const invoices = await getInvoicesByUserId(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
    );
    console.log("Invoices by user ID:", JSON.stringify(invoices, null, 2));
    expect(invoices).toBeDefined();
    expect(invoices.length).toBeGreaterThan(0);
  });
});
