import {
  createInvoice,
  getInvoiceById,
  getInvoicesByUserId,
  transformInvoice,
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

  beforeAll(async () => {
    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    invoiceId = invoice.invoiceId;
  });

  test("gets invoice by ID", async () => {
    const invoice = await getInvoiceById(invoiceId);
    expect(invoice).toBeDefined();
    expect(invoice.ID).toBe(invoiceId);
  });

  test("gets invoices by user ID", async () => {
    const invoices = await getInvoicesByUserId(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
    );
    expect(invoices).toBeDefined();
    expect(invoices.length).toBeGreaterThan(0);
  });

  test("transforms an invoice into UBL XML", async () => {
    const result = await transformInvoice(invoiceId);
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.status).toBe("transformed");
    expect(result.invoiceXml).toContain("<Invoice");
  });

  test("transformInvoice throws 404 for an invalid invoiceId", async () => {
    await expect(transformInvoice("non-existent-id")).rejects.toMatchObject({
      status: 404,
      message: "Invoice not found",
    });
  });

  test("transformed XML contains correct invoice data", async () => {
    const fresh = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    const result = await transformInvoice(fresh.invoiceId);
    expect(result.invoiceXml).toContain("<cbc:ProfileID>");
    expect(result.invoiceXml).toContain("<cbc:IssueDate>");
    expect(result.invoiceXml).toContain("<cac:AccountingSupplierParty>");
  });
});

describe("createInvoice validation tests", () => {
  test("throws 400 when userId is missing", async () => {
    await expect(createInvoice(null, validInvoice())).rejects.toMatchObject({
      status: 400,
      message: "userId and invoiceData are required",
    });
  });

  test("throws 400 when invoiceData is missing", async () => {
    await expect(
      createInvoice("18eebbc2-8162-4bdd-b272-dd47dc81e7a8", null),
    ).rejects.toMatchObject({
      status: 400,
      message: "userId and invoiceData are required",
    });
  });

  test("throws 400 when both userId and invoiceData are missing", async () => {
    await expect(createInvoice(null, null)).rejects.toMatchObject({
      status: 400,
      message: "userId and invoiceData are required",
    });
  });

  test("returns invoiceId and status on success", async () => {
    const result = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    expect(result.invoiceId).toBeDefined();
    expect(result.status).toBe("created");
  });
});

describe("getInvoiceById validation tests", () => {
  test("throws 404 for non existent invoice", async () => {
    await expect(getInvoiceById("non-existent-id")).rejects.toMatchObject({
      status: 404,
      message: "Invoice not found",
    });
  });
});

describe("transformInvoice validation tests", () => {
  test("throws 500 when invoice data cannot be transformed", async () => {
    const invoice = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      { invalid: "data" },
    );
    await expect(transformInvoice(invoice.invoiceId)).rejects.toMatchObject({
      status: 500,
      message: "Failed to transform invoice",
    });
  });
});
