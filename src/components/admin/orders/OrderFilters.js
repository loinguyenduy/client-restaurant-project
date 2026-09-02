import React from "react";
import { RotateCcw, Search } from "lucide-react";

const OrderFilters = ({ filters, onChange, onReset }) => {
  const setField = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  return (
    <section className="order-filters" aria-label="Order filters">
      <div className="order-filter-search-area">
        <label className="order-search"><Search size={17} /><input value={filters.search} onChange={(event) => setField("search", event.target.value)} placeholder="Order ID, contact, phone or transaction" /></label>
      </div>
      <div className="order-filter-control-grid">
        <select aria-label="Order status" value={filters.status} onChange={(event) => setField("status", event.target.value)}>
          <option value="all">All order statuses</option><option value="pending_payment">Pending payment</option><option value="confirmed">Confirmed</option><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="pending">Legacy pending</option><option value="processing">Legacy processing</option>
        </select>
        <select aria-label="Payment status" value={filters.paymentStatus} onChange={(event) => setField("paymentStatus", event.target.value)}>
          <option value="all">All payment statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
        </select>
        <select aria-label="Fulfillment type" value={filters.fulfillmentType} onChange={(event) => setField("fulfillmentType", event.target.value)}>
          <option value="all">All fulfillment</option><option value="takeaway">Takeaway</option><option value="dine_in">Dine-in</option><option value="legacy">Legacy / unknown</option>
        </select>
        <select aria-label="Payment method" value={filters.paymentMethod} onChange={(event) => setField("paymentMethod", event.target.value)}>
          <option value="all">All payment methods</option><option value="cash">Cash</option><option value="payos">PayOS</option><option value="card">Legacy Card</option><option value="legacy_unknown">Legacy / unknown</option>
        </select>
        <label><span>From</span><input type="date" value={filters.dateFrom} onChange={(event) => setField("dateFrom", event.target.value)} /></label>
        <label><span>To</span><input type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => setField("dateTo", event.target.value)} /></label>
        <button type="button" className="filter-reset" onClick={onReset}><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
  );
};

export default OrderFilters;
