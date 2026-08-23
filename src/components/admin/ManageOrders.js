import React, { useEffect, useRef, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { getAllOrdersAdminApi, updateOrderStatusApi } from "../../services/adminService";
import formatCurrency from "../../utils/formatCurrency";
import { formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import "./AdminTable.scss";
import InvoiceModal from "./InvoiceModal";
import { getSocket } from "../../services/socketService";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const hasConnectedRef = useRef(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getAllOrdersAdminApi(1, 50, "all");
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrders(response.DT.orders || []);
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Orders could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => fetchOrders();
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) fetchOrders();
      hasConnectedRef.current = true;
    };
    socket.on("order:new", refresh);
    socket.on("order:status_changed", refresh);
    socket.on("payment:status_changed", refresh);
    socket.on("connect", refreshOnReconnect);
    return () => {
      socket.off("order:new", refresh);
      socket.off("order:status_changed", refresh);
      socket.off("payment:status_changed", refresh);
      socket.off("connect", refreshOnReconnect);
    };
  }, []);

  const updateStatus = async (order, nextStatus) => {
    if (["cancelled", "completed"].includes(nextStatus)) {
      const confirmation = await Swal.fire({
        title: nextStatus === "completed" ? "Complete this order?" : "Cancel this order?",
        text: nextStatus === "completed"
          ? "For cash orders, this also records payment as paid."
          : "Reserved stock will be restored. Paid PayOS orders require a manual refund.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: nextStatus === "completed" ? "Complete order" : "Cancel order",
        confirmButtonColor: nextStatus === "completed" ? "#15803d" : "#b91c1c",
      });
      if (!confirmation.isConfirmed) return;
    }
    setBusyOrderId(order.id);
    try {
      const response = await updateOrderStatusApi(order.id, nextStatus);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(`Order moved to ${formatStatus(nextStatus)}.`);
      await fetchOrders();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Order status could not be updated.");
    } finally {
      setBusyOrderId(null);
    }
  };

  const canCancel = (order) => ["pending", "pending_payment", "confirmed", "preparing", "processing"].includes(order.order_status);

  return (
    <main className="admin-page-container">
      <div className="page-header"><div><h1>Manage Orders</h1><p>Use Kitchen Display for preparation steps. Complete pickup here when an order is ready.</p></div><button type="button" className="refresh-button" onClick={fetchOrders} disabled={isLoading}><RefreshCw size={16} /> Refresh</button></div>
      <div className="table-card">
        <div className="table-responsive"><table><thead><tr><th>ORDER</th><th>DATE & TIME</th><th>CONTACT / TABLE</th><th>AMOUNT</th><th>PAYMENT</th><th>STATUS & ACTIONS</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="6" className="empty-state">Loading orders...</td></tr>
              : errorMessage ? <tr><td colSpan="6" className="empty-state error-state">{errorMessage}</td></tr>
              : orders.length === 0 ? <tr><td colSpan="6" className="empty-state">No orders found.</td></tr>
              : orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="primary-text">#{order.id.slice(0, 8).toUpperCase()}</span><span className="secondary-text">{getFulfillmentLabel(order)} · {order.OrderItems?.length || 0} items</span></td>
                  <td><span className="primary-text">{new Date(order.createdAt).toLocaleDateString()}</span><span className="secondary-text">{new Date(order.createdAt).toLocaleTimeString()}</span></td>
                  <td><span className="primary-text">{order.contact_name || order.phone_receiver || "Walk-in guest"}</span><span className="secondary-text">{order.Table ? `Table ${order.Table.table_number}` : order.phone_receiver || "No contact"}</span></td>
                  <td><span className="primary-text">{formatCurrency(order.final_amount)}</span></td>
                  <td><span className="primary-text">{formatStatus(order.payment_method)}</span><span className={`secondary-text payment-${order.payment_status}`}>{formatStatus(order.payment_status)}</span></td>
                  <td><div className="order-action-cell"><span className={`managed-status ${order.order_status}`}>{formatStatus(order.order_status)}</span><div className="context-actions">{order.order_status === "ready" && <button type="button" className="complete-button" disabled={busyOrderId === order.id} onClick={() => updateStatus(order, "completed")}>{order.fulfillment_type === "takeaway" ? "Complete Pickup" : "Complete Order"}</button>}{canCancel(order) && <button type="button" className="cancel-button" disabled={busyOrderId === order.id} onClick={() => updateStatus(order, "cancelled")}>Cancel</button>}<button type="button" className="icon-button" onClick={() => setSelectedOrder(order)} aria-label="View invoice"><Eye size={18} /></button></div></div></td>
                </tr>
              ))}
          </tbody>
        </table></div>
      </div>
      {selectedOrder && <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </main>
  );
};

export default ManageOrders;
