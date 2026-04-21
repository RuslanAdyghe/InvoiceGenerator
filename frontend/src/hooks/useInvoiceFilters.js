// src/hooks/useInvoiceFilters.js
import { useState, useMemo } from "react";

export function useInvoiceFilters(invoices) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
  };

  const hasActiveFilters =
    search || statusFilter || dateFrom || dateTo || amountMin || amountMax;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search by ID or customer name
      if (search) {
        const q = search.toLowerCase();
        const matchesId = invoice.ID.toLowerCase().includes(q);
        const matchesCustomer = invoice.customer_name?.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer) return false;
      }

      // Filter by status
      if (statusFilter && invoice.status !== statusFilter) return false;

      // Filter by date range
      if (dateFrom && new Date(invoice.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(invoice.created_at) > new Date(dateTo)) return false;

      // Filter by amount range
const payable = invoice.invoice_data?.LegalMonetaryTotal?.PayableAmount;
if (amountMin && payable < parseFloat(amountMin)) return false;
if (amountMax && payable > parseFloat(amountMax)) return false;

      return true;
    });
  }, [invoices, search, statusFilter, dateFrom, dateTo, amountMin, amountMax]);

  return {
    filteredInvoices,
    hasActiveFilters,
    clearFilters,
    filters: { search, statusFilter, dateFrom, dateTo, amountMin, amountMax },
    setters: { setSearch, setStatusFilter, setDateFrom, setDateTo, setAmountMin, setAmountMax },
  };
}