import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, LogIn, LogOut, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { checkAttendanceStatusApi, checkInApi, checkOutApi, getOwnAttendanceHistoryApi } from "../../services/adminService";
import { formatDateTime } from "../../utils/orderDisplay";
import "./Attendance.scss";

const formatMinutes = (minutes) => minutes === null || minutes === undefined ? "Open shift" : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const Attendance = () => {
  const [status, setStatus] = useState({ isClockedIn: false, latestRecord: null, today: {} });
  const [history, setHistory] = useState({ logs: [], page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [page, setPage] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [current, logs] = await Promise.all([
        checkAttendanceStatusApi(),
        getOwnAttendanceHistoryApi({ page, limit: 15, ...filters }),
      ]);
      if (current?.EC !== 0) throw new Error(current?.EM);
      if (logs?.EC !== 0) throw new Error(logs?.EM);
      setStatus(current.DT);
      setHistory(logs.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Attendance could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!status.isClockedIn || !status.latestRecord) return undefined;
    const clientReference = Date.now();
    const serverReference = new Date(status.server_timestamp).getTime();
    const checkInTime = new Date(status.latestRecord.check_in_time).getTime();
    if (!Number.isFinite(checkInTime)) {
      setElapsed(0);
      return undefined;
    }
    const trustedReference = Number.isFinite(serverReference) ? serverReference : clientReference;
    const update = () => setElapsed(Math.max(0, Math.floor((trustedReference + Date.now() - clientReference - checkInTime) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const act = async (kind) => {
    if (kind === "out") {
      const confirmation = await Swal.fire({ title: "End this shift?", icon: "warning", showCancelButton: true, confirmButtonText: "Check out" });
      if (!confirmation.isConfirmed) return;
    }
    setBusy(true);
    try {
      const response = kind === "in" ? await checkInApi() : await checkOutApi();
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(kind === "in" ? "Checked in." : "Checked out.");
      await load();
    } catch (actionError) {
      toast.error(actionError?.EM || actionError?.message || "Attendance action failed.");
    } finally {
      setBusy(false);
    }
  };

  const elapsedLabel = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const today = status.today || {};

  return <main className="staff-attendance">
    <header><div><span>Staff self-service</span><h1>Attendance</h1><p>Your shift history is private to your account.</p></div><button type="button" onClick={load}><RefreshCw size={16} /> Refresh</button></header>
    {loading ? <div className="attendance-state">Loading attendance...</div> : error ? <div className="attendance-state error">{error}</div> : <>
      <section className={`shift-card ${status.isClockedIn ? "open" : "closed"}`}>
        <Clock3 />
        <div><span>Current status</span><h2>{status.isClockedIn ? "Checked In" : "Checked Out"}</h2>{status.latestRecord && <p>{status.isClockedIn ? `Started ${formatDateTime(status.latestRecord.check_in_time)}` : `Last shift ended ${formatDateTime(status.latestRecord.check_out_time)}`}</p>}</div>
        {status.isClockedIn ? <div className="shift-action"><small>Current session</small><strong>{elapsedLabel}</strong><button type="button" disabled={busy} onClick={() => act("out")}><LogOut size={17} /> Check out</button></div> : <div className="shift-action"><button type="button" disabled={busy} onClick={() => act("in")}><LogIn size={17} /> Check in</button></div>}
      </section>
      <section className="attendance-today" aria-label="Today's attendance summary">
        <article><CalendarDays /><div><span>Sessions today</span><strong>{Number(today.session_count || 0)}</strong></div></article>
        <article><Clock3 /><div><span>Completed time today</span><strong>{formatMinutes(Number(today.total_worked_minutes || 0))}</strong><small>Open session time is shown separately.</small></div></article>
      </section>
      <section className="attendance-history">
        <div className="attendance-history-heading"><div><h2>Your shift history</h2><p>Newest first. Shifts belong to the check-in date; overnight shifts are not split.</p></div><div><label>From<input type="date" value={filters.dateFrom} onChange={(event) => { setPage(1); setFilters((value) => ({ ...value, dateFrom: event.target.value })); }} /></label><label>To<input type="date" min={filters.dateFrom || undefined} value={filters.dateTo} onChange={(event) => { setPage(1); setFilters((value) => ({ ...value, dateTo: event.target.value })); }} /></label></div></div>
        {history.logs.length === 0 ? <div className="attendance-state">No shifts in this date range.</div> : <div className="attendance-log-list">{history.logs.map((log) => <article key={log.id} className={log.is_open ? "open" : log.has_invalid_duration ? "invalid" : "completed"}><div><strong>{new Date(log.check_in_time).toLocaleDateString()}</strong><small>{log.is_open ? "Open" : log.has_invalid_duration ? "Invalid" : "Completed"}</small></div><span data-label="Check in">{formatDateTime(log.check_in_time)}</span><span data-label="Check out">{log.check_out_time ? formatDateTime(log.check_out_time) : "—"}</span><strong data-label="Duration" className={log.has_invalid_duration ? "invalid" : ""}>{log.has_invalid_duration ? "Invalid duration" : formatMinutes(log.worked_minutes)}</strong></article>)}</div>}
        <footer><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {history.page || page} of {Math.max(history.totalPages || 1, 1)}</span><button type="button" disabled={page >= (history.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></footer>
      </section>
    </>}
  </main>;
};

export default Attendance;
