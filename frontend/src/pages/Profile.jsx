import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";

function Profile() {
  const [user, setUser] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    transformed: 0,
    paid: 0,
    needAttention:0,
    totalAmount: 0,
    totalPaid: 0,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setUser(data);
    };

    const fetchInvoiceStats = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoices/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      const invoices = data || [];
      console.log(invoices);
      console.log(invoices.map(inv => inv.invoice_data?.LegalMonetaryTotal?.PayableAmount));
      setInvoiceStats({
        total: invoices.length,
        transformed: invoices.filter((inv) => inv.status === "sent").length,
        paid: invoices.filter((inv) => inv.status === "paid").length,
        needAttention: invoices.filter((inv) => inv.status !== "paid" && inv.status !== "sent").length,
        totalAmount: invoices.reduce((sum, inv) => sum + (Number(inv.invoice_data?.LegalMonetaryTotal?.PayableAmount) ?? 0), 0),
        totalPaid: invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (Number(inv.invoice_data?.LegalMonetaryTotal?.PayableAmount) ?? 0), 0),
      });
    };

    fetchUserInfo();
    fetchInvoiceStats();
  }, []);

  const getInitials = (companyName) => {
    if (!companyName) return "?";
    return companyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    alert("Password changed successfully");
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const inputClass =
    "border border-gray-300 dark:border-gray-600 rounded-md p-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <NavBar />
      <main className="pt-24 px-6 max-w-6xl mx-auto lg:pt-40">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left column */}
          <div className="flex flex-col items-center md:items-start gap-6 md:w-1/3">
            <section className="flex flex-col items-center w-full">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center mb-4">
                <span className="text-white text-2xl md:text-4xl font-bold">
                  {getInitials(user?.companyName)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                {user?.companyName}
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">
                {user?.email}
              </p>
              <p className="text-gray-300 dark:text-gray-600 text-xs md:text-sm mt-1">
                Member since: {formatDate(user?.created_at)}
              </p>
            </section>

            {/* Account Details card */}
            <section className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
              <h2 className="font-bold text-gray-800 dark:text-white md:text-lg mb-4">
                Account Details
              </h2>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">Company Name</p>
                <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium">
                  {user?.companyName}
                </p>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">Email</p>
                <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium">
                  {user?.email}
                </p>
              </div>
              <div className="flex justify-between py-3">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base">Member Since</p>
                <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 md:w-2/3">

            {/* Stats cards */}
           <section className="grid grid-cols-2 gap-4">
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Total Invoices
                </p>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {invoiceStats.total}
                </p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Sent & Transformed
                </p>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {invoiceStats.transformed}
                </p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Need Attention
                </p>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {invoiceStats.needAttention}
                </p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Paid Invoices
                </p>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {invoiceStats.paid}
                </p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Total Paid
                </p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ${Number(invoiceStats.totalPaid ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base mb-2">
                  Total Value
                </p>
<p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
  ${Number(invoiceStats.totalAmount ?? 0).toFixed(2)}
</p>
              </div>
            </section>

            {/* Security card */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
              <h2 className="font-bold text-gray-800 dark:text-white md:text-lg mb-4">
                Security
              </h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm md:text-base text-purple-600 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-300 transition-colors mb-3"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
              {showPasswordForm && (
                <div className="mt-3">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    onClick={handleChangePassword}
                    className="w-full md:w-auto md:px-8 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full py-2 text-sm md:text-base font-medium hover:opacity-90 transition-opacity"
                  >
                    Update Password
                  </button>
                </div>
              )}
            </section>

            {/* Logout */}
            <section className="mb-12">
              <button
                onClick={handleLogout}
                className="w-full md:w-auto md:px-8 border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 rounded-full py-3 text-sm md:text-base font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Logout
              </button>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;