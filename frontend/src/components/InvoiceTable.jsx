import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";

function InvoiceTable({ recentInvoices, viewInvoice = false, onDelete = null }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const deleteInvoice = async (invoiceId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

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
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-500">
            <th className="text-left p-3 rounded-l-lg">ID</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3 rounded-r-lg">Action</th>
          </tr>
        </thead>
        <tbody>
          {recentInvoices.map((invoice) => (
            <tr key={invoice.ID} className="border-b border-gray-100">
              <td className="p-3 text-gray-600">{invoice.ID.slice(0, 8)}...</td>
              <td className="p-3">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                  {invoice.status}
                </span>
              </td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/invoices/${invoice.ID}`)}
                  className="text-purple-500 hover:underline text-xs mr-4"
                >
                  View
                </button>
                {viewInvoice && (
                  <button
                    onClick={() => { setInvoiceToDelete(invoice.ID); setShowDeleteModal(true); }}
                    className="text-red-500 hover:underline text-xs"
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
          onConfirm={(id) => { deleteInvoice(id); setShowDeleteModal(false); }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export default InvoiceTable;