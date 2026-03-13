import { uploadXml, getXmlUrl } from "../src/s3.js";
import toUBLXml from "../src/XmlConverter.js";

function validInvoice() {
  return {
    ProfileID: "Profile 1",
    IssueDate: "2024-01-15",
    DueDate: "2024-02-15",
    OrderReference: { ID: "ORD-001" },
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
    Supplier: { Name: "Stash Corp", ID: "SUP-001" },
    Customer: { Name: "Client Ltd", ID: "CUST-001" },
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

describe("S3 Tests", () => {
  const testInvoiceId = "test-invoice-123";
  let s3Key;

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
    console.log("Presigned URL:", url);
  });
});
