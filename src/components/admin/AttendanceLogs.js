import React, { useCallback, useEffect, useState } from "react";
import { Clock3, RefreshCw, Search, UserCheck, Users } from "lucide-react";
import { getAttendanceOverviewApi, getAttendanceReportLogsApi, getAttendanceSummaryApi } from "../../services/adminService";
import { formatDateTime } from "../../utils/orderDisplay";
import "./AttendanceLogs.scss";

const duration = (minutes) => `${Math.floor(Number(minutes || 0) / 60)}h ${Number(minutes || 0) % 60}m`;

const AttendanceLogs = () => {
  const [tab, setTab] = useState("summary");
  const [data, setData] = useState({ summaries: [], logs: [], page: 1, totalPages: 1 });
  const [overview, setOverview] = useState({ currently_checked_in_staff: 0, completed_session_count: 0, total_worked_minutes: 0, staff_represented: 0 });
  const [filters, setFilters] = useState({ search: "", dateFrom: "", dateTo: "", status: "all" });
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, page, limit: 20 };
      const overviewParams = { search: filters.search, dateFrom: filters.dateFrom, dateTo: filters.dateTo };
      const [overviewResponse, reportResponse] = await Promise.all([
        getAttendanceOverviewApi(overviewParams),
        tab === "summary" ? getAttendanceSummaryApi(params) : getAttendanceReportLogsApi(params),
      ]);
      if (overviewResponse?.EC !== 0) throw new Error(overviewResponse?.EM);
      if (reportResponse?.EC !== 0) throw new Error(reportResponse?.EM);
      setOverview(overviewResponse.DT);
      setData(reportResponse.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Attendance report could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, tab]);

  useEffect(() => { load(); }, [load]);

  const submit = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters((value) => ({ ...value, search: input.trim() }));
  };
  const periodLabel = filters.dateFrom || filters.dateTo
    ? `${filters.dateFrom || "First record"} → ${filters.dateTo || "Today"}`
    : "All recorded check-in dates";

  return <main className="attendance-report">
    <header><div><h1>Attendance Reports</h1><p>Shifts are attributed by check-in date. Full overnight duration remains with that date.</p></div><button type="button" onClick={load}><RefreshCw size={16} /> Refresh</button></header>
    <section className="attendance-overview" aria-label="Attendance overview">
      <article><UserCheck /><div><span>Checked in now</span><strong>{overview.currently_checked_in_staff || 0}</strong><small>Live snapshot</small></div></article>
      <article><Clock3 /><div><span>Completed sessions</span><strong>{overview.completed_session_count || 0}</strong><small>{periodLabel}</small></div></article>
      <article><Clock3 /><div><span>Total worked time</span><strong>{duration(overview.total_worked_minutes)}</strong><small>{periodLabel}</small></div></article>
      <article><Users /><div><span>Staff represented</span><strong>{overview.staff_represented || 0}</strong><small>{periodLabel}</small></div></article>
    </section>
    <div className="attendance-tabs"><button type="button" className={tab === "summary" ? "active" : ""} onClick={() => { setTab("summary"); setPage(1); }}>Staff summary</button><button type="button" className={tab === "logs" ? "active" : ""} onClick={() => { setTab("logs"); setPage(1); }}>Shift logs</button></div>
    <div className="attendance-report-toolbar">
      <form onSubmit={submit}><Search size={16} /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search staff" /><button type="submit">Search</button></form>
      <label><span>From</span><input type="date" value={filters.dateFrom} onChange={(event) => { setPage(1); setFilters((value) => ({ ...value, dateFrom: event.target.value })); }} /></label>
      <label><span>To</span><input type="date" min={filters.dateFrom || undefined} value={filters.dateTo} onChange={(event) => { setPage(1); setFilters((value) => ({ ...value, dateTo: event.target.value })); }} /></label>
      {tab === "logs" && <label><span>Status</span><select value={filters.status} onChange={(event) => { setPage(1); setFilters((value) => ({ ...value, status: event.target.value })); }}><option value="all">All shifts</option><option value="completed">Completed</option><option value="open">Open</option></select></label>}
    </div>
    {loading ? <div className="attendance-report-state">Loading report...</div> : error ? <div className="attendance-report-state error">{error}</div> : tab === "summary" ? <div className="attendance-report-table"><table><thead><tr><th>Staff</th><th>Sessions</th><th>Completed</th><th>Open in period</th><th>Total time</th><th>Average shift</th><th>Current state</th></tr></thead><tbody>{data.summaries?.length ? data.summaries.map((row) => <tr key={row.id}><td><strong>{row.full_name}</strong><small>{row.email}</small></td><td>{row.shift_count}</td><td>{row.completed_shift_count}</td><td>{row.open_shift_count}</td><td>{duration(row.total_worked_minutes)}</td><td>{duration(row.average_completed_shift_minutes)}</td><td><span className={`attendance-current ${row.is_currently_checked_in ? "open" : "closed"}`}>{row.is_currently_checked_in ? "Checked in" : "Checked out"}</span></td></tr>) : <tr><td colSpan="7">No staff records found.</td></tr>}</tbody></table></div> : <div className="attendance-report-table"><table><thead><tr><th>Staff</th><th>Check in</th><th>Check out</th><th>Status</th><th>Duration</th></tr></thead><tbody>{data.logs?.length ? data.logs.map((row) => <tr key={row.id}><td><strong>{row.User?.full_name}</strong><small>{row.User?.email}</small></td><td>{formatDateTime(row.check_in_time)}</td><td>{row.check_out_time ? formatDateTime(row.check_out_time) : "—"}</td><td>{row.is_open ? "Open" : row.has_invalid_duration ? "Invalid" : "Completed"}</td><td>{row.has_invalid_duration ? "Invalid" : row.is_open ? "In progress" : duration(row.worked_minutes)}</td></tr>) : <tr><td colSpan="5">No shift logs found.</td></tr>}</tbody></table></div>}
    <footer><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {data.page || page} of {Math.max(data.totalPages || 1, 1)}</span><button type="button" disabled={page >= (data.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></footer>
  </main>;
};

export default AttendanceLogs;
