import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock3, Pencil, ReceiptText, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ProductImage from "../menu/ProductImage";
import { cancelOrderApi, getUserOrderDetailsApi, rePayOrderApi } from "../../services/orderService";
import formatCurrency from "../../utils/formatCurrency";
import { formatDateTime, formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import OrderStatusTimeline from "./OrderStatusTimeline";
import "./OrderDetail.scss";
import { getSocket } from "../../services/socketService";
import OrderReviewForm, { ReviewStars } from "../review/OrderReviewForm";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const hasConnectedRef = useRef(false);

  const loadOrder = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getUserOrderDetailsApi(id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrder(response.DT);
      setEditingReview(false);
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "The order could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]);

  useEffect(() => {
    const socket = getSocket();
    const refreshMatchingOrder = (event) => {
      if (event?.orderId !== id) return;
      if (event.newStatus === "ready") toast.success("Your order is ready for pickup.");
      if (event.paymentStatus === "paid") toast.success("Payment confirmed.");
      loadOrder();
    };
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) loadOrder();
      hasConnectedRef.current = true;
    };
    socket.on("order:status_changed", refreshMatchingOrder);
    socket.on("payment:status_changed", refreshMatchingOrder);
    socket.on("connect", refreshOnReconnect);
    return () => {
      socket.off("order:status_changed", refreshMatchingOrder);
      socket.off("payment:status_changed", refreshMatchingOrder);
      socket.off("connect", refreshOnReconnect);
    };
  }, [id]);

  const payAgain = async () => {
    setIsBusy(true);
    try {
      const response = await rePayOrderApi(order.id);
      if (!response?.DT?.checkoutUrl) throw new Error(response?.EM || "Payment link is unavailable.");
      window.location.assign(response.DT.checkoutUrl);
    } catch (error) {
      toast.error(error?.EM || error?.message || "Payment could not be opened.");
      setIsBusy(false);
    }
  };

  const cancelOrder = async () => {
    const confirmation = await Swal.fire({ title: "Cancel this unpaid order?", icon: "warning", showCancelButton: true, confirmButtonText: "Cancel order", confirmButtonColor: "#b91c1c" });
    if (!confirmation.isConfirmed) return;
    setIsBusy(true);
    try {
      const response = await cancelOrderApi(order.id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Order cancelled.");
      await loadOrder();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Order could not be cancelled.");
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) return <main className="order-detail-page"><div className="detail-state">Loading order...</div></main>;
  if (errorMessage) return <main className="order-detail-page"><div className="detail-state error"><p>{errorMessage}</p><button type="button" onClick={loadOrder}><RefreshCw size={16} /> Retry</button></div></main>;
  const canManagePayment = order.payment_method === "payos" && order.payment_status === "pending" && ["pending", "pending_payment"].includes(order.order_status);

  return (
    <main className="order-detail-page">
      <button type="button" className="detail-back" onClick={() => navigate("/my-orders")}><ArrowLeft size={17} /> My Orders</button>
      <header className="detail-header">
        <div><span>{getFulfillmentLabel(order)}</span><h1>Order #{order.id.slice(0, 8).toUpperCase()}</h1><p>Placed {formatDateTime(order.createdAt)}</p></div>
        <span className={`detail-status ${order.order_status}`}>{formatStatus(order.order_status)}</span>
      </header>
      {order.requires_manual_refund && <div className="detail-alert">This cancelled order was paid after cancellation. Contact the restaurant for a manual PayOS refund.</div>}
      <div className="detail-grid">
        <section className="tracking-panel"><h2>Order progress</h2>{order.estimated_ready_at && !["completed", "cancelled"].includes(order.order_status) && <div className="ready-time"><Clock3 /><span><small>Estimated ready</small><strong>{formatDateTime(order.estimated_ready_at)}</strong></span></div>}<OrderStatusTimeline order={order} /></section>
        <aside className="detail-summary"><h2>Order summary</h2>{order.contact_name && <div><span>Customer</span><strong>{order.contact_name}</strong></div>}{order.phone_receiver && <div><span>Phone</span><strong>{order.phone_receiver}</strong></div>}<div><span>Payment</span><strong>{formatStatus(order.payment_method)} · {formatStatus(order.payment_status)}</strong></div><div><span>Total</span><strong>{formatCurrency(order.final_amount)}</strong></div>{order.note && <div className="detail-note"><span>Note</span><p>{order.note}</p></div>}</aside>
      </div>
      <section className="detail-items"><h2>Items</h2>{(order.OrderItems || []).map((item) => <div className="detail-item" key={item.id}><ProductImage src={item.Product?.image_url} alt={item.product_name || item.Product?.name || "Dish"} /><div><strong>{item.product_name || item.Product?.name || "Legacy dish"}</strong><span>{item.quantity} × {formatCurrency(item.price)}</span></div><strong>{formatCurrency(Number(item.price) * item.quantity)}</strong></div>)}</section>
      {order.order_status === "completed" && <section className="order-review-section">
        <div className="order-review-heading"><div><span>{order.review ? "Your review" : "How was your experience?"}</span><h2>{order.review ? "Thank you for sharing" : "Review this order"}</h2></div>{order.review && !editingReview && <button type="button" onClick={() => setEditingReview(true)}><Pencil size={15} /> Edit Review</button>}</div>
        {order.review && !editingReview ? <div className="order-review-content"><ReviewStars value={order.review.rating} size={20} /><p>{order.review.comment}</p><small>{order.review.updatedAt && order.review.updatedAt !== order.review.createdAt ? `Updated ${formatDateTime(order.review.updatedAt)}` : `Submitted ${formatDateTime(order.review.createdAt)}`}</small>{order.review.status === "hidden" && <p className="review-hidden-note">This review is currently hidden by moderation.</p>}</div> : <OrderReviewForm orderId={order.id} review={order.review} onCancel={order.review ? () => setEditingReview(false) : undefined} onSaved={loadOrder} />}
      </section>}
      <div className="detail-actions">
        <button type="button" onClick={() => navigate(`/my-orders/${order.id}/invoice`)}><ReceiptText size={16} /> View receipt</button>
        {canManagePayment && <><button type="button" className="pay-action" onClick={payAgain} disabled={isBusy}>Pay with PayOS</button><button type="button" className="cancel-action" onClick={cancelOrder} disabled={isBusy}>Cancel order</button></>}
      </div>
    </main>
  );
};

export default OrderDetail;
