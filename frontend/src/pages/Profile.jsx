import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";

function Profile() {
  const [user, setUser] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    transformed: 0,
    validated: 0,
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
        `http://localhost:3000/auth/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      setUser(data);
    };

    const fetchInvoiceStats = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:3000/invoices/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      const invoices = data || []; 

      setInvoiceStats({
        total: invoices.length,
        transformed: invoices.filter(inv => inv.status === "transformed").length,
        validated: invoices.filter(inv => inv.status === "validated").length,
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

  const inputClass = "border border-gray-300 rounded-md p-2 w-full mb-3";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="dashboard flex flex-col items-center pt-[80px] px-6 ">
        <section className="header flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">
              {getInitials(user?.companyName)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{user?.companyName}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <p className="text-gray-300 text-xs mt-1">
            Member since: {formatDate(user?.created_at)}
          </p>
        </section>

        <section className="flex flex-col gap-4 w-full max-w-sm mb-8 mt-5">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-2">Total Invoices</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {invoiceStats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-2">Transformed</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {invoiceStats.transformed}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-2">Validated</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {invoiceStats.validated}
            </p>
          </div>
        </section>

        <section className="w-full max-w-sm mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Account Details</h2>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <p className="text-gray-400 text-sm">Company Name</p>
              <p className="text-gray-800 text-sm font-medium">{user?.companyName}</p>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-gray-800 text-sm font-medium">{user?.email}</p>
            </div>
            <div className="flex justify-between py-3">
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-gray-800 text-sm font-medium">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-sm mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Security</h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full text-left text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors mb-3"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
            {showPasswordForm && (
              <div>
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
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </section>
        
        <section className="w-full max-w-sm mb-12">
          <button
            onClick={handleLogout}
            className="w-full border border-red-300 text-red-500 rounded-full py-3 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  )
}

export default Profile;