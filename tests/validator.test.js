import validateSchema from "../src/validator.js";

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

describe("Input Validation Tests", () => {
  test("accepts a valid invoice object", () => {
    const result = validateSchema(validInvoice());
    console.log(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid invoice as a JSON string", () => {
    const result = validateSchema(JSON.stringify(validInvoice()));
    console.log(result.errors);
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
