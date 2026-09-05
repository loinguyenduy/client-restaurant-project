import React, { useCallback, useEffect, useRef, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { getAllOrdersAdminApi, updateOrderStatusApi } from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import formatCurrency from "../../utils/formatCurrency";
import { formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import ManagedOrderDetail from "./orders/ManagedOrderDetail";
import OrderFilters from "./orders/OrderFilters";
import "./orders/ManageOrders.scss";

const initialFilters = { page: 1, limit: 20, search: "", status: "all", paymentStatus: "all", fulfillmentType: "all", paymentMethod: "all", dateFrom: "", dateTo: "" };

const ManageOrders = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState({ orders: [], totalRows: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const socketTimerRef = useRef();
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchOrders = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getAllOrdersAdminApi({ ...filters, search: debouncedSearch });
      if (response?.EC !== 0) throw new Error(response?.EM);
      setData(response.DT || { orders: [], totalRows: 0, totalPages: 0 });
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Orders could not be loaded.");
    } finally { setIsLoading(false); }
  }, [debouncedSearch, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    const socket = getSocket();
    const queueRefresh = () => {
      clearTimeout(socketTimerRef.current);
      socketTimerRef.current = setTimeout(() => fetchOrders({ quiet: true }), 250);
    };
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) queueRefresh();
      hasConnectedRef.current = true;
    };
    socket.on("order:new", queueRefresh);
    socket.on("order:status_changed", queueRefresh);
    socket.on("order:items_added", queueRefresh);
    socket.on("payment:status_changed", queueRefresh);
    socket.on("connect", refreshOnReconnect);
    return () => {
      clearTimeout(socketTimerRef.current);
      socket.off("order:new", queueRefresh);
      socket.off("order:status_changed", queueRefresh);
      socket.off("order:items_added", queueRefresh);
      socket.off("payment:status_changed", queueRefresh);
      socket.off("connect", refreshOnReconnect);
    };
  }, [fetchOrders]);

  const updateStatus = async (order, nextStatus) => {
    const confirmation = await Swal.fire({ title: nextStatus === "completed" ? "Complete this order?" : "Cancel this order?", text: nextStatus === "completed" ? "For cash orders, completion also records payment as paid." : "Reserved stock will be restored. A paid PayOS order may require a manual refund.", icon: "warning", showCancelButton: true, confirmButtonText: nextStatus === "completed" ? "Complete order" : "Cancel order", confirmButtonColor: nextStatus === "completed" ? "#15803d" : "#b91c1c" });
    if (!confirmation.isConfirmed) return;
    setBusyOrderId(order.id);
    try {
      const response = await updateOrderStatusApi(order.id, nextStatus);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(nextStatus === "completed" ? "Order completed." : "Order cancelled.");
      await fetchOrders({ quiet: true });
    } catch (error) {
      toast.error(error?.EM || error?.message || "Order status could not be updated.");
    } finally { setBusyOrderId(null); }
  };

  const isExplicitDineIn = (order) => order.fulfillment_type === "dine_in" && order.source === "pos";
  const canCancel = (order) => isExplicitDineIn(order) ? order.order_status === "confirmed" : ["pending", "pending_payment", "confirmed", "preparing", "processing"].includes(order.order_status);
  const orders = data.orders || [];

  return <main className="managed-orders-page">
    <header className="managed-page-header"><div><h1>Manage Orders</h1><p>Search and audit orders here. Use Kitchen Display for preparation steps.</p></div><button type="button" onClick={() => fetchOrders()} disabled={isLoading}><RefreshCw size={16} /> Refresh</button></header>
    <OrderFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
    <section className="managed-order-card">
      {errorMessage && <div className="managed-order-state error"><p>{errorMessage}</p><button type="button" onClick={() => fetchOrders()}>Retry</button></div>}
      {!errorMessage && <div className="managed-order-table"><table><thead><tr><th>Order</th><th>Customer / Fulfillment</th><th>Created</th><th>Total</th><th>Payment</th><th>Order status</th><th>Actions</th></tr></thead><tbody>
        {isLoading ? <tr><td colSpan="7" className="managed-order-state">Loading orders...</td></tr> : orders.length === 0 ? <tr><td colSpan="7" className="managed-order-state">No orders match these filters.</td></tr> : orders.map((order) => <tr key={order.id}>
          <td data-label="Order"><strong>#{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.source ? formatStatus(order.source) : "Legacy source"}</small></td>
          <td data-label="Customer"><strong>{order.contact_name || order.User?.full_name || "Legacy / unknown"}</strong><small>{getFulfillmentLabel(order)}{order.Table ? ` · Table ${order.Table.table_number}` : ""}</small></td>
          <td data-label="Created"><strong>{new Date(order.createdAt).toLocaleDateString()}</strong><small>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></td>
          <td data-label="Total"><strong>{formatCurrency(order.final_amount)}</strong></td>
          <td data-label="Payment"><strong>{order.payment_method ? (order.payment_method === "card" ? "Legacy Card" : formatStatus(order.payment_method)) : "Legacy / unknown"}</strong><small className={`payment-${order.payment_status}`}>{formatStatus(order.payment_status)}</small></td>
          <td data-label="Status"><span className={`managed-status ${order.order_status}`}>{formatStatus(order.order_status)}</span></td>
          <td data-label="Actions"><div className="managed-order-actions">{order.order_status === "ready" && !isExplicitDineIn(order) && <button type="button" className="complete" disabled={busyOrderId === order.id} onClick={() => updateStatus(order, "completed")}>{order.fulfillment_type === "takeaway" ? "Complete Pickup" : "Complete Order"}</button>}{canCancel(order) && <button type="button" className="cancel" disabled={busyOrderId === order.id} onClick={() => updateStatus(order, "cancelled")}>Cancel</button>}<button type="button" className="view" onClick={() => setSelectedOrderId(order.id)} aria-label={`View order ${order.id}`}><Eye size={17} /> View</button></div></td>
        </tr>)}
      </tbody></table></div>}
      <footer className="managed-pagination"><span>{data.totalRows || 0} orders</span><label>Rows <select value={filters.limit} onChange={(event) => setFilters({ ...filters, limit: Number(event.target.value), page: 1 })}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label><div><button type="button" disabled={filters.page <= 1 || isLoading} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button><span>Page {filters.page} of {Math.max(data.totalPages || 1, 1)}</span><button type="button" disabled={filters.page >= (data.totalPages || 1) || isLoading} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button></div></footer>
    </section>
    {selectedOrderId && <ManagedOrderDetail orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
  </main>;
};

export default ManageOrders;
