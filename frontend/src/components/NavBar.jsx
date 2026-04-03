import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import logoIcon from "../assets/logo.svg";
import hamburgerIcon from "../assets/hamburger.svg";
import purpleLogoutIcon from "../assets/purple-logout.svg";
import logoutIcon from "../assets/logout.svg";

function NavBar() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu(!menu);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    navigate("/login");
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-blue-400 to-purple-400 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-3 md:px-12">
          <img
            src={logoIcon}
            alt="Logo"
            className="h-10 w-10 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />
          <img
            src={hamburgerIcon}
            alt="Hamburger"
            className="h-10 w-10 md:hidden"
            onClick={toggleMenu}
          />
          <div className="hidden md:flex gap-6 items-center">
            <Link
              to="/create-invoice"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Create Invoice
            </Link>
            <Link
              to="/invoices"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              View Invoices
            </Link>
            <Link
              to="/profile"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Profile
            </Link>
            <img
              src={logoutIcon}
              alt="Logout"
              className="h-6 w-6 cursor-pointer"
              onClick={handleLogout}
            />
          </div>
        </div>
      </nav>
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-out ${menu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={toggleMenu}
        />
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ease-out ${menu ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col p-4 gap-4">
            <Link
              to="/create-invoice"
              className="text-gray-600 hover:text-purple-500 font-medium transition-colors"
            >
              Create Invoice
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-purple-500 font-medium transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-purple-600 font-medium"
            >
              <img src={purpleLogoutIcon} alt="logout" className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
