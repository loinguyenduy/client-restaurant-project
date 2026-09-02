import React from "react";
import { Edit3, ShoppingBag, Trash2, Users } from "lucide-react";

const statusLabel = (status) => {
  if (status === "reserved") return "Legacy Reserved";
  return String(status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const TableCard = ({ table, isAdmin, busy, onStatus, onEdit, onDelete }) => {
  const activeOrder = table.active_order;
  const seatedReservation = table.seated_reservation;
  const drifted = activeOrder && table.status !== "occupied";
  const orphanOccupied = table.status === "occupied" && !activeOrder && !seatedReservation;

  return (
    <article className={`table-map-card ${table.status} ${drifted ? "drifted" : ""}`}>
      <header>
        <div>
          <span>Table</span>
          <h2>{table.table_number}</h2>
        </div>
        <span className={`table-status ${table.status}`}>{statusLabel(table.status)}</span>
      </header>

      <div className="table-capacity"><Users size={17} /> {table.capacity} seats</div>
      {activeOrder ? (
        <div className="table-active-order">
          <ShoppingBag size={16} />
          <span>
            <small>Active order</small>
            <strong>#{activeOrder.id.slice(0, 8).toUpperCase()} · {statusLabel(activeOrder.order_status)}</strong>
          </span>
        </div>
      ) : (
        <div className="table-no-order">No active order</div>
      )}
      {seatedReservation && <div className="table-active-order seated-session"><Users size={16} /><span><small>Seated reservation</small><strong>{seatedReservation.contact_name || "Reserved guest"} · {seatedReservation.number_of_people} guests</strong></span></div>}

      {drifted && (
        <p className="table-warning">Status drift detected: an active order requires this table to be occupied.</p>
      )}
      {orphanOccupied && (
        <p className="table-warning">Occupied without an active order. Admin recovery is required.</p>
      )}

      <div className="table-card-actions">
        {drifted && isAdmin && (
          <button type="button" className="repair" disabled={busy} onClick={() => onStatus(table, "occupied", "Repair occupancy from the active order?")}>
            Repair occupancy
          </button>
        )}
        {!activeOrder && !seatedReservation && table.status === "available" && (
          <button type="button" disabled={busy} onClick={() => onStatus(table, "out_of_service", "Mark this table out of service?")}>
            Mark Out of Service
          </button>
        )}
        {!activeOrder && !seatedReservation && table.status === "out_of_service" && (
          <button type="button" disabled={busy} onClick={() => onStatus(table, "available")}>
            Return to Service
          </button>
        )}
        {isAdmin && orphanOccupied && (
          <>
            <button type="button" disabled={busy} onClick={() => onStatus(table, "available", "Release this orphan occupied table?")}>
              Release orphan
            </button>
            <button type="button" disabled={busy} onClick={() => onStatus(table, "out_of_service", "Move this orphan occupied table out of service?")}>
              Resolve as Out of Service
            </button>
          </>
        )}
        {isAdmin && table.status === "reserved" && (
          <>
            <button type="button" disabled={busy} onClick={() => onStatus(table, "available", "Resolve this legacy reserved table as available?")}>
              Return to Service
            </button>
            <button type="button" disabled={busy} onClick={() => onStatus(table, "out_of_service", "Resolve this legacy reserved table as out of service?")}>
              Mark Out of Service
            </button>
          </>
        )}
        {isAdmin && (
          <div className="structural-actions">
            <button type="button" onClick={() => onEdit(table)} aria-label={`Edit ${table.table_number}`}>
              <Edit3 size={16} /> Edit
            </button>
            <button type="button" className="delete" onClick={() => onDelete(table)} aria-label={`Delete ${table.table_number}`}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default TableCard;
