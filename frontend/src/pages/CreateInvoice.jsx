import { useState } from "react";

export default function CreateInvoice() {
  const [invoiceXml, setInvoiceXml] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = async () => {
    console.log("userId:", localStorage.getItem("userId"));
    setError("");
    const userId = localStorage.getItem("userId");
    console.log("sending:", { userId, invoiceData: formData });


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

      const transformResponse = await fetch(`http://localhost:3000/invoices/${data.invoiceId}/transform`, {
        method: "POST",
      });

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
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-medium mb-6">Create Invoice</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-lg font-medium mb-2">General</h2>
      <input className={inputClass} placeholder="Profile ID" onChange={(e) => handleChange("ProfileID", e.target.value)} />
      <input className={inputClass} type="date" placeholder="Issue Date" onChange={(e) => handleChange("IssueDate", e.target.value)} />
      <input className={inputClass} type="date" placeholder="Due Date" onChange={(e) => handleChange("DueDate", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Order Reference</h2>
      <input className={inputClass} placeholder="Order ID" onChange={(e) => handleChange("OrderReference.ID", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Delivery</h2>
      <input className={inputClass} type="date" placeholder="Actual Delivery Date" onChange={(e) => handleChange("Delivery.ActualDeliveryDate", e.target.value)} />
      <input className={inputClass} placeholder="Actual Delivery Time" onChange={(e) => handleChange("Delivery.ActualDeliveryTime", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Payment Means</h2>
      <input className={inputClass} placeholder="Payment Means Code" onChange={(e) => handleChange("PaymentMeans.PaymentMeansCode", e.target.value)} />
      <input className={inputClass} type="date" placeholder="Payment Due Date" onChange={(e) => handleChange("PaymentMeans.PaymentDueDate", e.target.value)} />
      <input className={inputClass} placeholder="Financial Account ID" onChange={(e) => handleChange("PaymentMeans.PayeeFinancialAccount.ID", e.target.value)} />
      <input className={inputClass} placeholder="Financial Account Name" onChange={(e) => handleChange("PaymentMeans.PayeeFinancialAccount.Name", e.target.value)} />
      <input className={inputClass} placeholder="Currency" onChange={(e) => handleChange("PaymentMeans.PayeeFinancialAccount.Currency", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Supplier</h2>
      <input className={inputClass} placeholder="Supplier Name" onChange={(e) => handleChange("Supplier.Name", e.target.value)} />
      <input className={inputClass} placeholder="Supplier ID" onChange={(e) => handleChange("Supplier.ID", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Customer</h2>
      <input className={inputClass} placeholder="Customer Name" onChange={(e) => handleChange("Customer.Name", e.target.value)} />
      <input className={inputClass} placeholder="Customer ID" onChange={(e) => handleChange("Customer.ID", e.target.value)} />

      <h2 className="text-lg font-medium mb-2 mt-4">Legal Monetary Total</h2>
      <input className={inputClass} placeholder="Currency" onChange={(e) => handleChange("LegalMonetaryTotal.Currency", e.target.value)} />
      <input className={inputClass} type="number" placeholder="Line Extension Amount" onChange={(e) => handleChange("LegalMonetaryTotal.LineExtensionAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Tax Exclusive Amount" onChange={(e) => handleChange("LegalMonetaryTotal.TaxExclusiveAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Tax Inclusive Amount" onChange={(e) => handleChange("LegalMonetaryTotal.TaxInclusiveAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Allowance Total Amount" onChange={(e) => handleChange("LegalMonetaryTotal.AllowanceTotalAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Charge Total Amount" onChange={(e) => handleChange("LegalMonetaryTotal.ChargeTotalAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Prepaid Amount" onChange={(e) => handleChange("LegalMonetaryTotal.PrepaidAmount", parseFloat(e.target.value))} />
      <input className={inputClass} type="number" placeholder="Payable Amount" onChange={(e) => handleChange("LegalMonetaryTotal.PayableAmount", parseFloat(e.target.value))} />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white rounded-md px-6 py-3 w-full mt-4"
      >
        Create Invoice
      </button>

      {invoiceXml && (
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Generated XML</h2>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">{invoiceXml}</pre>
        </div>
      )}
    </div>
  );
}