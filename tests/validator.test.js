import validateSchema from "../src/validator.js";

function validInvoice() { // valid invoice example
  return {
    ProfileID: "Profile 1",
    IssueDate: "2024-01-15",
    DueDate: "2024-02-15",
    OrderReference: { ID: "ORD-001" },
    Delivery: {
      ActualDeliveryDate: "2024-01-14",
      ActualDeliveryTime: "14:30:00"
    },
    PaymentMeans: {
      PaymentMeansCode: "30",
      PayeeFinancialAccount: {
        ID: "GB29NWBK60161331926819",
        Name: "Stash Corp",
        Currency: "JOD"
      }
    }
  };
}

describe('Input Validation Tests', () => {

    test("accepts a valid invoice object", () => {
    const result = validateSchema(validInvoice());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid invoice as a JSON string", () => {
    const result = validateSchema(JSON.stringify(validInvoice()));
    expect(result.valid).toBe(true);
  });
});