import { sendInvoiceEmail } from "../src/sendInvoice.js";
import { createInvoice } from "../src/invoice.js";
import { createUser } from "../src/auth.js";

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
        Currency: "AUD",
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
      Currency: "AUD",
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

describe("Send Invoice Email Tests", () => {
  let invoiceId;
  let userId;

  beforeAll(async () => {
    const user = await createUser("testerinvoice443@gmail.com", "Stash Corp");
    userId = user.id;

    const invoice = await createInvoice(userId, validInvoice());
    invoiceId = invoice.invoiceId;
  });

  test("sends invoice email and returns success", async () => {
    const result = await sendInvoiceEmail(invoiceId);
    expect(result.success).toBe(true);
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.to).toBe("testerinvoice443@gmail.com");
    expect(result.messageId).toBeDefined();
  }, 15000);

  test("throws an error for a non-existent invoice", async () => {
    await expect(sendInvoiceEmail("non-existent-id")).rejects.toMatchObject({
      status: 404,
      message: "Invoice not found",
    });
  });

  test("throws an error when invoiceId is missing", async () => {
    await expect(sendInvoiceEmail()).rejects.toThrow("invoiceId is required");
  });
});