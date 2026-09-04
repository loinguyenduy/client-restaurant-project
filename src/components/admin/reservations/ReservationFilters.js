import React from "react";
import { RotateCcw, Search } from "lucide-react";

const ReservationFilters = ({ filters, onChange, onReset }) => {
  const set = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  return <section className="reservation-filters" aria-label="Reservation filters">
    <div className="reservation-scope-tabs" role="group" aria-label="Reservation time scope">
      {[{ value: "upcoming", label: "Upcoming" }, { value: "today", label: "Today" }, { value: "past", label: "Past" }].map((scope) => <button key={scope.value} type="button" className={filters.scope === scope.value ? "active" : ""} aria-pressed={filters.scope === scope.value} onClick={() => set("scope", scope.value)}>{scope.label}</button>)}
    </div>
    <div className="reservation-filter-controls">
      <label className="reservation-search"><Search size={17} /><input value={filters.search} onChange={(event) => set("search", event.target.value)} placeholder="Reservation ID, contact or phone" /></label>
      <label><span>Date scope</span><select value={filters.scope} onChange={(event) => set("scope", event.target.value)}><option value="all">All dates</option><option value="today">Today</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select></label>
      <label><span>Status</span><select value={filters.status} onChange={(event) => set("status", event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="seated">Seated</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option></select></label>
      <label><span>Party size</span><select value={filters.partySize} onChange={(event) => set("partySize", event.target.value)}><option value="">Any party size</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? "guest" : "guests"}</option>)}</select></label>
      <label><span>From</span><input type="date" value={filters.dateFrom} onChange={(event) => set("dateFrom", event.target.value)} /></label><label><span>To</span><input type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => set("dateTo", event.target.value)} /></label>
      <button type="button" onClick={onReset}><RotateCcw size={15} /> Reset</button>
    </div>
  </section>;
};

export default ReservationFilters;
