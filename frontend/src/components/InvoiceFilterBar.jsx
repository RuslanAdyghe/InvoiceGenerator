// src/components/InvoiceFilterBar.jsx
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = ["transformed", "validated", "pending", "created"];

function InvoiceFilterBar({ filters, setters, hasActiveFilters, clearFilters }) {
  const { search, statusFilter, dateFrom, dateTo, amountMin, amountMax } = filters;
  const { setSearch, setStatusFilter, setDateFrom, setDateTo, setAmountMin, setAmountMax } = setters;

  const inputClass =
    "border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200 w-full";

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 transition-colors duration-300">

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search by invoice ID or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200 w-full"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* Date from */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputClass}
        />

        {/* Date to */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputClass}
        />

        {/* Amount min */}
        <input
          type="number"
          placeholder="Min amount"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
          className={inputClass}
        />

        {/* Amount max */}
        <input
          type="number"
          placeholder="Max amount"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Active filter count + clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Filters active — showing filtered results
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            <X className="w-3 h-3" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoiceFilterBar;