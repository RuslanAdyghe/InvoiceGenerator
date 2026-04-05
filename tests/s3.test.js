import { uploadXml, getXmlUrl } from "../src/s3.js";
import toUBLXml from "../src/XmlConverter.js";
import { createInvoice, transformInvoice } from "../src/invoice.js";

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

describe("S3 Tests", () => {
  let testInvoiceId = "test-invoice-123";
  let dynamoInvoiceId;
  let s3Key;

  beforeAll(async () => {
    const result = await createInvoice(
      "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
      validInvoice(),
    );
    dynamoInvoiceId = result.invoiceId;
  });

  test("uploads UBL XML to S3", async () => {
    const xml = toUBLXml(validInvoice());
    s3Key = await uploadXml(testInvoiceId, xml);
    expect(s3Key).toBe(`invoices/${testInvoiceId}.xml`);
  });

  test("generates a presigned URL for the uploaded XML", async () => {
    const url = await getXmlUrl(s3Key);
    expect(url).toBeDefined();
    expect(url).toContain("invoicegenerator-xml");
    expect(url).toContain(testInvoiceId);
  });

  test("gets presigned URL for existing invoice from DynamoDB", async () => {
    await transformInvoice(dynamoInvoiceId);
    const url = await getXmlUrl(`invoices/${dynamoInvoiceId}.xml`);
    expect(url).toBeDefined();
  });
});
