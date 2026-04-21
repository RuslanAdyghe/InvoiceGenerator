import { useState } from "react";
import NavBar from "../components/NavBar";
import ErrorModal from "../components/ErrorModal";
import LoadingOverlay from "../components/LoadingOverlay";

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
      PayeeFinancialAccount: { ID: "", Name: "" },
    },
    Supplier: {
      Name: "",
      TradingName: "",
      PostalAddress: {
        StreetName: "",
        AdditionalStreetName: "",
        CityName: "",
        PostalZone: "",
        CountrySubentity: "",
        Country: "",
      },
      Contact: { Name: "", Telephone: "", ElectronicMail: "" },
    },
    Customer: {
      Name: "",
      TradingName: "",
      Email: "",
      PostalAddress: {
        StreetName: "",
        AdditionalStreetName: "",
        CityName: "",
        PostalZone: "",
        CountrySubentity: "",
        Country: "",
      },
      Contact: { Name: "", Telephone: "", ElectronicMail: "" },
    },
    LegalMonetaryTotal: {
      LineExtensionAmount: 0,
      TaxExclusiveAmount: 0,
      TaxInclusiveAmount: 0,
      AllowanceTotalAmount: 0,
      ChargeTotalAmount: 0,
      PrepaidAmount: 0,
      PayableAmount: 0,
    },
  });

  // Updated inputClass with dark mode
  const inputClass =
    "border border-gray-300 dark:border-gray-600 rounded-md p-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200";

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
    if (!formData.ProfileID.trim()) return "Profile ID is required";
    if (!formData.IssueDate) return "Issue date is required";
    if (!formData.DueDate) return "Due date is required";
    if (!formData.Supplier.Name.trim()) return "Supplier name is required";
    if (!formData.Customer.Name.trim()) return "Customer name is required";
    if (!formData.Customer.Email.trim()) return "Customer email is required";
    if (!formData.DocumentCurrencyCode.trim()) return "Document currency code is required";
    if (formData.LegalMonetaryTotal.PayableAmount <= 0) return "Payable amount must be greater than 0";
    return "";
  };

  const deepMerge = (target, source) => {
    const output = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key] ?? "";
      }
    }
    return output;
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
    setExtracting(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invoices/extract`, {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
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
        OrderReference: { ...prev.OrderReference, ...data.invoiceData?.OrderReference },
        Delivery: { ...prev.Delivery, ...data.invoiceData?.Delivery },
        PaymentMeans: {
          ...prev.PaymentMeans,
          ...data.invoiceData?.PaymentMeans,
          PayeeFinancialAccount: {
            ...prev.PaymentMeans.PayeeFinancialAccount,
            ...data.invoiceData?.PaymentMeans?.PayeeFinancialAccount,
          },
        },
        Supplier: { ...prev.Supplier, ...data.invoiceData?.Supplier },
        Customer: { ...prev.Customer, ...data.invoiceData?.Customer },
        LegalMonetaryTotal: { ...prev.LegalMonetaryTotal, ...data.invoiceData?.LegalMonetaryTotal },
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
    setLoading(true);
    
    const validationError = validateForm();
    if (validationError) {
      showErrorModal(validationError);
      return;
    }
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, invoiceData: formData }),
      });
      const data = await response.json();
      if (!response.ok) {
        showErrorModal(getErrorMessage(data, "Failed to create invoice"));
        return;
      }
      if (!data?.invoiceId) {
        showErrorModal("Invoice was created but no invoice ID was returned");
        return;
      }
      const transformResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/v2/invoices/${data.invoiceId}/transform`,
        { method: "POST" },
      );
      const transformData = await transformResponse.json();
      if (!transformResponse.ok) {
        showErrorModal(getErrorMessage(transformData, "Failed to transform invoice"));
        return;
      }
      await fetch(`${import.meta.env.VITE_API_URL}/invoices/${data.invoiceId}/send-email`, {
        method: "POST",
      });
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
      
    {(extracting || loading) && (
      <LoadingOverlay
        message={extracting ? "Extracting invoice data..." : "Creating invoice..."}
      />
    )}

      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 pt-24 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <section className="mb-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
              Invoice Management
            </p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Create Invoice
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the details below to generate a new invoice
            </p>
          </section>

          {/* Autofill card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Autofill from PDF or CSV
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload an existing invoice and we'll extract the fields for you to
              review. Rest assured your sensitive data is not stored nor used in
              the training of any AI software.
            </p>
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileUpload}
              disabled={extracting || loading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50 disabled:opacity-50 transition-colors duration-200"
            />
            {extracting && (
              <p className="text-sm text-purple-500 mt-3 animate-pulse">
                Extracting invoice data...
              </p>
            )}
          </div>

          {/* Main form card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
            {successMessage && (
              <p className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4">
                {successMessage}
              </p>
            )}

            {/* Section headings reused throughout */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">General</h2>
            <input className={inputClass} placeholder="Profile ID" value={formData.ProfileID} onChange={(e) => handleChange("ProfileID", e.target.value)} />
            <input className={inputClass} type="date" value={formData.IssueDate} onChange={(e) => handleChange("IssueDate", e.target.value)} />
            <input className={inputClass} type="date" value={formData.DueDate} onChange={(e) => handleChange("DueDate", e.target.value)} />
            <input className={inputClass} placeholder="Currency Code (e.g. AUD)" value={formData.DocumentCurrencyCode} onChange={(e) => handleChange("DocumentCurrencyCode", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Reference</h2>
            <input className={inputClass} placeholder="Order ID" value={formData.OrderReference.ID} onChange={(e) => handleChange("OrderReference.ID", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Delivery</h2>
            <input className={inputClass} type="date" value={formData.Delivery.ActualDeliveryDate} onChange={(e) => handleChange("Delivery.ActualDeliveryDate", e.target.value)} />
            <input className={inputClass} placeholder="Actual Delivery Time (HH:MM:SS)" value={formData.Delivery.ActualDeliveryTime} onChange={(e) => handleChange("Delivery.ActualDeliveryTime", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Payment Means</h2>
            <input className={inputClass} placeholder="Payment Means Code" value={formData.PaymentMeans.PaymentMeansCode} onChange={(e) => handleChange("PaymentMeans.PaymentMeansCode", e.target.value)} />
            <input className={inputClass} type="date" value={formData.PaymentMeans.PaymentDueDate} onChange={(e) => handleChange("PaymentMeans.PaymentDueDate", e.target.value)} />
            <input className={inputClass} placeholder="Financial Account ID" value={formData.PaymentMeans.PayeeFinancialAccount.ID} onChange={(e) => handleChange("PaymentMeans.PayeeFinancialAccount.ID", e.target.value)} />
            <input className={inputClass} placeholder="Financial Account Name" value={formData.PaymentMeans.PayeeFinancialAccount.Name} onChange={(e) => handleChange("PaymentMeans.PayeeFinancialAccount.Name", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Supplier</h2>
            <input className={inputClass} placeholder="Supplier Name" value={formData.Supplier.Name} onChange={(e) => handleChange("Supplier.Name", e.target.value)} />
            <input className={inputClass} placeholder="Supplier Trading Name" value={formData.Supplier.TradingName} onChange={(e) => handleChange("Supplier.TradingName", e.target.value)} />
            <input className={inputClass} placeholder="Street Address" value={formData.Supplier.PostalAddress.StreetName} onChange={(e) => handleChange("Supplier.PostalAddress.StreetName", e.target.value)} />
            <input className={inputClass} placeholder="Address Line 2" value={formData.Supplier.PostalAddress.AdditionalStreetName} onChange={(e) => handleChange("Supplier.PostalAddress.AdditionalStreetName", e.target.value)} />
            <input className={inputClass} placeholder="City" value={formData.Supplier.PostalAddress.CityName} onChange={(e) => handleChange("Supplier.PostalAddress.CityName", e.target.value)} />
            <input className={inputClass} placeholder="Post Code" value={formData.Supplier.PostalAddress.PostalZone} onChange={(e) => handleChange("Supplier.PostalAddress.PostalZone", e.target.value)} />
            <input className={inputClass} placeholder="State / Region" value={formData.Supplier.PostalAddress.CountrySubentity} onChange={(e) => handleChange("Supplier.PostalAddress.CountrySubentity", e.target.value)} />
            <input className={inputClass} placeholder="Country Code (e.g. AU)" value={formData.Supplier.PostalAddress.Country} onChange={(e) => handleChange("Supplier.PostalAddress.Country", e.target.value)} />

            <h3 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-3 mt-2">Supplier Contact</h3>
            <input className={inputClass} placeholder="Contact Name" value={formData.Supplier.Contact.Name} onChange={(e) => handleChange("Supplier.Contact.Name", e.target.value)} />
            <input className={inputClass} placeholder="Contact Phone" value={formData.Supplier.Contact.Telephone} onChange={(e) => handleChange("Supplier.Contact.Telephone", e.target.value)} />
            <input className={inputClass} placeholder="Contact Email" value={formData.Supplier.Contact.ElectronicMail} onChange={(e) => handleChange("Supplier.Contact.ElectronicMail", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Customer</h2>
            <input className={inputClass} placeholder="Customer Name" value={formData.Customer.Name} onChange={(e) => handleChange("Customer.Name", e.target.value)} />
            <input className={inputClass} placeholder="Customer Trading Name" value={formData.Customer.TradingName} onChange={(e) => handleChange("Customer.TradingName", e.target.value)} />
            <input className={inputClass} placeholder="Customer ID" value={formData.Customer.ID} onChange={(e) => handleChange("Customer.ID", e.target.value)} />
            <input className={inputClass} placeholder="Customer Email" value={formData.Customer.Email} onChange={(e) => handleChange("Customer.Email", e.target.value)} />
            <input className={inputClass} placeholder="Street Address" value={formData.Customer.PostalAddress.StreetName} onChange={(e) => handleChange("Customer.PostalAddress.StreetName", e.target.value)} />
            <input className={inputClass} placeholder="Address Line 2" value={formData.Customer.PostalAddress.AdditionalStreetName} onChange={(e) => handleChange("Customer.PostalAddress.AdditionalStreetName", e.target.value)} />
            <input className={inputClass} placeholder="City" value={formData.Customer.PostalAddress.CityName} onChange={(e) => handleChange("Customer.PostalAddress.CityName", e.target.value)} />
            <input className={inputClass} placeholder="Post Code" value={formData.Customer.PostalAddress.PostalZone} onChange={(e) => handleChange("Customer.PostalAddress.PostalZone", e.target.value)} />
            <input className={inputClass} placeholder="State / Region" value={formData.Customer.PostalAddress.CountrySubentity} onChange={(e) => handleChange("Customer.PostalAddress.CountrySubentity", e.target.value)} />
            <input className={inputClass} placeholder="Country Code (e.g. AU)" value={formData.Customer.PostalAddress.Country} onChange={(e) => handleChange("Customer.PostalAddress.Country", e.target.value)} />

            <h3 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-3 mt-2">Customer Contact</h3>
            <input className={inputClass} placeholder="Contact Name" value={formData.Customer.Contact.Name} onChange={(e) => handleChange("Customer.Contact.Name", e.target.value)} />
            <input className={inputClass} placeholder="Contact Phone" value={formData.Customer.Contact.Telephone} onChange={(e) => handleChange("Customer.Contact.Telephone", e.target.value)} />
            <input className={inputClass} placeholder="Contact Email" value={formData.Customer.Contact.ElectronicMail} onChange={(e) => handleChange("Customer.Contact.ElectronicMail", e.target.value)} />

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Legal Monetary Total</h2>
            <input className={inputClass} type="number" placeholder="Line Extension Amount" value={formData.LegalMonetaryTotal.LineExtensionAmount} onChange={(e) => handleChange("LegalMonetaryTotal.LineExtensionAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Tax Exclusive Amount" value={formData.LegalMonetaryTotal.TaxExclusiveAmount} onChange={(e) => handleChange("LegalMonetaryTotal.TaxExclusiveAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Tax Inclusive Amount" value={formData.LegalMonetaryTotal.TaxInclusiveAmount} onChange={(e) => handleChange("LegalMonetaryTotal.TaxInclusiveAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Allowance Total Amount" value={formData.LegalMonetaryTotal.AllowanceTotalAmount} onChange={(e) => handleChange("LegalMonetaryTotal.AllowanceTotalAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Charge Total Amount" value={formData.LegalMonetaryTotal.ChargeTotalAmount} onChange={(e) => handleChange("LegalMonetaryTotal.ChargeTotalAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Prepaid Amount" value={formData.LegalMonetaryTotal.PrepaidAmount} onChange={(e) => handleChange("LegalMonetaryTotal.PrepaidAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />
            <input className={inputClass} type="number" placeholder="Payable Amount" value={formData.LegalMonetaryTotal.PayableAmount} onChange={(e) => handleChange("LegalMonetaryTotal.PayableAmount", e.target.value === "" ? "" : parseFloat(e.target.value))} />

            <button
              onClick={handleSubmit}
              disabled={loading || extracting}
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-md px-4 py-3 w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>

            {invoiceXml && (
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
                  Generated XML
                </h2>
                <pre className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300 p-4 rounded-md text-sm overflow-x-auto">
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