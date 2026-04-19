import { useNavigate } from "react-router-dom";
import { FilePlus, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import NavBar from "../components/NavBar";
import InvoiceTable from "../components/InvoiceTable";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      setUser(data);
    };

    const fetchUserInvoices = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoices/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      const sortedInvoices = (data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setRecentInvoices(sortedInvoices);
    };

    fetchUserInfo();
    fetchUserInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <NavBar />
      <main className="dashboard flex flex-col items-center px-6 pt-[80px] lg:pt-32">
        <section className="header flex flex-col items-center">
          <h1 className="text-gray-400 dark:text-gray-500 text-sm md:text-base font-medium mb-1">
            Welcome back,
          </h1>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {user?.companyName}
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-10">
            What would you like to do today?
          </p>
        </section>

        <section className="Invoice Options flex flex-col items-center md:flex-row gap-6 lg:mb-20">
          <button
            onClick={() => navigate("/create-invoice")}
            className="w-full md:w-72 md:h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-purple-400 dark:hover:border-purple-400 bg-white dark:bg-gray-800 transition-colors duration-300"
          >
            <FilePlus className="w-10 h-10 mb-2 text-purple-400" />
            <h2 className="font-bold text-lg md:text-xl text-gray-800 dark:text-white">
              Create Invoice
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">
              Generate a new invoice
            </p>
          </button>

          <button
            onClick={() => navigate("/invoices")}
            className="w-full md:w-72 md:h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-purple-400 dark:hover:border-purple-400 bg-white dark:bg-gray-800 transition-colors duration-300 mt-4 mb-10 md:mt-0 md:mb-0"
          >
            <FileText className="w-10 h-10 mb-2 text-purple-400" />
            <h2 className="font-bold text-lg md:text-xl text-gray-800 dark:text-white">
              View Invoices
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">
              View your existing invoices
            </p>
          </button>
        </section>

        <section className="recent-invoices w-full md:w-[1000px] px-4">
          <h1 className="font-bold text-lg md:text-2xl mb-3 text-center text-gray-800 dark:text-white">
            Recent Invoices
          </h1>
          <InvoiceTable recentInvoices={recentInvoices} />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;