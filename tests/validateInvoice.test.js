import { validateInvoice } from "../src/validateInvoice";
import { createInvoice, transformInvoice } from "../src/invoice";

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
            Currency: "EUR",
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

describe("Validate Invoice tests", () => {
    let invoiceId;

    beforeAll(async () => {
        // Create and transform invoice before running validate tests
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
        // Create a fresh invoice without transforming it
        const untransformed = await createInvoice(
            "18eebbc2-8162-4bdd-b272-dd47dc81e7a8",
            validInvoice(),
        );
        
        await expect(validateInvoice(untransformed.invoiceId)).rejects.toMatchObject({
            status: 400,
            message: "Invoice has not been transformed yet, call /transform first",
        });
    });
});

