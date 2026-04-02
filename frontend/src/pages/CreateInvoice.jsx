import { useState } from "react";
import NavBar from "../components/NavBar";

export default function CreateInvoice() {
  const [invoiceXml, setInvoiceXml] = useState("");
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);

  const [formData, setFormData] = useState({
    ProfileID: "",
    IssueDate: "",
    DueDate: "",
    OrderReference: { ID: "" },
    Delivery: { ActualDeliveryDate: "", ActualDeliveryTime: "" },
    PaymentMeans: {
      PaymentMeansCode: "",
      PaymentDueDate: "",
      PayeeFinancialAccount: { ID: "", Name: "", Currency: "" },
    },
    Supplier: { Name: "", ID: "" },
    Customer: { Name: "", ID: "" },
    LegalMonetaryTotal: {
      Currency: "",
      LineExtensionAmount: 0,
      TaxExclusiveAmount: 0,
      TaxInclusiveAmount: 0,
      AllowanceTotalAmount: 0,
      ChargeTotalAmount: 0,
      PrepaidAmount: 0,
      PayableAmount: 0,
    },
  });

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("http://localhost:3000/invoices/extract", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to extract invoice data");
        return;
      }

      // Merge extracted data into formData
      setFormData((prev) => ({
        ...prev,
        ...data.invoiceData,
      }));
    } catch (err) {
      setError("Failed to extract invoice data");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    const userId = localStorage.getItem("userId");

    try {
      const response = await fetch("http://localhost:3000/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, invoiceData: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      const transformResponse = await fetch(
        `http://localhost:3000/invoices/${data.invoiceId}/transform`,
        { method: "POST" },
      );

      const transformData = await transformResponse.json();

      if (!transformResponse.ok) {
        setError(transformData.error || "Failed to transform invoice");
        return;
      }

      setInvoiceXml(transformData.invoiceXml);
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  const inputClass = "border border-gray-300 rounded-md p-2 w-full mb-3";

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <section className="mb-8 text-center">
            <p className="text-sm text-gray-400 mb-1">Invoice Management</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Create Invoice
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the details below to generate a new invoice
            </p>
          </section>

          {/* AI Extractor */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Autofill from PDF or CSV
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload an existing invoice and we'll extract the fields for you to
              review
            </p>
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {extracting && (
              <p className="text-sm text-purple-500 mt-3 animate-pulse">
                Extracting invoice data...
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              General
            </h2>
            <input
              className={inputClass}
              placeholder="Profile ID"
              value={formData.ProfileID}
              onChange={(e) => handleChange("ProfileID", e.target.value)}
            />
            <input
              className={inputClass}
              type="date"
              placeholder="Issue Date"
              value={formData.IssueDate}
              onChange={(e) => handleChange("IssueDate", e.target.value)}
            />
            <input
              className={inputClass}
              type="date"
              placeholder="Due Date"
              value={formData.DueDate}
              onChange={(e) => handleChange("DueDate", e.target.value)}
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Order Reference
            </h2>
            <input
              className={inputClass}
              placeholder="Order ID"
              value={formData.OrderReference.ID}
              onChange={(e) =>
                handleChange("OrderReference.ID", e.target.value)
              }
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Delivery
            </h2>
            <input
              className={inputClass}
              type="date"
              placeholder="Actual Delivery Date"
              value={formData.Delivery.ActualDeliveryDate}
              onChange={(e) =>
                handleChange("Delivery.ActualDeliveryDate", e.target.value)
              }
            />
            <input
              className={inputClass}
              placeholder="Actual Delivery Time (HH:MM:SS)"
              value={formData.Delivery.ActualDeliveryTime}
              onChange={(e) =>
                handleChange("Delivery.ActualDeliveryTime", e.target.value)
              }
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Means
            </h2>
            <input
              className={inputClass}
              placeholder="Payment Means Code"
              value={formData.PaymentMeans.PaymentMeansCode}
              onChange={(e) =>
                handleChange("PaymentMeans.PaymentMeansCode", e.target.value)
              }
            />
            <input
              className={inputClass}
              type="date"
              placeholder="Payment Due Date"
              value={formData.PaymentMeans.PaymentDueDate}
              onChange={(e) =>
                handleChange("PaymentMeans.PaymentDueDate", e.target.value)
              }
            />
            <input
              className={inputClass}
              placeholder="Financial Account ID"
              value={formData.PaymentMeans.PayeeFinancialAccount.ID}
              onChange={(e) =>
                handleChange(
                  "PaymentMeans.PayeeFinancialAccount.ID",
                  e.target.value,
                )
              }
            />
            <input
              className={inputClass}
              placeholder="Financial Account Name"
              value={formData.PaymentMeans.PayeeFinancialAccount.Name}
              onChange={(e) =>
                handleChange(
                  "PaymentMeans.PayeeFinancialAccount.Name",
                  e.target.value,
                )
              }
            />
            <input
              className={inputClass}
              placeholder="Currency"
              value={formData.PaymentMeans.PayeeFinancialAccount.Currency}
              onChange={(e) =>
                handleChange(
                  "PaymentMeans.PayeeFinancialAccount.Currency",
                  e.target.value,
                )
              }
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Supplier
            </h2>
            <input
              className={inputClass}
              placeholder="Supplier Name"
              value={formData.Supplier.Name}
              onChange={(e) => handleChange("Supplier.Name", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Supplier ID"
              value={formData.Supplier.ID}
              onChange={(e) => handleChange("Supplier.ID", e.target.value)}
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Customer
            </h2>
            <input
              className={inputClass}
              placeholder="Customer Name"
              value={formData.Customer.Name}
              onChange={(e) => handleChange("Customer.Name", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Customer ID"
              value={formData.Customer.ID}
              onChange={(e) => handleChange("Customer.ID", e.target.value)}
            />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Legal Monetary Total
            </h2>
            <input
              className={inputClass}
              placeholder="Currency"
              value={formData.LegalMonetaryTotal.Currency}
              onChange={(e) =>
                handleChange("LegalMonetaryTotal.Currency", e.target.value)
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Line Extension Amount"
              value={formData.LegalMonetaryTotal.LineExtensionAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.LineExtensionAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Tax Exclusive Amount"
              value={formData.LegalMonetaryTotal.TaxExclusiveAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.TaxExclusiveAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Tax Inclusive Amount"
              value={formData.LegalMonetaryTotal.TaxInclusiveAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.TaxInclusiveAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Allowance Total Amount"
              value={formData.LegalMonetaryTotal.AllowanceTotalAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.AllowanceTotalAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Charge Total Amount"
              value={formData.LegalMonetaryTotal.ChargeTotalAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.ChargeTotalAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Prepaid Amount"
              value={formData.LegalMonetaryTotal.PrepaidAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.PrepaidAmount",
                  parseFloat(e.target.value),
                )
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Payable Amount"
              value={formData.LegalMonetaryTotal.PayableAmount}
              onChange={(e) =>
                handleChange(
                  "LegalMonetaryTotal.PayableAmount",
                  parseFloat(e.target.value),
                )
              }
            />

            <button
              onClick={handleSubmit}
              className="bg-purple-600 text-white text-lg font-medium rounded-md px-4 py-3 w-full mt-4"
            >
              Create Invoice
            </button>

            {invoiceXml && (
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-2">Generated XML</h2>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {invoiceXml}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
