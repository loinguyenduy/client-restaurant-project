import React, { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, FileText, RefreshCw, X } from "lucide-react";
import { getManagedOrderDetailsApi } from "../../../services/adminService";
import { getSocket } from "../../../services/socketService";
import formatCurrency from "../../../utils/formatCurrency";
import { formatDateTime, formatStatus, getFulfillmentLabel } from "../../../utils/orderDisplay";
import OrderStatusTimeline from "../../order/OrderStatusTimeline";
import InvoiceModal from "../InvoiceModal";

const ManagedOrderDetail = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const timerRef = useRef();

  const loadOrder = useCallback(async () => {
    setError("");
    try {
      const response = await getManagedOrderDetailsApi(orderId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrder(response.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Order details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);
  useEffect(() => {
    const socket = getSocket();
    const refreshMatching = (event) => {
      if (event?.orderId !== orderId) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(loadOrder, 200);
    };
    socket.on("order:status_changed", refreshMatching);
    socket.on("payment:status_changed", refreshMatching);
    return () => {
      clearTimeout(timerRef.current);
      socket.off("order:status_changed", refreshMatching);
      socket.off("payment:status_changed", refreshMatching);
    };
  }, [loadOrder, orderId]);

  return (
    <div className="managed-detail-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="managed-detail" role="dialog" aria-modal="true" aria-labelledby="managed-order-title" onClick={(event) => event.stopPropagation()}>
        <header><div><span>Operational order detail</span><h2 id="managed-order-title">{order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Order detail"}</h2></div><button type="button" onClick={onClose} aria-label="Close order detail"><X /></button></header>
        {loading ? <div className="detail-state">Loading order detail...</div> : error ? <div className="detail-state error"><p>{error}</p><button type="button" onClick={loadOrder}><RefreshCw size={15} /> Retry</button></div> : order && <>
          <div className="managed-detail-meta"><div><span>Fulfillment</span><strong>{getFulfillmentLabel(order)}</strong></div><div><span>Source</span><strong>{order.source ? formatStatus(order.source) : "Legacy / unknown"}</strong></div><div><span>Created</span><strong>{formatDateTime(order.createdAt)}</strong></div><div><span>Status</span><strong>{formatStatus(order.order_status)}</strong></div></div>
          <div className="managed-detail-columns">
            <section><h3>Customer and payment</h3><dl><div><dt>Customer</dt><dd>{order.contact_name || order.User?.full_name || "Legacy / unknown"}</dd></div><div><dt>Phone</dt><dd>{order.phone_receiver || order.User?.phone_number || "—"}</dd></div>{order.Table && <div><dt>Table</dt><dd>{order.Table.table_number}</dd></div>}<div><dt>Payment</dt><dd>{order.payment_method ? formatStatus(order.payment_method) : "Legacy / unknown"} · {formatStatus(order.payment_status)}</dd></div>{order.transaction_id && <div><dt>Transaction</dt><dd className="break-value">{order.transaction_id}</dd></div>}</dl>{order.note && <div className="managed-note"><strong>Note</strong><p>{order.note}</p></div>}</section>
            <section><h3>Status history</h3>{order.estimated_ready_at && <div className="managed-eta"><Clock3 size={16} /> ETA {formatDateTime(order.estimated_ready_at)}</div>}<OrderStatusTimeline order={order} /></section>
          </div>
          <section className="managed-items"><h3>Items</h3>{(order.OrderItems || []).map((item) => <div key={item.id}><span><strong>{item.quantity}×</strong> {item.Product?.name || "Legacy dish"}</span><span>{formatCurrency(item.price)} each</span><strong>{formatCurrency(Number(item.price) * item.quantity)}</strong></div>)}</section>
          <div className="managed-totals"><div><span>Subtotal</span><strong>{formatCurrency(order.total_amount)}</strong></div>{Number(order.shipping_fee) > 0 && <div><span>Legacy shipping</span><strong>{formatCurrency(order.shipping_fee)}</strong></div>}{Number(order.tax_price) > 0 && <div><span>Tax</span><strong>{formatCurrency(order.tax_price)}</strong></div>}<div className="final"><span>Final amount</span><strong>{formatCurrency(order.final_amount)}</strong></div></div>
          <footer><button type="button" onClick={() => setShowInvoice(true)}><FileText size={16} /> View invoice</button></footer>
        </>}
      </section>
      {showInvoice && order && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
};

export default ManagedOrderDetail;
