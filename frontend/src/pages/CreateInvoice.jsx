import { useState } from "react";
import NavBar from "../components/NavBar";
import ErrorModal from "../components/ErrorModal";

export default function CreateInvoice() {
  const [invoiceXml, setInvoiceXml] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

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
    Customer: { Name: "", ID: "", Email: "" },
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

  const inputClass = "border border-gray-300 rounded-md p-2 w-full mb-3";

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const safeParseNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getErrorMessage = (data, fallback) => {
    return data?.error || data?.message || fallback;
  };

  const validateForm = () => {
    if (!formData.ProfileID.trim()) {
      return "Profile ID is required";
    }

    if (!formData.IssueDate) {
      return "Issue date is required";
    }

    if (!formData.DueDate) {
      return "Due date is required";
    }

    if (!formData.Supplier.Name.trim()) {
      return "Supplier name is required";
    }

    if (!formData.Customer.Name.trim()) {
      return "Customer name is required";
    }

    if (!formData.Customer.Email.trim()) {
      return "Customer email is required";
    }

    if (!formData.LegalMonetaryTotal.Currency.trim()) {
      return "Currency is required";
    }

    if (formData.LegalMonetaryTotal.PayableAmount <= 0) {
      return "Payable amount must be greater than 0";
    }

    return "";
  };

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

    setSuccessMessage("");
    setInvoiceXml("");

    const allowedTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
    ];

    const isValidExtension =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.name.toLowerCase().endsWith(".csv");

    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      showErrorModal("Only PDF or CSV files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorModal("File size must be under 5MB");
      return;
    }

    setExtracting(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("http://localhost:3000/invoices/extract", {
        method: "POST",
        body: formDataUpload,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        showErrorModal(getErrorMessage(data, "Failed to extract invoice data"));
        return;
      }

      if (!data?.invoiceData) {
        showErrorModal("Invalid extracted invoice data");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        ...data.invoiceData,
        OrderReference: {
          ...prev.OrderReference,
          ...data.invoiceData?.OrderReference,
        },
        Delivery: {
          ...prev.Delivery,
          ...data.invoiceData?.Delivery,
        },
        PaymentMeans: {
          ...prev.PaymentMeans,
          ...data.invoiceData?.PaymentMeans,
          PayeeFinancialAccount: {
            ...prev.PaymentMeans.PayeeFinancialAccount,
            ...data.invoiceData?.PaymentMeans?.PayeeFinancialAccount,
          },
        },
        Supplier: {
          ...prev.Supplier,
          ...data.invoiceData?.Supplier,
        },
        Customer: {
          ...prev.Customer,
          ...data.invoiceData?.Customer,
        },
        LegalMonetaryTotal: {
          ...prev.LegalMonetaryTotal,
          ...data.invoiceData?.LegalMonetaryTotal,
        },
      }));

      setSuccessMessage("Invoice data extracted successfully");
    } catch (err) {
      showErrorModal(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Is the backend running?"
          : "Failed to extract invoice data",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    setInvoiceXml("");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      showErrorModal("User not authenticated. Please log in again.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      showErrorModal(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, invoiceData: formData }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        showErrorModal(getErrorMessage(data, "Failed to create invoice"));
        return;
      }

      if (!data?.invoiceId) {
        showErrorModal("Invoice was created but no invoice ID was returned");
        return;
      }

      const transformResponse = await fetch(
        `http://localhost:3000/invoices/${data.invoiceId}/transform`,
        { method: "POST" },
      );

      let transformData;
      try {
        transformData = await transformResponse.json();
      } catch {
        transformData = null;
      }

      if (!transformResponse.ok) {
        showErrorModal(
          getErrorMessage(transformData, "Failed to transform invoice"),
        );
        return;
      }

      if (!transformData?.invoiceXml) {
        showErrorModal("Invoice transformed successfully, but no XML was returned");
        return;
      }

      const emailResponse = await fetch(
        `http://localhost:3000/invoices/${data.invoiceId}/send-email`,
        {
          method: "POST",
        },
      );

      if (!emailResponse.ok) {
        setInvoiceXml(transformData.invoiceXml);
        setSuccessMessage(
          "Invoice created successfully, but email could not be sent.",
        );
        return;
      }

      setInvoiceXml(transformData.invoiceXml);
      setSuccessMessage("Invoice created and emailed successfully");
    } catch (err) {
      showErrorModal(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Is the backend running?"
          : err.message || "Failed to connect to server",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />

      {showError && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Autofill from PDF or CSV
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload an existing invoice and we'll extract the fields for you to
              review. Rest assured your sensitive data is not stored nor used in
              the training of any AI software.
            </p>

            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileUpload}
              disabled={extracting || loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
            />

            {extracting && (
              <p className="text-sm text-purple-500 mt-3 animate-pulse">
                Extracting invoice data...
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {successMessage && (
              <p className="text-green-600 bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                {successMessage}
              </p>
            )}

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
              value={formData.IssueDate}
              onChange={(e) => handleChange("IssueDate", e.target.value)}
            />
            <input
              className={inputClass}
              type="date"
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
            <input
              className={inputClass}
              placeholder="Customer Email"
              value={formData.Customer.Email}
              onChange={(e) => handleChange("Customer.Email", e.target.value)}
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
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
                  safeParseNumber(e.target.value),
                )
              }
            />

            <button
              onClick={handleSubmit}
              disabled={loading || extracting}
              className="bg-purple-600 text-white text-lg font-medium rounded-md px-4 py-3 w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
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