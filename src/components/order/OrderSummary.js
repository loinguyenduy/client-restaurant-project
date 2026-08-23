import React from "react";
import { Clock3, Loader, ShieldCheck } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";

const OrderSummary = ({
  cartItems,
  subtotal,
  taxAmount,
  total,
  estimatedPrepMinutes,
  isSubmitting,
  isBlocked,
}) => (
  <aside className="order-summary-section" aria-labelledby="summary-heading">
    <h2 id="summary-heading">Order Summary</h2>
    <div className="summary-items">
      {cartItems.map((item) => (
        <div className="summary-item" key={item.product_id}>
          <div className="item-info"><h3>{item.Product?.name}</h3><p>{item.quantity} × {formatCurrency(item.Product?.price)}</p></div>
          <strong>{formatCurrency(Number(item.Product?.price) * item.quantity)}</strong>
        </div>
      ))}
    </div>
    <div className="summary-calculations">
      <div className="calc-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
      <div className="calc-row"><span>Tax (8%)</span><span>{formatCurrency(taxAmount)}</span></div>
    </div>
    <div className="summary-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
    <div className="prep-estimate"><Clock3 size={18} /><span><small>Estimated preparation</small><strong>About {estimatedPrepMinutes} minutes</strong></span></div>
    <button type="submit" className="confirm-btn" disabled={isSubmitting || isBlocked}>
      {isSubmitting ? <><Loader size={17} className="spin" /> Placing order...</> : "Place takeaway order"}
    </button>
    <div className="secure-badge"><ShieldCheck size={16} /><span>Secure checkout powered by the restaurant</span></div>
  </aside>
);

export default OrderSummary;
