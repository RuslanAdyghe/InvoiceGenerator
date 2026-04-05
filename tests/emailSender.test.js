import { sendInvoiceEmail, sendEmail } from "../src/sendInvoice.js";
import { createInvoice, transformInvoice } from "../src/invoice.js";
import { createUser } from "../src/auth.js";

function validInvoice() {
  return {
    ProfileID: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    IssueDate: "2024-01-15",
    DueDate: "2024-02-15",
    DocumentCurrencyCode: "AUD",

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
        ID: "062-001-12345678",
        Name: "Stash Corp",
      },
    },

    Supplier: {
      Name: "Stash Corp",
      TradingName: "Stash",
      PostalAddress: {
        StreetName: "123 George Street",
        CityName: "Sydney",
        PostalZone: "2000",
        CountrySubentity: "NSW",
        Country: "AU",
      },
      Contact: {
        Name: "Jane Smith",
        Telephone: "+61 2 9000 0000",
        ElectronicMail: "jane@stashcorp.com.au",
      },
    },

    Customer: {
      Name: "Client Ltd",
      TradingName: "Client",
      Email: "umum2169@gmail.com", // ← add this
      PostalAddress: {
        StreetName: "456 Collins Street",
        CityName: "Melbourne",
        PostalZone: "3000",
        CountrySubentity: "VIC",
        Country: "AU",
      },
      Contact: {
        Name: "John Doe",
        Telephone: "+61 3 9000 0000",
        ElectronicMail: "john@clientltd.com.au",
      },
    },

    LegalMonetaryTotal: {
      Currency: "AUD",
      LineExtensionAmount: 1000,
      TaxExclusiveAmount: 1000,
      TaxInclusiveAmount: 1100,
      AllowanceTotalAmount: 0,
      ChargeTotalAmount: 0,
      PrepaidAmount: 0,
      PayableAmount: 1100,
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
    await transformInvoice(invoiceId); // ← add this
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
        PostalAddress: { Country: "AU" },
      },
    });
    await transformInvoice(invoiceWithCustomerEmail.invoiceId);
    const result = await sendInvoiceEmail(invoiceWithCustomerEmail.invoiceId);
    expect(result.success).toBe(true);
    expect(result.invoiceId).toBe(invoiceWithCustomerEmail.invoiceId);
  }, 15000);
});
