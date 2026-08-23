import React from "react";
import { Mail, MapPin, Phone, X } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";
import { formatDateTime, formatStatus, getFulfillmentLabel } from "../../utils/orderDisplay";
import "./InvoiceModal.scss";

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;
  const isOffline = order.type === "offline";
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="invoice-modal-content" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="managed-invoice-title">
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close invoice"><X size={22} /></button>
        <div className="invoice-paper">
          <div className="invoice-header">
            <div className="brand-info"><h2 className="brand-name">ROYAL<span>RESTAURANT</span></h2><div className="contact-line"><MapPin size={14} /> 123 Ho Tay Lake, Hanoi</div><div className="contact-line"><Phone size={14} /> +84 961998670</div><div className="contact-line"><Mail size={14} /> contact@royalrestaurant.com</div></div>
            <div className="invoice-meta"><h1 id="managed-invoice-title" className="invoice-title">INVOICE</h1><div className="meta-line">#{order.id.slice(0, 8).toUpperCase()}</div><div className="meta-line">{formatDateTime(order.createdAt)}</div><div className={`status-badge ${order.order_status}`}>{formatStatus(order.order_status)}</div></div>
          </div>
          <div className="invoice-details-row">
            <div className="details-col"><h5>Customer:</h5><div className="info-text bold">{order.contact_name || (isOffline ? "Walk-in Guest" : "Legacy Customer")}</div>{isOffline ? <div className="info-text table-highlight">Table: {order.Table?.table_number || "N/A"}</div> : <>{order.address && <div className="info-text">{order.address}</div>}<div className="info-text">{order.phone_receiver || "—"}</div></>}{order.note && <div className="info-text note">Note: {order.note}</div>}</div>
            <div className="details-col"><h5>Order Details:</h5><div className="detail-line"><span className="label">Payment:</span><span className="val">{formatStatus(order.payment_method)}</span></div><div className="detail-line"><span className="label">Fulfillment:</span><span className="val">{getFulfillmentLabel(order)}</span></div><div className="detail-line"><span className="label">Payment status:</span><span className={`val status-text ${order.payment_status}`}>{formatStatus(order.payment_status)}</span></div></div>
          </div>
          <table className="invoice-table"><thead><tr><th>Item</th><th className="text-center">Quantity</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead><tbody>{(order.OrderItems || []).map((item) => <tr key={item.id}><td className="item-name">{item.Product?.name || "Legacy dish"}</td><td className="text-center">{item.quantity}</td><td className="text-right">{formatCurrency(item.price)}</td><td className="text-right">{formatCurrency(Number(item.price) * item.quantity)}</td></tr>)}</tbody></table>
          <div className="invoice-summary"><div className="summary-box"><div className="summary-line"><span>Subtotal</span><span className="val">{formatCurrency(order.total_amount)}</span></div>{Number(order.shipping_fee) > 0 && <div className="summary-line"><span>Legacy shipping</span><span className="val">{formatCurrency(order.shipping_fee)}</span></div>}{Number(order.tax_price) > 0 && <div className="summary-line"><span>Tax</span><span className="val">{formatCurrency(order.tax_price)}</span></div>}<div className="total-line"><span>Total Amount</span><span>{formatCurrency(order.final_amount)}</span></div></div></div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
