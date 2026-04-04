import { useEffect, useState } from "react";

import NavBar from "../components/NavBar";
import InvoiceTable from "../components/InvoiceTable";

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
        `http://localhost:3000/invoices/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setInvoices(data);
    };

    fetchInvoices();
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <section className="header text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Your Invoices
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Here you can view and manage all your invoices.
            </p>
          </section>
          <section>
            <InvoiceTable
              recentInvoices={invoices}
              viewInvoice={true}
              onDelete={deleteInvoice}
            />
          </section>
        </div>
      </main>
    </>
  );
}

export default ViewInvoices;
