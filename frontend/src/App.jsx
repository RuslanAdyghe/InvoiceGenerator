import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateInvoice from "./pages/CreateInvoice"
import ViewInvoices from "./pages/ViewInvoices"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
        <Route path="/view-invoices" element={<ViewInvoices />} />
      </Routes>
    </BrowserRouter>  
  )
}

export default App
