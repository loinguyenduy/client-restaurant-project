import React, { useEffect, useRef, useState } from "react";
import { Clock3, Eye, MessageSquare, ReceiptText, RefreshCw, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ProductImage from "../menu/ProductImage";
import { cancelOrderApi, getUserOrdersApi, rePayOrderApi } from "../../services/orderService";
import formatCurrency from "../../utils/formatCurrency";
import { formatDateTime, formatStatus, getFulfillmentLabel, isActiveOrder } from "../../utils/orderDisplay";
import "./MyOrders.scss";
import { getSocket } from "../../services/socketService";
import OrderReviewForm from "../review/OrderReviewForm";

const OrderCard = ({ order, busyOrderId, onCancel, onPay, onDetails, onInvoice, onReview }) => {
  const canPay = order.payment_method === "payos" && order.payment_status === "pending" && ["pending", "pending_payment"].includes(order.order_status);
  const canCancel = canPay;
  const firstItems = (order.OrderItems || []).slice(0, 3);
  return (
    <article className={`order-card ${isActiveOrder(order) ? "active-order" : ""}`}>
      <header className="card-header">
        <div><span className="order-kind">{getFulfillmentLabel(order)}</span><h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3><time>{formatDateTime(order.createdAt)}</time></div>
        <span className={`status-badge ${order.order_status}`}>{formatStatus(order.order_status)}</span>
      </header>
      {order.requires_manual_refund && <div className="refund-warning">Payment arrived after cancellation. Contact the restaurant for a manual PayOS refund.</div>}
      <div className="card-body">
        <div className="items-list">
          {firstItems.map((item) => (
            <div className="order-item" key={item.id}>
              <ProductImage src={item.Product?.image_url} alt={item.product_name || item.Product?.name || "Dish"} />
              <div><strong>{item.product_name || item.Product?.name || "Legacy dish"}</strong><span>{item.quantity} × {formatCurrency(item.price)}</span></div>
            </div>
          ))}
          {(order.OrderItems?.length || 0) > 3 && <span className="more-items">+{order.OrderItems.length - 3} more items</span>}
        </div>
        <div className="order-facts">
          <div><span>Payment</span><strong>{formatStatus(order.payment_method)} · <em className={`payment-${order.payment_status}`}>{formatStatus(order.payment_status)}</em></strong></div>
          {order.estimated_ready_at && isActiveOrder(order) && <div className="eta"><span>Estimated ready</span><strong><Clock3 size={16} /> {formatDateTime(order.estimated_ready_at)}</strong></div>}
          <div><span>Total</span><strong className="order-total">{formatCurrency(order.final_amount)}</strong></div>
        </div>
      </div>
      <footer className="card-actions">
        {canPay && <button type="button" className="primary-action" disabled={busyOrderId === order.id} onClick={() => onPay(order.id)}>{busyOrderId === order.id ? "Opening PayOS..." : "Pay now"}</button>}
        {canCancel && <button type="button" className="danger-action" disabled={busyOrderId === order.id} onClick={() => onCancel(order.id)}>Cancel order</button>}
        <button type="button" onClick={() => onDetails(order.id)}><Eye size={16} /> {isActiveOrder(order) ? "Track order" : "View detail"}</button>
        <button type="button" onClick={() => onInvoice(order)}><ReceiptText size={16} /> Invoice</button>
        {order.order_status === "completed" && <button type="button" className="review-action" onClick={() => onReview(order)}><MessageSquare size={16} /> {order.review ? `Reviewed ${order.review.rating}★ · View / Edit` : "Write Review"}</button>}
      </footer>
    </article>
  );
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const hasConnectedRef = useRef(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getUserOrdersApi();
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrders(response.DT || []);
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Your orders could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const socket = getSocket();
    const refreshOrder = (event) => {
      if (event?.newStatus === "ready") toast.success("Your order is ready for pickup.");
      fetchOrders();
    };
    const refreshPayment = (event) => {
      if (event?.paymentStatus === "paid") toast.success("Payment confirmed.");
      fetchOrders();
    };
    const refreshOnReconnect = () => {
      if (hasConnectedRef.current) fetchOrders();
      hasConnectedRef.current = true;
    };
    socket.on("order:status_changed", refreshOrder);
    socket.on("payment:status_changed", refreshPayment);
    socket.on("connect", refreshOnReconnect);
    return () => {
      socket.off("order:status_changed", refreshOrder);
      socket.off("payment:status_changed", refreshPayment);
      socket.off("connect", refreshOnReconnect);
    };
  }, []);

  const handlePay = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      const response = await rePayOrderApi(orderId);
      if (response?.EC !== 0 || !response.DT?.checkoutUrl) throw new Error(response?.EM || "Payment link is unavailable.");
      window.location.assign(response.DT.checkoutUrl);
    } catch (error) {
      toast.error(error?.EM || error?.message || "Payment could not be opened.");
      setBusyOrderId(null);
    }
  };

  const handleCancel = async (orderId) => {
    const confirmation = await Swal.fire({
      title: "Cancel this unpaid order?",
      text: "Reserved stock will be returned. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancel order",
      confirmButtonColor: "#b91c1c",
    });
    if (!confirmation.isConfirmed) return;
    setBusyOrderId(orderId);
    try {
      const response = await cancelOrderApi(orderId);
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success("Order cancelled.");
      await fetchOrders();
    } catch (error) {
      toast.error(error?.EM || error?.message || "Order could not be cancelled.");
    } finally {
      setBusyOrderId(null);
    }
  };

  const activeOrders = orders.filter(isActiveOrder);
  const pastOrders = orders.filter((order) => !isActiveOrder(order));
  const renderSection = (title, sectionOrders) => sectionOrders.length > 0 && (
    <section className="orders-section"><h2>{title}</h2><div className="order-list">{sectionOrders.map((order) => (
      <OrderCard key={order.id} order={order} busyOrderId={busyOrderId} onPay={handlePay} onCancel={handleCancel} onDetails={(id) => navigate(`/my-orders/${id}`)} onInvoice={(selected) => navigate(`/my-orders/${selected.id}/invoice`)} onReview={setReviewOrder} />
    ))}</div></section>
  );

  return <>
    <main className="my-orders-container">
      <header className="orders-header"><span>Order history</span><h1>My Orders</h1><p>Track takeaway preparation and revisit your completed restaurant orders.</p></header>
      {isLoading ? <div className="orders-state">Loading your orders...</div>
        : errorMessage ? <div className="orders-state error" role="alert"><p>{errorMessage}</p><button type="button" onClick={fetchOrders}><RefreshCw size={16} /> Retry</button></div>
        : orders.length === 0 ? <div className="orders-state"><ShoppingBag size={40} /><h2>No orders yet</h2><p>Your takeaway orders and completed reservation visits will appear here.</p><button type="button" onClick={() => navigate("/menu")}>Explore the menu</button></div>
        : <>{renderSection("Active orders", activeOrders)}{renderSection("Past orders", pastOrders)}</>}
    </main>
    {reviewOrder && <div className="order-review-modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setReviewOrder(null); }}><section className="order-review-modal" role="dialog" aria-modal="true" aria-labelledby="order-review-modal-title"><header><div><span>{reviewOrder.review ? "Your review" : "How was your experience?"}</span><h2 id="order-review-modal-title">Order #{reviewOrder.id.slice(0, 8).toUpperCase()}</h2></div><button type="button" onClick={() => setReviewOrder(null)} aria-label="Close review form"><X size={20} /></button></header><OrderReviewForm orderId={reviewOrder.id} review={reviewOrder.review} onCancel={() => setReviewOrder(null)} onSaved={async () => { setReviewOrder(null); await fetchOrders(); }} /></section></div>}
  </>;
};

export default MyOrders;
