import React, { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, CreditCard, ExternalLink, Loader, RefreshCw, X } from "lucide-react";
import { toast } from "react-toastify";
import { checkoutDineInOrderApi, getManagedOrderDetailsApi } from "../../../services/adminService";
import formatCurrency from "../../../utils/formatCurrency";
import { getSocket } from "../../../services/socketService";

const TableCheckoutModal = ({ orderId, onClose, onCompleted }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const submittingRef = useRef(false);
  const completionHandledRef = useRef(false);

  const finishCheckout = useCallback(async (completedOrder) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    await onCompleted(completedOrder);
  }, [onCompleted]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await getManagedOrderDetailsApi(orderId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrder(response.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "Checkout details could not be loaded.");
    } finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = getSocket();
    const refreshPayment = async (event) => {
      if (event?.orderId !== orderId) return;
      try {
        const response = await getManagedOrderDetailsApi(orderId);
        if (response?.EC !== 0) return;
        setOrder(response.DT);
        if (response.DT.order_status === "completed") await finishCheckout(response.DT);
      } catch (error) {
        // The current checkout state remains visible until a successful canonical refetch.
      }
    };
    socket.on("payment:status_changed", refreshPayment);
    return () => socket.off("payment:status_changed", refreshPayment);
  }, [finishCheckout, orderId]);

  const checkout = async (method) => {
    if (submittingRef.current || completionHandledRef.current) return;
    submittingRef.current = true;
    setSubmitting(method);
    try {
      const response = await checkoutDineInOrderApi(orderId, method);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrder(response.DT.order);
      if (method === "cash") {
        await finishCheckout(response.DT.order);
      } else {
        if (!response.DT.checkoutUrl) throw new Error("PayOS did not return a checkout URL.");
        setCheckoutUrl(response.DT.checkoutUrl);
        window.open(response.DT.checkoutUrl, "_blank", "noopener,noreferrer");
        toast.info("PayOS opened in a new tab. The table remains occupied until payment succeeds.");
      }
    } catch (checkoutError) {
      toast.error(checkoutError?.EM || checkoutError?.message || "Checkout could not be started.");
      await load();
    } finally {
      submittingRef.current = false;
      setSubmitting("");
    }
  };

  return <div className="table-checkout-overlay" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="table-checkout-title" onClick={(event) => event.stopPropagation()}>
    <header><div><small>Table checkout</small><h2 id="table-checkout-title">{order?.Table ? `Table ${order.Table.table_number}` : "Loading..."}</h2></div><button type="button" onClick={onClose} aria-label="Close checkout"><X /></button></header>
    {loading ? <div className="checkout-state"><Loader className="spin" /> Loading canonical order...</div> : error ? <div className="checkout-state error"><p>{error}</p><button type="button" onClick={load}><RefreshCw size={15} /> Retry</button></div> : order && <div className="table-checkout-body">
      <div className="checkout-session"><span>{order.reservation_id ? "Reservation" : "Walk-in"}</span><strong>{order.guest_count || "?"} guests</strong><small>{[order.contact_name, `Order #${order.id.slice(0, 8).toUpperCase()}`].filter(Boolean).join(" · ")}</small></div>
      <div className="checkout-items">{(order.OrderItems || []).map((item) => <div key={item.id}><span><strong>{item.quantity}×</strong> {item.product_name || item.Product?.name || "Legacy dish"}</span><strong>{formatCurrency(Number(item.price) * item.quantity)}</strong></div>)}</div>
      <dl><div><dt>Subtotal</dt><dd>{formatCurrency(order.total_amount)}</dd></div><div><dt>Tax (8%)</dt><dd>{formatCurrency(order.tax_price)}</dd></div><div className="final"><dt>Total</dt><dd>{formatCurrency(order.final_amount)}</dd></div><div><dt>Payment status</dt><dd>{order.payment_status}</dd></div></dl>
      {checkoutUrl && <div className="payos-attempt"><strong>PayOS payment is waiting</strong><p>Do not release the table until the webhook confirms payment.</p><button type="button" onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}><ExternalLink size={15} /> Re-open PayOS</button></div>}
      <div className="checkout-methods"><button type="button" disabled={Boolean(submitting)} onClick={() => checkout("cash")}><Banknote size={19} />{submitting === "cash" ? "Checking PayOS state..." : "Record Cash Payment"}</button><button type="button" disabled={Boolean(submitting)} onClick={() => checkout("payos")}><CreditCard size={19} />{submitting === "payos" ? "Creating secure link..." : checkoutUrl ? "Replace PayOS Attempt" : "Create PayOS Payment"}</button></div>
    </div>}
  </section></div>;
};

export default TableCheckoutModal;
