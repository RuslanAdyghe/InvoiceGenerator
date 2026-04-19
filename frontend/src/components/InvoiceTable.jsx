import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { statusColor } from "../utils/statusColour";

function InvoiceTable({ recentInvoices, viewInvoice = false, onDelete = null }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const allSelected =
    recentInvoices.length > 0 &&
    recentInvoices.every((inv) => selectedIds.includes(inv.ID));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recentInvoices.map((inv) => inv.ID));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

  const handleBulkDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteInvoice(id)));
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  return (
    <>
      {/* Bulk delete bar — only shows when something is selected */}
      {viewInvoice && selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 mb-4 transition-colors duration-300">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {selectedIds.length} invoice{selectedIds.length > 1 ? "s" : ""} selected
          </p>
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            className="text-sm font-medium text-red-500 dark:text-red-400 hover:underline"
          >
            Delete Selected
          </button>
        </div>
      )}

      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {viewInvoice && (
              <th className="p-3 md:p-4 rounded-l-lg w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </th>
            )}
            <th className={`text-left p-3 md:p-4 ${!viewInvoice ? "rounded-l-lg" : ""}`}>ID</th>
            <th className="text-left p-3 md:p-4">Status</th>
            <th className="text-left p-3 md:p-4 rounded-r-lg">Action</th>
          </tr>
        </thead>
        <tbody>
          {recentInvoices.map((invoice) => (
            <tr
              key={invoice.ID}
              className={`border-b border-gray-100 dark:border-gray-700 transition-colors duration-300 ${
                selectedIds.includes(invoice.ID)
                  ? "bg-purple-50 dark:bg-purple-900/10"
                  : ""
              }`}
            >
              {viewInvoice && (
                <td className="p-3 md:p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(invoice.ID)}
                    onChange={() => toggleSelect(invoice.ID)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </td>
              )}
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

      {/* Single delete modal */}
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

      {/* Bulk delete modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center border border-transparent dark:border-gray-700 transition-colors duration-300">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              Delete {selectedIds.length} Invoice{selectedIds.length > 1 ? "s" : ""}?
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-6">
              This action cannot be undone. All {selectedIds.length} selected invoice{selectedIds.length > 1 ? "s" : ""} will be permanently deleted.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-full py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-2 text-sm font-medium transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InvoiceTable;