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
      
      const response = await fetch(`http://localhost:3000/auth/user/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      setUser(data);
    };

    const fetchUserInvoices = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`http://localhost:3000/invoices/user/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      const sortedInvoices = (data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setRecentInvoices(sortedInvoices);
    }

    fetchUserInfo();
    fetchUserInvoices();
  }, []);

  return (
    <div>
      <NavBar />
      <main className="dashboard flex flex-col items-center pt-[20px] px-6 pt-[80px] lg:pt-32">
        <section className="header flex flex-col items-center">
          <h1 className="text-gray-400 text-sm md:text-base font-medium mb-1">Welcome back,</h1>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{user?.companyName}</h1>
          <p className="text-gray-400 text-sm md:text-base mb-10">What would you like to do today?</p>
        </section>
        <section className="Invoice Options flex flex-col items-center md:flex-row gap-6 lg:mb-20">
          <button onClick={() => navigate("/create-invoice")}
            className="w-full md:w-72 md:h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
            <FilePlus className="w-10 h-10 mb-2 text-purple-400" />
            <h2 className="font-bold text-lg md:text-xl">Create Invoice</h2>
            <p className="text-gray-400 text-sm md:text-base">Generate a new invoice</p>
          </button>
          <button onClick={() => navigate("/view-invoices")}
            className="w-full md:w-72 md:h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors mt-4 mb-10 md:mt-0 md:mb-0">
            <FileText className="w-10 h-10 mb-2 text-purple-400" />
            <h2 className="font-bold text-lg md:text-xl">View Invoices</h2>
            <p className="text-gray-400 text-sm md:text-base">View your existing invoices</p>
          </button>
        </section>
        <section className="recent-invoices w-full md:w-[1000px] px-4">
          <h1 className="font-bold text-lg md:text-2xl mb-3 text-center">Recent Invoices</h1>
          <InvoiceTable recentInvoices={recentInvoices} />
        </section>
      </main>
    </div>
  )
}

export default Dashboard;