import { sendInvoiceEmail, sendEmail } from "../src/sendInvoice.js";
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
      Email:"umum2169@gmail.com"
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
  let testEmail;

  beforeAll(async () => {
    testEmail = `uniquetest+${Date.now()}@gmail.com`;
    const user = await createUser(testEmail, "password123", "Stash Corp");
    userId = user.userId;
    const invoice = await createInvoice(userId, validInvoice());
    invoiceId = invoice.invoiceId;
  });

  test("sends invoice email and returns success", async () => {
    const result = await sendInvoiceEmail(invoiceId);
    expect(result.success).toBe(true);
    expect(result.invoiceId).toBe(invoiceId);
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

  test("sends email without attachment", async () => {
    const result = await sendEmail({
      to: testEmail,
      subject: "Test",
      body: "Test body",
    });
    expect(result.success).toBe(true);
  }, 15000);

  test("sends email to customer when Customer.Email is provided", async () => {
    const invoiceWithCustomerEmail = await createInvoice(userId, {
      ...validInvoice(),
      Customer: {
        Name: "Client Ltd",
        ID: "CUST-001",
        Email: "umum2169@gmail.com",
      },
    });

    const result = await sendInvoiceEmail(invoiceWithCustomerEmail.invoiceId);
    expect(result.success).toBe(true);
    expect(result.invoiceId).toBe(invoiceWithCustomerEmail.invoiceId);
  }, 15000);
});