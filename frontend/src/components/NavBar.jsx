import { useState } from "react";
import { Link } from "react-router-dom";

import logoIcon from "../assets/logo.svg";  
import hamburgerIcon from "../assets/hamburger.svg";

function NavBar() {
  const [menu, setMenu] = useState(false);  

  const toggleMenu = () => {
    setMenu(!menu);
  }

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-blue-400 to-purple-400 flex justify-between p-3 md:px-[750px]">
        <img src={logoIcon} alt="Logo" className="h-10 w-10" />
        <img src={hamburgerIcon} alt="Hamburger" className="h-10 w-10 md:hidden" onClick={toggleMenu} />
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/create-invoice" className="text-white hover:text-gray-200 font-medium transition-colors">Create Invoice</Link>
          <Link to="/profile" className="text-white hover:text-gray-200 font-medium transition-colors">Profile</Link>
        </div>
      </nav>
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-out ${menu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={toggleMenu}
        />
        <div className={`fixed top-0 right-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ease-out ${menu ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Menu</span>
            <button onClick={toggleMenu} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div className="flex flex-col p-4 gap-4">
            <Link to="/create-invoice" className="text-gray-600 hover:text-purple-500 font-medium transition-colors">Create Invoice</Link>
            <Link to="/profile" className="text-gray-600 hover:text-purple-500 font-medium transition-colors">Profile</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default NavBar;