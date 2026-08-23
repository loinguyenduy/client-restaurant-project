import React from "react";
import { RotateCcw, Search } from "lucide-react";

const ReservationFilters = ({ filters, onChange, onReset }) => {
  const set = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  return <section className="reservation-filters" aria-label="Reservation filters">
    <label className="reservation-search"><Search size={17} /><input value={filters.search} onChange={(event) => set("search", event.target.value)} placeholder="Reservation ID, contact or phone" /></label>
    <select value={filters.scope} aria-label="Reservation time scope" onChange={(event) => set("scope", event.target.value)}><option value="all">All dates</option><option value="today">Today</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select>
    <select value={filters.status} aria-label="Reservation status" onChange={(event) => set("status", event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="seated">Seated</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option></select>
    <select value={filters.partySize} aria-label="Party size" onChange={(event) => set("partySize", event.target.value)}><option value="">Any party size</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? "guest" : "guests"}</option>)}</select>
    <label><span>From</span><input type="date" value={filters.dateFrom} onChange={(event) => set("dateFrom", event.target.value)} /></label><label><span>To</span><input type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => set("dateTo", event.target.value)} /></label>
    <button type="button" onClick={onReset}><RotateCcw size={15} /> Reset</button>
  </section>;
};

export default ReservationFilters;
