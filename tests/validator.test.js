import validateSchema from "../src/validator.js";

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

describe("Input Validation Tests", () => {
  test("accepts a valid invoice object", () => {
    const result = validateSchema(validInvoice());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid invoice as a JSON string", () => {
    const result = validateSchema(JSON.stringify(validInvoice()));
    expect(result.valid).toBe(true);
  });

  test("rejects invalid JSON string", () => {
    const result = validateSchema("this is not json");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Invalid JSON");
  });

  test("rejects invoice missing required fields", () => {
    const result = validateSchema({ ProfileID: "Profile 1" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("rejects invoice with invalid date format", () => {
    const invoice = validInvoice();
    invoice.IssueDate = "not-a-date";
    const result = validateSchema(invoice);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
