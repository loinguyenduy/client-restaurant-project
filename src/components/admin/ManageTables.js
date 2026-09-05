import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  createTableApi,
  deleteTableApi,
  getAllTablesApi,
  updateTableApi,
  updateTableStatusApi,
} from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import TableFormModal from "./tables/TableFormModal";
import TableMap from "./tables/TableMap";
import "./tables/ManageTables.scss";

const ManageTables = () => {
  const isAdmin = useSelector((state) => state.auth.account.role === "admin");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [formTable, setFormTable] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const socketTimer = useRef();

  const loadTables = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const response = await getAllTablesApi();
      if (response?.EC !== 0 || !Array.isArray(response.DT)) {
        throw new Error(response?.EM || "Unable to load the table map.");
      }
      setTables(response.DT);
      setError("");
    } catch (requestError) {
      setError(requestError?.response?.data?.EM || requestError.message || "Unable to load the table map.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    const socket = getSocket();
    const queueRefresh = () => {
      clearTimeout(socketTimer.current);
      socketTimer.current = setTimeout(() => loadTables({ quiet: true }), 250);
    };
    socket.on("table:status_changed", queueRefresh);
    socket.on("connect", queueRefresh);
    return () => {
      clearTimeout(socketTimer.current);
      socket.off("table:status_changed", queueRefresh);
      socket.off("connect", queueRefresh);
    };
  }, [loadTables]);

  const openCreate = () => {
    setFormTable(null);
    setFormOpen(true);
  };

  const openEdit = (table) => {
    setFormTable(table);
    setFormOpen(true);
  };

  const saveTable = async (values) => {
    setFormBusy(true);
    try {
      const response = formTable
        ? await updateTableApi(formTable.id, values)
        : await createTableApi(values);
      if (response?.EC !== 0) throw new Error(response?.EM || "Unable to save table.");
      toast.success(formTable ? "Table details updated." : "Table created.");
      setFormOpen(false);
      setFormTable(null);
      await loadTables({ quiet: true });
    } catch (requestError) {
      toast.error(requestError?.response?.data?.EM || requestError.message || "Unable to save table.");
    } finally {
      setFormBusy(false);
    }
  };

  const changeStatus = async (table, status, confirmation) => {
    if (confirmation) {
      const result = await Swal.fire({
        title: "Confirm table status change",
        text: confirmation,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#b68b2e",
        confirmButtonText: "Continue",
      });
      if (!result.isConfirmed) return;
    }

    setBusyId(table.id);
    try {
      const response = await updateTableStatusApi(table.id, status);
      if (response?.EC !== 0) throw new Error(response?.EM || "Unable to update table status.");
      toast.success("Table status updated.");
      await loadTables({ quiet: true });
    } catch (requestError) {
      toast.error(requestError?.response?.data?.EM || requestError.message || "Unable to update table status.");
    } finally {
      setBusyId("");
    }
  };

  const removeTable = async (table) => {
    const result = await Swal.fire({
      title: `Delete ${table.table_number}?`,
      text: "Tables referenced by an order or reservation cannot be deleted. Use Out of Service instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b42318",
      confirmButtonText: "Delete table",
    });
    if (!result.isConfirmed) return;

    setBusyId(table.id);
    try {
      const response = await deleteTableApi(table.id);
      if (response?.EC !== 0) throw new Error(response?.EM || "Unable to delete table.");
      toast.success("Table deleted.");
      await loadTables({ quiet: true });
    } catch (requestError) {
      toast.error(requestError?.response?.data?.EM || requestError.message || "Unable to delete table.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="manage-tables-page">
      <header className="manage-tables-header">
        <div>
          <span className="page-eyebrow">Restaurant floor</span>
          <h1>Table Map</h1>
          <p>Physical table status and active dine-in orders. Occupancy is managed by POS and order completion.</p>
        </div>
        <div className="manage-tables-header-actions">
          <button type="button" className="secondary" onClick={() => loadTables()} disabled={loading}>
            <RefreshCw size={17} className={loading ? "spin" : ""} /> Refresh
          </button>
          {isAdmin && (
            <button type="button" className="primary" onClick={openCreate}>
              <Plus size={18} /> Create Table
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <section className="table-map-state" aria-live="polite">
          <RefreshCw className="spin" /> Loading table map...
        </section>
      ) : error ? (
        <section className="table-map-state error" role="alert">
          <strong>Table map is unavailable</strong>
          <p>{error}</p>
          <button type="button" onClick={() => loadTables()}>Try again</button>
        </section>
      ) : tables.length === 0 ? (
        <section className="table-map-state">
          <strong>No tables configured</strong>
          <p>{isAdmin ? "Create the first physical table to begin." : "Ask an administrator to configure the restaurant floor."}</p>
          {isAdmin && <button type="button" onClick={openCreate}>Create Table</button>}
        </section>
      ) : (
        <TableMap
          tables={tables}
          isAdmin={isAdmin}
          busyId={busyId}
          onStatus={changeStatus}
          onEdit={openEdit}
          onDelete={removeTable}
        />
      )}

      {formOpen && (
        <TableFormModal
          table={formTable}
          busy={formBusy}
          onClose={() => { if (!formBusy) setFormOpen(false); }}
          onSubmit={saveTable}
        />
      )}
    </main>
  );
};

export default ManageTables;
