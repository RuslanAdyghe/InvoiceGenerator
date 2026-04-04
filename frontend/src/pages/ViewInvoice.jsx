// src/pages/InvoiceDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DeleteModal from "../components/DeleteModal";
import { statusColor } from "../utils/statusColour";

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `http://localhost:3000/invoices/${invoiceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Failed to fetch invoice");
          return;
        }
        setInvoice(data);
      } catch {
        setError("Failed to connect to server");
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (error)
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 px-6 py-8 pt-24">
          <p className="text-red-500 text-center">{error}</p>
        </main>
      </>
    );

  if (!invoice)
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 px-6 py-8 pt-24">
          <p className="text-center text-gray-400">Loading...</p>
        </main>
      </>
    );

  const d = invoice.invoice_data;

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3000/invoices/${invoiceId}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      alert("Failed to download XML");
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceId}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3000/invoices/${invoiceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to delete invoice");
        return;
      }
      navigate("/invoices");
    } catch (error) {
      alert("Failed to connect to server");
    }
  };

  const handleMarkAsPaid = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3000/invoices/${invoiceId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "paid" }),
        },
      );
      if (!response.ok) {
        alert("Failed to update invoice status");
        return;
      }
      setInvoice((prev) => ({ ...prev, status: "paid" }));
    } catch {
      alert("Failed to connect to server");
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/invoices")}
            className="text-purple-500 hover:underline text-sm mb-6 block"
          >
            ← Back to Invoices
          </button>
          <section className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Invoice Detail
            </h1>
            <p className="text-gray-400 text-sm">{invoice.ID}</p>
            <span
              className={`${statusColor(invoice.status)} px-3 py-1 rounded-full text-xs mt-2 inline-block`}
            >
              {invoice.status}
            </span>
          </section>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            {/* General */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                General
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Profile ID</span>
                  <p className="text-gray-700">{d.ProfileID}</p>
                </div>
                <div>
                  <span className="text-gray-400">Issue Date</span>
                  <p className="text-gray-700">{d.IssueDate}</p>
                </div>
                <div>
                  <span className="text-gray-400">Due Date</span>
                  <p className="text-gray-700">{d.DueDate}</p>
                </div>
                <div>
                  <span className="text-gray-400">Order Reference</span>
                  <p className="text-gray-700">{d.OrderReference.ID}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Supplier & Customer */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Supplier
                </h2>
                <p className="text-sm text-gray-700">{d.Supplier.Name}</p>
                {d.Supplier.ID && (
                  <p className="text-sm text-gray-400">{d.Supplier.ID}</p>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Customer
                </h2>
                <p className="text-sm text-gray-700">{d.Customer.Name}</p>
                {d.Customer.ID && (
                  <p className="text-sm text-gray-400">{d.Customer.ID}</p>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Delivery */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Delivery
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Delivery Date</span>
                  <p className="text-gray-700">
                    {d.Delivery.ActualDeliveryDate}
                  </p>
                </div>
                {d.Delivery.ActualDeliveryTime && (
                  <div>
                    <span className="text-gray-400">Delivery Time</span>
                    <p className="text-gray-700">
                      {d.Delivery.ActualDeliveryTime}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Payment Means */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Payment
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Payment Code</span>
                  <p className="text-gray-700">
                    {d.PaymentMeans.PaymentMeansCode}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Account ID</span>
                  <p className="text-gray-700">
                    {d.PaymentMeans.PayeeFinancialAccount.ID}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Account Name</span>
                  <p className="text-gray-700">
                    {d.PaymentMeans.PayeeFinancialAccount.Name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Currency</span>
                  <p className="text-gray-700">
                    {d.PaymentMeans.PayeeFinancialAccount.Currency}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Totals */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Totals ({d.LegalMonetaryTotal.Currency})
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Line Extension Amount</span>
                  <span className="text-gray-700">
                    {d.LegalMonetaryTotal.LineExtensionAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Exclusive</span>
                  <span className="text-gray-700">
                    {d.LegalMonetaryTotal.TaxExclusiveAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Inclusive</span>
                  <span className="text-gray-700">
                    {d.LegalMonetaryTotal.TaxInclusiveAmount}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-gray-100 pt-2">
                  <span>Payable Amount</span>
                  <span className="text-purple-600">
                    {d.LegalMonetaryTotal.Currency}{" "}
                    {d.LegalMonetaryTotal.PayableAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 text-white text-sm font-medium rounded-md px-4 py-3 mt-5"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAsPaid}
                className="bg-green-500 text-white text-sm font-medium rounded-md px-4 py-3 mt-5"
              >
                Mark as Paid
              </button>
              <button
                onClick={handleDownload}
                className="bg-purple-600 text-white text-sm font-medium rounded-md px-4 py-3 mt-5"
              >
                Download XML
              </button>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <DeleteModal
            invoiceId={invoiceId}
            onConfirm={() => {
              handleDelete();
              setShowDeleteModal(false);
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </main>
    </>
  );
}

export default InvoiceDetail;
