import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

import { useTheme } from "../hooks/useTheme";

import logoIcon from "../assets/logo.svg";
import hamburgerIcon from "../assets/hamburger.svg";
import purpleLogoutIcon from "../assets/purple-logout.svg";
import logoutIcon from "../assets/logout.svg";

function NavBar() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleMenu = () => setMenu(!menu);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <>
      {/* Desktop navbar — gradient stays the same on both modes */}
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
            className="h-10 w-10 md:hidden cursor-pointer"
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

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <div className="relative w-8 h-4 rounded-full bg-white/30 transition-colors duration-300">
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${isDark ? "left-4" : "left-0.5"}`}
                />
              </div>
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-yellow-200" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-white" />
              )}
            </button>

            <img
              src={logoutIcon}
              alt="Logout"
              className="h-6 w-6 cursor-pointer"
              onClick={handleLogout}
            />
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-out ${menu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={toggleMenu}
        />
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-out ${menu ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={toggleMenu}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col p-4 gap-4">
            <Link
              to="/create-invoice"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 font-medium transition-colors"
              onClick={toggleMenu}
            >
              Create Invoice
            </Link>
            <Link
              to="/invoices"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 font-medium transition-colors"
              onClick={toggleMenu}
            >
              View Invoices
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 font-medium transition-colors"
              onClick={toggleMenu}
            >
              Profile
            </Link>

            {/* Theme toggle in mobile drawer */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-400" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium transition-colors"
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