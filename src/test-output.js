import { writeFileSync } from "fs";
import toUBLXml from "./invoice.js";

const invoice = {
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
      Currency: "EUR",
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

const xml = toUBLXml(invoice);
writeFileSync("output.xml", xml, "utf8");
console.log("Written to output.xml");
