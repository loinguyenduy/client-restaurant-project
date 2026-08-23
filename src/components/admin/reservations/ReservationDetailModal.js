import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { getManagedReservationDetailsApi } from "../../../services/adminService";
import { formatReservationDateTime } from "../../../utils/reservationTime";

const label = (value) => String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ReservationDetailModal = ({ reservationId, refreshKey, onClose }) => {
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try { const response = await getManagedReservationDetailsApi(reservationId); if (response?.EC !== 0) throw new Error(response?.EM); setReservation(response.DT); }
    catch (loadError) { setError(loadError?.EM || loadError?.message || "Reservation details could not be loaded."); }
  }, [reservationId]);
  useEffect(() => { load(); }, [load, refreshKey]);
  return <div className="reservation-detail-overlay" onClick={onClose} role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title" onClick={(event) => event.stopPropagation()}><header><div><span>Reservation detail</span><h2 id="reservation-detail-title">{reservation ? `#${reservation.id.slice(0, 8).toUpperCase()}` : "Loading..."}</h2></div><button type="button" onClick={onClose} aria-label="Close reservation detail"><X /></button></header>{error ? <div className="reservation-detail-state"><p>{error}</p><button type="button" onClick={load}><RefreshCw size={15} /> Retry</button></div> : reservation && <div className="reservation-detail-body"><span className={`reservation-status ${reservation.status}`}>{label(reservation.status)}</span><dl><div><dt>Date & time</dt><dd>{formatReservationDateTime(reservation.reservation_time)}</dd></div><div><dt>Party size</dt><dd>{reservation.number_of_people} guests</dd></div><div><dt>Contact</dt><dd>{reservation.contact_name || "Legacy / unknown"}</dd></div><div><dt>Phone</dt><dd>{reservation.contact_phone || "—"}</dd></div><div><dt>Customer account</dt><dd>{reservation.User?.full_name || reservation.User?.username || "Legacy / unknown"}</dd></div><div><dt>Created</dt><dd>{new Date(reservation.createdAt).toLocaleString()}</dd></div><div><dt>Last updated</dt><dd>{new Date(reservation.updatedAt).toLocaleString()}</dd></div>{reservation.Table && <div><dt>Legacy assigned table</dt><dd>{reservation.Table.table_number}</dd></div>}</dl>{reservation.note && <div className="reservation-detail-note"><strong>Special request</strong><p>{reservation.note}</p></div>}{reservation.status === "seated" && <p className="reservation-seating-note">This legacy/future seated reservation is read-only until the table-assignment workflow is implemented.</p>}</div>}</section></div>;
};

export default ReservationDetailModal;
