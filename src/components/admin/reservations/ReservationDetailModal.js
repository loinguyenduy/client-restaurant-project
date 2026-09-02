import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  assignReservationTableApi,
  getManagedReservationDetailsApi,
  getSuitableReservationTablesApi,
  seatReservationApi,
} from "../../../services/adminService";
import { formatReservationDateTime, formatReservationTime } from "../../../utils/reservationTime";

const label = (value) => String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ReservationDetailModal = ({ reservationId, refreshKey, onClose }) => {
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.account.role);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [showTables, setShowTables] = useState(false);
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [seating, setSeating] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await getManagedReservationDetailsApi(reservationId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setReservation(response.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Reservation details could not be loaded.");
    }
  }, [reservationId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const loadSuitableTables = async () => {
    setShowTables(true);
    setTablesLoading(true);
    setTablesError("");
    try {
      const response = await getSuitableReservationTablesApi(reservationId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setTables(response.DT || []);
    } catch (loadError) {
      setTablesError(loadError?.EM || loadError?.message || "Suitable tables could not be loaded.");
    } finally {
      setTablesLoading(false);
    }
  };

  const assignTable = async (table) => {
    setAssigningId(table.id);
    try {
      const response = await assignReservationTableApi(reservationId, table.id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setReservation(response.DT);
      setShowTables(false);
      toast.success(`Table ${table.table_number} assigned.`);
    } catch (assignError) {
      toast.error(assignError?.EM || assignError?.message || "The table could not be assigned.");
      await loadSuitableTables();
    } finally {
      setAssigningId(null);
    }
  };

  const intervalLabel = (table) => `${formatReservationTime(table.interval_start)}–${formatReservationTime(table.interval_end)}`;

  const seatGuests = async () => {
    setSeating(true);
    try {
      const response = await seatReservationApi(reservationId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setReservation(response.DT);
      toast.success("Guests seated. The table is now occupied.");
    } catch (seatError) {
      toast.error(seatError?.EM || seatError?.message || "The guests could not be seated.");
      await load();
    } finally {
      setSeating(false);
    }
  };

  const openPos = () => navigate(`/${role === "admin" ? "admin" : "staff"}/pos?tableId=${reservation.table_id}&reservationId=${reservation.id}`);

  return <div className="reservation-detail-overlay" onClick={onClose} role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title" onClick={(event) => event.stopPropagation()}>
      <header>
        <div><span>Reservation detail</span><h2 id="reservation-detail-title">{reservation ? `#${reservation.id.slice(0, 8).toUpperCase()}` : "Loading..."}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close reservation detail"><X /></button>
      </header>
      {error ? <div className="reservation-detail-state"><p>{error}</p><button type="button" onClick={load}><RefreshCw size={15} /> Retry</button></div> : reservation && <div className="reservation-detail-body">
        <span className={`reservation-status ${reservation.status}`}>{label(reservation.status)}</span>
        <dl>
          <div><dt>Date & time</dt><dd>{formatReservationDateTime(reservation.reservation_time)}</dd></div>
          <div><dt>Party size</dt><dd>{reservation.number_of_people} guests</dd></div>
          <div><dt>Assigned table</dt><dd>{reservation.Table?.table_number ? `Table ${reservation.Table.table_number}` : "Not assigned"}</dd></div>
          <div><dt>Contact</dt><dd>{reservation.contact_name || "Legacy / unknown"}</dd></div>
          <div><dt>Phone</dt><dd>{reservation.contact_phone || "—"}</dd></div>
          <div><dt>Customer account</dt><dd>{reservation.User?.full_name || reservation.User?.username || "Legacy / unknown"}</dd></div>
          <div><dt>Created</dt><dd>{new Date(reservation.createdAt).toLocaleString()}</dd></div>
          <div><dt>Last updated</dt><dd>{new Date(reservation.updatedAt).toLocaleString()}</dd></div>
        </dl>
        {reservation.note && <div className="reservation-detail-note"><strong>Special request</strong><p>{reservation.note}</p></div>}
        {reservation.status === "confirmed" && <button type="button" className="assign-table-trigger" onClick={loadSuitableTables}>{reservation.table_id ? "Change Table" : "Assign Table"}</button>}
        {reservation.status === "confirmed" && reservation.table_id && <div className="seat-guests-action"><button type="button" disabled={!reservation.can_seat || seating} onClick={seatGuests}>{seating ? "Seating guests..." : "Seat Guests"}</button>{!reservation.can_seat && <small>Seating opens at {formatReservationTime(reservation.seating_opens_at)} (30 minutes before the booking).</small>}</div>}
        {reservation.status === "seated" && <div className="seated-session-action"><p>Guests are seated at Table {reservation.Table?.table_number}. Open POS to start or continue this table session.</p><button type="button" onClick={openPos}>Open POS</button></div>}
        {showTables && <div className="suitable-table-panel">
          <header><div><strong>Suitable tables</strong><small>{formatReservationDateTime(reservation.reservation_time)} · {reservation.number_of_people} guests</small></div><button type="button" onClick={() => setShowTables(false)} aria-label="Close suitable tables"><X size={18} /></button></header>
          {tablesLoading ? <p className="suitable-table-state">Checking table schedules...</p> : tablesError ? <div className="suitable-table-state error"><p>{tablesError}</p><button type="button" onClick={loadSuitableTables}>Retry</button></div> : tables.length === 0 ? <p className="suitable-table-state">No table can accommodate this reservation without a schedule conflict.</p> : <div className="suitable-table-grid">{tables.map((table) => <article key={table.id} className={`suitable-table-card ${table.physical_status}`}>
            <div><strong>Table {table.table_number}</strong>{table.is_current_assignment && <span>Current</span>}</div>
            <p><Users size={15} /> Up to {table.capacity} guests</p>
            <small>{table.physical_status === "occupied" ? `Occupied now · No conflict with ${intervalLabel(table)}` : `Available now · No conflict with ${intervalLabel(table)}`}</small>
            <button type="button" disabled={assigningId === table.id || table.is_current_assignment} onClick={() => assignTable(table)}>{table.is_current_assignment ? "Assigned" : assigningId === table.id ? "Assigning..." : "Assign this table"}</button>
          </article>)}</div>}
        </div>}
      </div>}
    </section>
  </div>;
};

export default ReservationDetailModal;
