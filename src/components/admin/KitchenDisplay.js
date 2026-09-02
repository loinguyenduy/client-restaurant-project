import React, { useEffect, useRef, useState } from "react";
import { ChefHat, Clock3, Loader, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { getKitchenOrdersApi, updateOrderStatusApi } from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import { formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import "./KitchenDisplay.scss";

const columns = [
  { key: "confirmed", label: "New / Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

const getColumn = (status) => status === "processing" ? "preparing" : status;

const KitchenCard = ({ order, now, busyOrderId, onTransition, hasNewItems }) => {
  const history = order.StatusHistory || [];
  const confirmedAt = history.find((entry) => entry.to_status === "confirmed")?.createdAt || order.createdAt;
  const elapsed = Math.max(0, Math.floor((now - new Date(confirmedAt).getTime()) / 60000));
  const column = getColumn(order.order_status);
  return (
    <article className={`kitchen-card ${column}`}>
      <header><div><span>{order.fulfillment_type === "dine_in" ? `DINE IN · Table ${order.Table?.table_number || "?"}` : getFulfillmentLabel(order).toUpperCase()}</span><h3>#{order.id.slice(0, 8).toUpperCase()}</h3></div><time><Clock3 size={14} /> {elapsed} min</time></header>
      {order.fulfillment_type === "dine_in" && <div className="kitchen-session-context">{order.reservation_id ? "Reservation" : "Walk-in"} · {order.guest_count || "?"} guests</div>}
      {hasNewItems && <div className="new-items-badge">New items added</div>}
      <ul>{(order.OrderItems || []).map((item) => <li key={item.id}><strong>{item.quantity}×</strong><span>{item.Product?.name || "Legacy dish"}</span></li>)}</ul>
      {order.note && <div className="kitchen-note"><strong>Note</strong><p>{order.note}</p></div>}
      <div className="kitchen-meta"><span>{order.estimated_ready_at ? `ETA ${new Date(order.estimated_ready_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "ETA unavailable"}</span><span>{formatStatus(order.order_status)}</span></div>
      {column === "confirmed" && <button type="button" disabled={busyOrderId === order.id} onClick={() => onTransition(order, "preparing")}>{busyOrderId === order.id ? <Loader className="spin" /> : "Start Preparing"}</button>}
      {column === "preparing" && <button type="button" disabled={busyOrderId === order.id} onClick={() => onTransition(order, "ready")}>{busyOrderId === order.id ? <Loader className="spin" /> : "Mark Ready"}</button>}
      {column === "ready" && <div className="waiting-pickup">Waiting for pickup / service</div>}
    </article>
  );
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [activeColumn, setActiveColumn] = useState("confirmed");
  const [now, setNow] = useState(Date.now());
  const [newItemOrders, setNewItemOrders] = useState({});
  const newItemTimers = useRef({});
  const hasConnectedRef = useRef(false);

  const loadKitchen = async () => {
    setErrorMessage("");
    try {
      const response = await getKitchenOrdersApi();
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrders(response.DT || []);
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Kitchen orders could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadKitchen(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const socket = getSocket();
    const refresh = () => loadKitchen();
    const refreshItems = (event) => {
      if (event?.orderId) {
        setNewItemOrders((current) => ({ ...current, [event.orderId]: true }));
        clearTimeout(newItemTimers.current[event.orderId]);
        newItemTimers.current[event.orderId] = setTimeout(() => setNewItemOrders((current) => {
          const next = { ...current };
          delete next[event.orderId];
          return next;
        }), 15000);
      }
      loadKitchen();
    };
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) loadKitchen();
      hasConnectedRef.current = true;
    };
    socket.on("order:new", refresh);
    socket.on("order:status_changed", refresh);
    socket.on("order:items_added", refreshItems);
    socket.on("connect", refreshOnReconnect);
    return () => {
      socket.off("order:new", refresh);
      socket.off("order:status_changed", refresh);
      socket.off("order:items_added", refreshItems);
      socket.off("connect", refreshOnReconnect);
      Object.values(newItemTimers.current).forEach(clearTimeout);
    };
  }, []);

  const transition = async (order, nextStatus) => {
    setBusyOrderId(order.id);
    try {
      const response = await updateOrderStatusApi(order.id, nextStatus);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(nextStatus === "ready" ? "Order is ready." : "Preparation started.");
      await loadKitchen();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Order could not be updated.");
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <main className="kitchen-display">
      <header className="kitchen-header"><div><span><ChefHat size={18} /> Restaurant operations</span><h1>Kitchen Display</h1><p>Live takeaway and dine-in preparation queue</p></div><div className="live-indicator"><i /> Live · {new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></header>
      <nav className="kitchen-tabs" aria-label="Kitchen status columns">{columns.map((column) => <button type="button" key={column.key} className={activeColumn === column.key ? "active" : ""} onClick={() => setActiveColumn(column.key)}>{column.label}<span>{orders.filter((order) => getColumn(order.order_status) === column.key).length}</span></button>)}</nav>
      {errorMessage && <div className="kitchen-state error" role="alert"><span>{errorMessage}</span><button type="button" onClick={loadKitchen}><RefreshCw size={15} /> Retry</button></div>}
      {isLoading ? <div className="kitchen-state">Loading kitchen queue...</div> : (
        <div className="kitchen-board">{columns.map((column) => {
          const columnOrders = orders.filter((order) => getColumn(order.order_status) === column.key);
          return <section key={column.key} className={`kitchen-column ${activeColumn === column.key ? "active" : ""}`}><header><h2>{column.label}</h2><span>{columnOrders.length}</span></header><div className="column-orders">{columnOrders.length === 0 ? <div className="empty-column">No orders</div> : columnOrders.map((order) => <KitchenCard key={order.id} order={order} now={now} busyOrderId={busyOrderId} onTransition={transition} hasNewItems={Boolean(newItemOrders[order.id])} />)}</div></section>;
        })}</div>
      )}
    </main>
  );
};

export default KitchenDisplay;
