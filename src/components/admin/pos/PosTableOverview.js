import React from "react";
import { CalendarClock, RefreshCw, Users } from "lucide-react";
import { formatReservationDate, formatReservationTime } from "../../../utils/reservationTime";
import "../tables/TableMap.scss";

const statusLabel = (value) => String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const PosTableOverview = ({ tables, loading, error, selectedTableId, onSelect, onRefresh }) => {
  if (loading) return <section className="pos-overview-state"><RefreshCw className="spin" /> Loading table sessions...</section>;
  if (error) return <section className="pos-overview-state error"><strong>Table overview unavailable</strong><p>{error}</p><button type="button" onClick={onRefresh}>Retry</button></section>;
  if (!tables.length) return <section className="pos-overview-state"><strong>No tables configured</strong></section>;

  return <section className="operational-table-grid" aria-label="POS table overview">{tables.map((table) => {
    const activeOrder = table.active_order;
    const seated = table.seated_reservation;
    const buttonLabel = activeOrder
      ? "Open Active Order"
      : seated
        ? table.session_state === "replacement_required" ? "Create Replacement Order" : "Create First Order"
        : "Start Walk-in";
    const canOpen = Boolean(activeOrder || table.can_start_reservation_order || table.can_start_walk_in);
    return <article key={table.id} className={`pos-table-card ${table.status} ${selectedTableId === table.id ? "selected" : ""}`}>
      <header><div><small>Table</small><h3>{table.table_number}</h3></div><span className="physical-badge">{statusLabel(table.status)}</span></header>
      <div className="pos-table-capacity"><Users size={15} /> {table.capacity} seats</div>
      {activeOrder && <div className="pos-session"><strong>Order #{activeOrder.id.slice(0, 8).toUpperCase()}</strong><small>{[statusLabel(activeOrder.order_status), `${activeOrder.guest_count || "?"} guests`, activeOrder.contact_name].filter(Boolean).join(" · ")}</small></div>}
      {!activeOrder && seated && <div className="pos-session"><strong>{table.session_state === "replacement_required" ? "Order cancelled · Replacement required" : "SEATED · Waiting for order"}</strong><small>{[seated.contact_name, `${seated.number_of_people} guests`].filter(Boolean).join(" · ")}</small></div>}
      {!activeOrder && !seated && table.status === "available" && <div className="pos-session"><strong>Ready for walk-in</strong><small>Guest count will be confirmed before sending items.</small></div>}
      {table.upcoming_reservation && <div className="pos-upcoming"><CalendarClock size={14} /> Next: {formatReservationDate(table.upcoming_reservation.reservation_time, { weekday: undefined, year: undefined })} at {formatReservationTime(table.upcoming_reservation.reservation_time)} · {table.upcoming_reservation.number_of_people} guests</div>}
      {(table.issues || []).map((issue) => <p className="pos-table-issue" key={issue}>{issue}</p>)}
      <button type="button" disabled={!canOpen} onClick={() => onSelect(table)}>{buttonLabel}</button>
    </article>;
  })}</section>;
};

export default PosTableOverview;
