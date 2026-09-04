import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { getAllProductsAdminApi, getManagedOrderDetailsApi, getPosTablesApi } from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import PosOrderingWorkspace from "./pos/PosOrderingWorkspace";
import PosTableOverview from "./pos/PosTableOverview";
import TableCheckoutModal from "./pos/TableCheckoutModal";
import InvoiceModal from "./InvoiceModal";
import "./PosTerminal.scss";

const makeSelection = (table) => ({
  key: `${table.id}:${table.active_order?.id || table.seated_reservation?.id || "walkin"}`,
  table,
  order: table.active_order || null,
  mode: table.active_order ? "add" : "new",
});

const PosTerminal = () => {
  const [searchParams] = useSearchParams();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutOrderId, setCheckoutOrderId] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const contextResolved = useRef(false);
  const socketTimer = useRef();

  const loadTables = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const response = await getPosTablesApi();
      if (response?.EC !== 0 || !Array.isArray(response.DT)) throw new Error(response?.EM || "Unable to load POS tables.");
      const nextTables = response.DT;
      setTables(nextTables);
      setSelection((current) => {
        if (!current) return null;
        const refreshed = nextTables.find((table) => table.id === current.table.id);
        return refreshed ? makeSelection(refreshed) : null;
      });
      setError("");
      return nextTables;
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Unable to load POS tables.");
      return [];
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await getAllProductsAdminApi("all", 1, 100);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setProducts(response.DT?.products || []);
    } catch (loadError) {
      toast.error(loadError?.EM || loadError?.message || "Menu items could not be loaded.");
    }
  }, []);

  useEffect(() => { Promise.all([loadTables(), loadProducts()]); }, [loadProducts, loadTables]);
  useEffect(() => {
    if (contextResolved.current || loading || tables.length === 0) return;
    contextResolved.current = true;
    const tableId = searchParams.get("tableId");
    const reservationId = searchParams.get("reservationId");
    if (!tableId) return;
    const table = tables.find((item) => item.id === tableId);
    const reservationMatches = !reservationId || table?.seated_reservation?.id === reservationId || table?.active_order?.reservation_id === reservationId;
    if (!table || !reservationMatches) {
      toast.warning("The requested table session is no longer available. Select a current table session.");
      return;
    }
    if (table.active_order || table.can_start_reservation_order || table.can_start_walk_in) setSelection(makeSelection(table));
  }, [loading, searchParams, tables]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => {
      clearTimeout(socketTimer.current);
      socketTimer.current = setTimeout(() => { loadTables({ quiet: true }); loadProducts(); }, 250);
    };
    ["table:status_changed", "reservation:assigned", "reservation:status_changed", "order:new", "order:items_added", "order:status_changed", "product:availability_changed"].forEach((event) => socket.on(event, refresh));
    socket.on("connect", refresh);
    return () => {
      clearTimeout(socketTimer.current);
      ["table:status_changed", "reservation:assigned", "reservation:status_changed", "order:new", "order:items_added", "order:status_changed", "product:availability_changed"].forEach((event) => socket.off(event, refresh));
      socket.off("connect", refresh);
    };
  }, [loadProducts, loadTables]);

  const selectTable = (table) => {
    if (!table.active_order && !table.can_start_reservation_order && !table.can_start_walk_in) return;
    setSelection(makeSelection(table));
  };

  const refreshAll = async () => { await Promise.all([loadTables(), loadProducts()]); };

  const completeCheckout = async (completedOrder) => {
    const completedOrderId = completedOrder?.id;
    setCheckoutOrderId("");
    setSelection(null);
    const refreshPromise = refreshAll();
    if (!completedOrderId) {
      await refreshPromise;
      toast.error("Payment completed, but the final invoice could not be identified. Open it from Manage Orders.");
      return;
    }
    try {
      const response = await getManagedOrderDetailsApi(completedOrderId);
      if (response?.EC !== 0 || response.DT?.order_status !== "completed") {
        throw new Error(response?.EM || "The final invoice is not ready yet.");
      }
      setInvoiceOrder(response.DT);
      toast.success(response.DT.payment_method === "cash" ? "Cash payment recorded. Table checkout completed." : "PayOS payment confirmed. Table checkout completed.");
    } catch (loadError) {
      toast.error(loadError?.EM || loadError?.message || "Payment completed, but the invoice could not be loaded. Open it from Manage Orders.");
    } finally {
      await refreshPromise;
    }
  };

  return <main className="table-first-pos">
    <header className="pos-page-header"><div><span>Restaurant operations</span><h1>POS / Tables</h1><p>Select a live table session, then send food to the kitchen. Payment happens at Checkout Table.</p></div><button type="button" onClick={refreshAll} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh</button></header>
    {selection ? <PosOrderingWorkspace selection={selection} products={products} onClose={() => setSelection(null)} onCheckout={setCheckoutOrderId} onSuccess={async () => { setSelection(null); await refreshAll(); }} /> : <PosTableOverview tables={tables} loading={loading} error={error} selectedTableId="" onSelect={selectTable} onRefresh={refreshAll} />}
    {checkoutOrderId && <TableCheckoutModal orderId={checkoutOrderId} onClose={() => setCheckoutOrderId("")} onCompleted={completeCheckout} />}
    {!checkoutOrderId && invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
  </main>;
};

export default PosTerminal;
