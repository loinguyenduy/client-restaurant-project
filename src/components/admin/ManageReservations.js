import React, { useCallback, useEffect, useRef, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { getAllReservationsAdminApi, updateReservationStatusApi } from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import { formatReservationDate, formatReservationTime } from "../../utils/reservationTime";
import ReservationDetailModal from "./reservations/ReservationDetailModal";
import ReservationFilters from "./reservations/ReservationFilters";
import "./reservations/ManageReservations.scss";

const initialFilters = { page: 1, limit: 20, search: "", scope: "upcoming", status: "all", partySize: "", dateFrom: "", dateTo: "" };
const label = (value) => String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ManageReservations = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState({ reservations: [], totalRows: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detailVersion, setDetailVersion] = useState(0);
  const socketTimer = useRef();
  const hasConnected = useRef(false);

  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350); return () => clearTimeout(timer); }, [filters.search]);
  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");
    try { const response = await getAllReservationsAdminApi({ ...filters, search: debouncedSearch }); if (response?.EC !== 0) throw new Error(response?.EM); setData(response.DT || { reservations: [], totalRows: 0, totalPages: 0 }); }
    catch (loadError) { setError(loadError?.EM || loadError?.message || "Reservations could not be loaded."); }
    finally { setLoading(false); }
  }, [debouncedSearch, filters]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const socket = getSocket();
    const queue = (event) => { clearTimeout(socketTimer.current); socketTimer.current = setTimeout(() => { load({ quiet: true }); if (event?.reservationId === selectedId) setDetailVersion((value) => value + 1); }, 250); };
    const incoming = (event) => { toast.info("A new reservation was received."); queue(event); };
    const reconnect = () => { if (hasConnected.current) queue(); hasConnected.current = true; };
    socket.on("reservation:new", incoming); socket.on("reservation:status_changed", queue); socket.on("reservation:assigned", queue); socket.on("connect", reconnect);
    return () => { clearTimeout(socketTimer.current); socket.off("reservation:new", incoming); socket.off("reservation:status_changed", queue); socket.off("reservation:assigned", queue); socket.off("connect", reconnect); };
  }, [load, selectedId]);

  const updateStatus = async (reservation, status) => {
    if (["cancelled", "no_show"].includes(status)) {
      const confirmation = await Swal.fire({ title: status === "cancelled" ? "Cancel this reservation?" : "Mark this guest as no-show?", text: "This action is terminal and cannot be reversed.", icon: "warning", showCancelButton: true, confirmButtonText: status === "cancelled" ? "Cancel reservation" : "Mark no-show", confirmButtonColor: "#b91c1c" });
      if (!confirmation.isConfirmed) return;
    }
    setBusyId(reservation.id);
    try { const response = await updateReservationStatusApi(reservation.id, status); if (response?.EC !== 0) throw new Error(response?.EM); toast.success(`Reservation marked ${label(status).toLowerCase()}.`); await load({ quiet: true }); if (selectedId === reservation.id) setDetailVersion((value) => value + 1); }
    catch (updateError) { toast.error(updateError?.EM || updateError?.message || "Reservation status could not be updated."); }
    finally { setBusyId(null); }
  };

  const reservations = data.reservations || [];
  return <main className="managed-reservations-page"><header><div><h1>Reservations</h1><p>Confirm new bookings and review upcoming guests. Seating remains outside this phase.</p></div><button type="button" onClick={() => load()} disabled={loading}><RefreshCw size={16} /> Refresh</button></header><ReservationFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
    <section className="reservation-list-card">{error ? <div className="reservation-list-state error"><p>{error}</p><button type="button" onClick={() => load()}>Retry</button></div> : <div className="reservation-table"><table><thead><tr><th>Date & time</th><th>Guest</th><th>Party</th><th>Assigned table</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="reservation-list-state">Loading reservations...</td></tr> : reservations.length === 0 ? <tr><td colSpan="6" className="reservation-list-state">No reservations match these filters.</td></tr> : reservations.map((reservation) => <tr key={reservation.id}><td data-label="Date & time"><strong>{formatReservationDate(reservation.reservation_time)}</strong><small>{formatReservationTime(reservation.reservation_time)}</small></td><td data-label="Guest"><strong>{reservation.contact_name || "Legacy / unknown"}</strong><small>{reservation.contact_phone || "No phone"}</small></td><td data-label="Party"><strong>{reservation.number_of_people} guests</strong></td><td data-label="Assigned table"><strong>{reservation.Table?.table_number ? `Table ${reservation.Table.table_number}` : "Not assigned"}</strong></td><td data-label="Status"><span className={`reservation-status ${reservation.status}`}>{label(reservation.status)}</span></td><td data-label="Actions"><div className="reservation-actions">{reservation.status === "pending" && <button type="button" className="confirm" disabled={busyId === reservation.id} onClick={() => updateStatus(reservation, "confirmed")}>Confirm</button>}{["pending", "confirmed"].includes(reservation.status) && <button type="button" className="cancel" disabled={busyId === reservation.id} onClick={() => updateStatus(reservation, "cancelled")}>Cancel</button>}{reservation.can_mark_no_show && <button type="button" className="no-show" disabled={busyId === reservation.id} onClick={() => updateStatus(reservation, "no_show")}>Mark No-show</button>}<button type="button" className="view" onClick={() => setSelectedId(reservation.id)}><Eye size={16} /> View</button></div></td></tr>)}</tbody></table></div>}
      <footer className="reservation-pagination"><span>{data.totalRows || 0} reservations</span><label>Rows <select value={filters.limit} onChange={(event) => setFilters({ ...filters, page: 1, limit: Number(event.target.value) })}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label><div><button type="button" disabled={filters.page <= 1 || loading} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button><span>Page {filters.page} of {Math.max(data.totalPages || 1, 1)}</span><button type="button" disabled={filters.page >= (data.totalPages || 1) || loading} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button></div></footer>
    </section>{selectedId && <ReservationDetailModal reservationId={selectedId} refreshKey={detailVersion} onClose={() => setSelectedId(null)} />}</main>;
};

export default ManageReservations;
