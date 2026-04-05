import { validateInvoice } from "../src/validateInvoice";
import { createInvoice, transformInvoice } from "../src/invoice";

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

describe("Validate Invoice tests", () => {
  let invoiceId;

  beforeAll(async () => {
    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    invoiceId = invoice.invoiceId;
    await transformInvoice(invoiceId);
  });

  test("validates a valid transformed invoice successfully", async () => {
    const result = await validateInvoice(invoiceId);
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("returns invoiceId in response", async () => {
    const result = await validateInvoice(invoiceId);
    expect(result.invoiceId).toBeDefined();
    expect(result.invoiceId).toBe(invoiceId);
  });

  test("returns errors array in response", async () => {
    const result = await validateInvoice(invoiceId);
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
  });

  test("throws 404 for non existent invoiceId", async () => {
    await expect(validateInvoice("non-existent-id")).rejects.toMatchObject({
      status: 404,
      message: "Invoice not found",
    });
  });

  test("throws 400 if invoice has not been transformed", async () => {
    const untransformed = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    await expect(
      validateInvoice(untransformed.invoiceId),
    ).rejects.toMatchObject({
      status: 400,
      message: "Invoice has not been transformed yet, call /transform first",
    });
  });
});

describe("Business rule validation tests", () => {
  let invoiceId;

  beforeAll(async () => {
    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    invoiceId = invoice.invoiceId;
    await transformInvoice(invoiceId);
  });

  test("returns error when TaxInclusiveAmount is less than TaxExclusiveAmount", async () => {
    const badInvoice = validInvoice();
    badInvoice.LegalMonetaryTotal.TaxInclusiveAmount = 100;
    badInvoice.LegalMonetaryTotal.TaxExclusiveAmount = 200;
    badInvoice.LegalMonetaryTotal.PayableAmount = 100;

    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      badInvoice,
    );
    await transformInvoice(invoice.invoiceId);
    const result = await validateInvoice(invoice.invoiceId);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("TaxInclusiveAmount")),
    ).toBe(true);
  });

  test("returns error when PayableAmount is incorrect", async () => {
    const badInvoice = validInvoice();
    badInvoice.LegalMonetaryTotal.PayableAmount = 999;

    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      badInvoice,
    );
    await transformInvoice(invoice.invoiceId);
    const result = await validateInvoice(invoice.invoiceId);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("PayableAmount"))).toBe(
      true,
    );
  });

  test("returns error when DueDate is before IssueDate", async () => {
    const badInvoice = validInvoice();
    badInvoice.IssueDate = "2024-06-01";
    badInvoice.DueDate = "2024-01-01";

    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      badInvoice,
    );
    await transformInvoice(invoice.invoiceId);
    const result = await validateInvoice(invoice.invoiceId);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("DueDate"))).toBe(true);
  });

  test("returns error when currency is inconsistent", async () => {
    const badInvoice = validInvoice();
    badInvoice.LegalMonetaryTotal.Currency = "USD";
    badInvoice.DocumentCurrencyCode = "EUR";

    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      badInvoice,
    );
    await transformInvoice(invoice.invoiceId);
    const result = await validateInvoice(invoice.invoiceId);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("Currency mismatch")),
    ).toBe(true);
  });
});
