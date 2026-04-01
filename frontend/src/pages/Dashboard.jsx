import { useNavigate } from "react-router-dom";
import { FilePlus, FileText } from "lucide-react";

import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

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
      <main className="dashboard flex flex-col items-center pt-[20px] px-6">
        <section className="header flex flex-col items-center">
          <h1 className="text-gray-400 text-sm font-medium mb-1">Welcome back,</h1>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{user?.companyName}</h1>
          <p className="text-gray-400 text-sm mb-10">What would you like to do today?</p>
        </section>
        <section className="Invoice Options flex flex-col items-center">
          <button onClick={() => navigate("/create-invoice")}
            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
            <FilePlus className="w-10 h-10 mb-2 text-purple-400" />
            <h2 className="font-bold text-lg">Create Invoice</h2>
            <p className="text-gray-400 text-sm">Generate a new invoice</p>
          </button>
          <button onClick={() => navigate("/view-invoices")}
            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors mt-4 mb-10">
            <FileText className="w-10 h-10 mb- text-purple-400" />
            <h2 className="font-bold text-lg">View Invoices</h2>
            <p className="text-gray-400 text-sm">View your existing invoices</p>
          </button>
        </section>
        <section className="recent-invoices w-full px-4">
          <h1 className="font-bold text-lg mb-3 text-center">Recent Invoices</h1>
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
                      className="text-purple-500 hover:underline text-xs"
                    >
                      view
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default Dashboard;