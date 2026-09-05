import React, { useEffect, useRef, useState } from "react";
import { ChefHat, Clock3, Loader, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { getKitchenOrdersApi, updateKitchenBatchStatusApi, updateOrderStatusApi } from "../../services/adminService";
import { getSocket } from "../../services/socketService";
import { formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import "./KitchenDisplay.scss";

const columns = [
  { key: "confirmed", label: "New / Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

const getColumn = (status) => status === "processing" ? "preparing" : status;
const getFallbackBatch = (order) => ({
  batch_id: null,
  kind: "legacy",
  status: getColumn(order.order_status),
  created_at: order.createdAt,
  items: order.OrderItems || [],
});

const KitchenCard = ({ order, batch, now, busyBatchKey, onTransition }) => {
  const batchKey = `${order.id}:${batch.batch_id || "legacy"}`;
  const elapsed = Math.max(0, Math.floor((now - new Date(batch.created_at || order.createdAt).getTime()) / 60000));
  const column = getColumn(batch.status);
  const isAddedBatch = batch.kind === "added";
  return (
    <article className={`kitchen-card ${column} ${isAddedBatch ? "added-batch" : ""}`}>
      <header><div><span>{order.fulfillment_type === "dine_in" ? `DINE IN · Table ${order.Table?.table_number || "?"}` : getFulfillmentLabel(order).toUpperCase()}</span><h3>#{order.id.slice(0, 8).toUpperCase()}</h3></div><time><Clock3 size={14} /> {elapsed} min</time></header>
      {order.fulfillment_type === "dine_in" && <div className="kitchen-session-context">{order.reservation_id ? "Reservation" : "Walk-in"} · {order.guest_count || "?"} guests</div>}
      <div className={`kitchen-batch-label ${isAddedBatch ? "new-items-badge" : ""}`}>{isAddedBatch ? "NEW ITEMS" : batch.kind === "legacy" ? "Legacy order ticket" : "Initial order"}</div>
      <ul>{(batch.items || []).map((item) => <li key={item.id}><strong>{item.quantity}×</strong><span>{item.product_name || item.Product?.name || "Legacy dish"}</span></li>)}</ul>
      {order.note && !isAddedBatch && <div className="kitchen-note"><strong>Note</strong><p>{order.note}</p></div>}
      <div className="kitchen-meta"><span>{isAddedBatch ? `Added ${new Date(batch.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : order.estimated_ready_at ? `ETA ${new Date(order.estimated_ready_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "ETA unavailable"}</span><span>{batch.has_inconsistent_status ? "Data issue" : formatStatus(batch.status)}</span></div>
      {batch.has_inconsistent_status && <div className="kitchen-batch-error">This batch has inconsistent item status. Contact an administrator.</div>}
      {column === "confirmed" && !batch.has_inconsistent_status && <button type="button" disabled={busyBatchKey === batchKey} onClick={() => onTransition(order, batch, "preparing")}>{busyBatchKey === batchKey ? <Loader className="spin" /> : "Start Preparing"}</button>}
      {column === "preparing" && !batch.has_inconsistent_status && <button type="button" disabled={busyBatchKey === batchKey} onClick={() => onTransition(order, batch, "ready")}>{busyBatchKey === batchKey ? <Loader className="spin" /> : "Mark Ready"}</button>}
      {column === "ready" && <div className="waiting-pickup">Waiting for pickup / service</div>}
    </article>
  );
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyBatchKey, setBusyBatchKey] = useState("");
  const [activeColumn, setActiveColumn] = useState("confirmed");
  const [now, setNow] = useState(Date.now());
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
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) loadKitchen();
      hasConnectedRef.current = true;
    };
    socket.on("order:new", refresh);
    socket.on("order:status_changed", refresh);
    socket.on("order:items_added", refresh);
    socket.on("order:kitchen_batch_changed", refresh);
    socket.on("connect", refreshOnReconnect);
    return () => {
      socket.off("order:new", refresh);
      socket.off("order:status_changed", refresh);
      socket.off("order:items_added", refresh);
      socket.off("order:kitchen_batch_changed", refresh);
      socket.off("connect", refreshOnReconnect);
    };
  }, []);

  const transition = async (order, batch, nextStatus) => {
    const batchKey = `${order.id}:${batch.batch_id || "legacy"}`;
    setBusyBatchKey(batchKey);
    try {
      const response = batch.batch_id
        ? await updateKitchenBatchStatusApi(order.id, batch.batch_id, nextStatus)
        : await updateOrderStatusApi(order.id, nextStatus);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(nextStatus === "ready" ? "Kitchen batch is ready." : "Kitchen batch preparation started.");
      await loadKitchen();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Kitchen work could not be updated.");
    } finally {
      setBusyBatchKey("");
    }
  };

  const tickets = orders.flatMap((order) => {
    const batches = order.kitchen_batches?.length ? order.kitchen_batches : [getFallbackBatch(order)];
    return batches.map((batch) => ({ order, batch }));
  });

  return (
    <main className="kitchen-display">
      <header className="kitchen-header"><div><span><ChefHat size={18} /> Restaurant operations</span><h1>Kitchen Display</h1><p>Live takeaway and dine-in preparation queue</p></div><div className="live-indicator"><i /> Live · {new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></header>
      <nav className="kitchen-tabs" aria-label="Kitchen status columns">{columns.map((column) => <button type="button" key={column.key} className={activeColumn === column.key ? "active" : ""} onClick={() => setActiveColumn(column.key)}>{column.label}<span>{tickets.filter(({ batch }) => getColumn(batch.status) === column.key).length}</span></button>)}</nav>
      {errorMessage && <div className="kitchen-state error" role="alert"><span>{errorMessage}</span><button type="button" onClick={loadKitchen}><RefreshCw size={15} /> Retry</button></div>}
      {isLoading ? <div className="kitchen-state">Loading kitchen queue...</div> : (
        <div className="kitchen-board">{columns.map((column) => {
          const columnTickets = tickets.filter(({ batch }) => getColumn(batch.status) === column.key);
          return <section key={column.key} className={`kitchen-column ${activeColumn === column.key ? "active" : ""}`}><header><h2>{column.label}</h2><span>{columnTickets.length}</span></header><div className="column-orders">{columnTickets.length === 0 ? <div className="empty-column">No kitchen work</div> : columnTickets.map(({ order, batch }) => <KitchenCard key={`${order.id}:${batch.batch_id || "legacy"}`} order={order} batch={batch} now={now} busyBatchKey={busyBatchKey} onTransition={transition} />)}</div></section>;
        })}</div>
      )}
    </main>
  );
};

export default KitchenDisplay;
