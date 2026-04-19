import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { statusColor } from "../utils/statusColour";

function InvoiceTable({ recentInvoices, viewInvoice = false, onDelete = null }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const deleteInvoice = async (invoiceId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`,
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
      onDelete(invoiceId);
    } catch (error) {
      alert(error.message || "Failed to connect to server");
    }
  };

  return (
    <>
      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <th className="text-left p-3 md:p-4 rounded-l-lg">ID</th>
            <th className="text-left p-3 md:p-4">Status</th>
            <th className="text-left p-3 md:p-4 rounded-r-lg">Action</th>
          </tr>
        </thead>
        <tbody>
          {recentInvoices.map((invoice) => (
            <tr
              key={invoice.ID}
              className="border-b border-gray-100 dark:border-gray-700 transition-colors duration-300"
            >
              <td className="p-3 md:p-4 text-gray-600 dark:text-gray-400">
                {invoice.ID.slice(0, 8)}...
              </td>
              <td className="p-3 md:p-4">
                <span
                  className={`${statusColor(invoice.status)} px-3 py-1 rounded-full text-xs mt-2 inline-block`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="p-3 md:p-4">
                <button
                  onClick={() => navigate(`/invoices/${invoice.ID}`)}
                  className="text-purple-500 dark:text-purple-400 hover:underline text-xs md:text-sm mr-4"
                >
                  View
                </button>
                {viewInvoice && (
                  <button
                    onClick={() => {
                      setInvoiceToDelete(invoice.ID);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 dark:text-red-400 hover:underline text-xs md:text-sm"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && (
        <DeleteModal
          invoiceId={invoiceToDelete}
          onConfirm={(id) => {
            deleteInvoice(id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export default InvoiceTable;