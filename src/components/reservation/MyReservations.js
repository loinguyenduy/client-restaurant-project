import React, { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Loader, Plus, RefreshCw, Users, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { cancelReservationApi, getUserReservationsApi } from "../../services/reservationService";
import { getSocket } from "../../services/socketService";
import { formatReservationDate, formatReservationTime } from "../../utils/reservationTime";
import "./MyReservations.scss";

const terminalStatuses = ["completed", "cancelled", "no_show"];
const statusLabel = (status) => status === "pending" ? "Pending confirmation" : String(status || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ReservationCard = ({ reservation, cancellingId, onCancel }) => <article className={`res-card ${reservation.status}`}>
  <header className="card-header"><div><span className={`badge ${reservation.status}`}>{statusLabel(reservation.status)}</span><small>Booked {new Date(reservation.createdAt).toLocaleDateString()}</small></div></header>
  <div className="card-body"><div className="info-main"><div className="date-time"><label>Date & time</label><p className="primary-text">{formatReservationDate(reservation.reservation_time)}</p><p className="secondary-text">{formatReservationTime(reservation.reservation_time)}</p></div><div className="party-size"><label>Party size</label><div className="guest-count"><Users size={18} /><span>{reservation.number_of_people}</span></div></div></div><div className="info-contact">{reservation.Table?.table_number && <p className="assigned-table">Assigned table: <strong>{reservation.Table.table_number}</strong></p>}<p>Contact: <strong>{reservation.contact_name || "Legacy contact"}</strong></p><p>Phone: <strong>{reservation.contact_phone || "—"}</strong></p>{reservation.note && <p className="note">Note: “{reservation.note}”</p>}</div></div>
  {reservation.can_customer_cancel && <button type="button" className="btn-cancel" onClick={() => onCancel(reservation)} disabled={cancellingId === reservation.id}>{cancellingId === reservation.id ? <Loader size={14} className="spin" /> : <XCircle size={16} />} Cancel Reservation</button>}
</article>;

const MyReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(null);
  const hasConnectedRef = useRef(false);

  const fetchReservations = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setIsLoading(true);
    setError("");
    try {
      const response = await getUserReservationsApi();
      if (response?.EC !== 0) throw new Error(response?.EM);
      setReservations(response.DT || []);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Your reservations could not be loaded.");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);
  useEffect(() => {
    const socket = getSocket();
    const refresh = (event) => {
      if (event?.status === "confirmed") toast.success("Your reservation has been confirmed.");
      if (["cancelled", "no_show"].includes(event?.status)) toast.info(`Reservation marked ${statusLabel(event.status).toLowerCase()}.`);
      fetchReservations({ quiet: true });
    };
    const reconnect = () => { if (hasConnectedRef.current) fetchReservations({ quiet: true }); hasConnectedRef.current = true; };
    socket.on("reservation:status_changed", refresh);
    socket.on("reservation:assigned", refresh);
    socket.on("connect", reconnect);
    return () => { socket.off("reservation:status_changed", refresh); socket.off("reservation:assigned", refresh); socket.off("connect", reconnect); };
  }, [fetchReservations]);

  const handleCancel = async (reservation) => {
    const confirmation = await Swal.fire({ title: "Cancel this reservation?", text: `${formatReservationDate(reservation.reservation_time)} at ${formatReservationTime(reservation.reservation_time)}`, icon: "warning", showCancelButton: true, confirmButtonText: "Cancel reservation", confirmButtonColor: "#b91c1c" });
    if (!confirmation.isConfirmed) return;
    setIsCancelling(reservation.id);
    try {
      const response = await cancelReservationApi(reservation.id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Reservation cancelled.");
      await fetchReservations({ quiet: true });
    } catch (cancelError) { toast.error(cancelError?.EM || cancelError?.message || "Reservation could not be cancelled."); }
    finally { setIsCancelling(null); }
  };

  const active = reservations.filter((reservation) => !terminalStatuses.includes(reservation.status));
  const past = reservations.filter((reservation) => terminalStatuses.includes(reservation.status));
  if (isLoading) return <div className="reservations-loading"><Loader className="spin" /><p>Loading your bookings...</p></div>;

  return <main className="my-reservations-container">
    <header className="header-section"><div className="title-area"><h1>Your Reservations</h1><p>Review upcoming bookings and reservation history.</p></div><button type="button" className="btn-book-more" onClick={() => navigate("/reservation")}><Plus size={18} /> Book a Table</button></header>
    {error ? <div className="reservation-page-state error"><p>{error}</p><button type="button" onClick={() => fetchReservations()}><RefreshCw size={15} /> Retry</button></div> : reservations.length === 0 ? <div className="reservation-page-state"><Calendar size={30} /><h2>No reservations yet</h2><p>Choose a date and time for your next visit.</p><button type="button" onClick={() => navigate("/reservation")}>Book a Table</button></div> : <div className="reservation-groups">
      <section><h2><Calendar size={18} /> Upcoming & active <span>{active.length}</span></h2>{active.length ? <div className="reservations-grid">{active.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} cancellingId={isCancelling} onCancel={handleCancel} />)}</div> : <p className="group-empty">No active reservations.</p>}</section>
      <section><h2>Past <span>{past.length}</span></h2>{past.length ? <div className="reservations-grid">{past.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} cancellingId={isCancelling} onCancel={handleCancel} />)}</div> : <p className="group-empty">No reservation history.</p>}</section>
    </div>}
  </main>;
};

export default MyReservations;
