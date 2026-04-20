import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceFilterBar from "../components/InvoiceFilterBar";
import { useInvoiceFilters } from "../hooks/useInvoiceFilters";

function ViewInvoices() {
  const [invoices, setInvoices] = useState([]);

  const deleteInvoice = (invoiceId) => {
    setInvoices((prev) => prev.filter((inv) => inv.ID !== invoiceId));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoices/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setInvoices(data);
    };

    fetchInvoices();
  }, []);

  const { filteredInvoices, hasActiveFilters, clearFilters, filters, setters } =
    useInvoiceFilters(invoices);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 pt-24 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <section className="header text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Your Invoices
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Here you can view and manage all your invoices.
            </p>
          </section>

          <InvoiceFilterBar
            filters={filters}
            setters={setters}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />

          {/* Result count */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>

          {/* Empty state */}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 dark:text-gray-500 font-medium mb-1">
                No invoices found
              </p>
              <p className="text-gray-300 dark:text-gray-600 text-sm">
                Try adjusting your filters or search term
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-purple-500 dark:text-purple-400 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <InvoiceTable
              recentInvoices={filteredInvoices}
              viewInvoice={true}
              onDelete={deleteInvoice}
            />
          )}
        </div>
      </main>
    </>
  );
}

export default ViewInvoices;