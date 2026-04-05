import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateInvoice from "./pages/CreateInvoice"
import ViewInvoices from "./pages/ViewInvoices"
import InvoiceDetail from "./pages/ViewInvoice"
import Profile from "./pages/Profile"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
        <Route path="/invoices" element={<ViewInvoices />} />
        <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>  
  )
}

export default App