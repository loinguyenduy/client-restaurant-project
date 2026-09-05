import React from "react";
import { Printer } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";
import { formatDateTime, formatStatus } from "../../utils/orderDisplay";
import "./InvoiceDocument.scss";

const getOrderTypeLabel = (order) => {
  if (order.fulfillment_type === "takeaway") return "Takeaway";
  if (order.fulfillment_type === "dine_in") {
    return order.reservation_id ? "Dine In · Reservation" : "Dine In · Walk-in";
  }
  return order.type === "offline" ? "Legacy offline order" : "Legacy online order";
};

const getPaymentMethodLabel = (method) => {
  if (method === "cash") return "Cash";
  if (method === "payos") return "PayOS";
  if (method === "card") return "Legacy Card";
  return "Legacy Unknown";
};

const getCompletionDate = (order) => {
  const entry = (order.StatusHistory || []).find((item) => item.to_status === "completed");
  return entry?.createdAt || null;
};

const InvoiceDocument = ({ order, variant = "invoice", showPrint = true }) => {
  if (!order) return null;
  const isReceipt = variant === "receipt";
  const documentTitle = isReceipt ? "Order Receipt" : "Invoice";
  const completionDate = getCompletionDate(order);
  const customerName = String(order.contact_name || "").trim() || null;
  const reservationReference = order.reservation_id || order.Reservation?.id;
  const items = order.OrderItems || [];

  return (
    <div className="canonical-invoice-shell">
      {showPrint && (
        <div className="canonical-invoice-actions no-print">
          <button type="button" onClick={() => window.print()}><Printer size={17} /> Print Bill</button>
        </div>
      )}
      <article className={`canonical-invoice ${isReceipt ? "receipt-document" : "invoice-document"}`} aria-label={`${documentTitle} ${order.id}`}>
        <header className="canonical-invoice-header">
          <div><p className="eyebrow">ROYAL RESTAURANT</p><h1>{documentTitle}</h1></div>
          <dl>
            <div><dt>Order</dt><dd>#{String(order.id).slice(0, 8).toUpperCase()}</dd></div>
            <div><dt>Order date</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
            {completionDate && <div><dt>Completed</dt><dd>{formatDateTime(completionDate)}</dd></div>}
          </dl>
        </header>

        <section className="canonical-invoice-context">
          <dl>
            <div><dt>Order type</dt><dd>{getOrderTypeLabel(order)}</dd></div>
            {customerName && <div><dt>Customer</dt><dd>{customerName}</dd></div>}
            {order.Table?.table_number && <div><dt>Table</dt><dd>{order.Table.table_number}</dd></div>}
            {order.guest_count && <div><dt>Guests</dt><dd>{order.guest_count}</dd></div>}
            {reservationReference && <div><dt>Reservation</dt><dd>#{String(reservationReference).slice(0, 8).toUpperCase()}</dd></div>}
            {order.phone_receiver && <div><dt>Phone</dt><dd>{order.phone_receiver}</dd></div>}
          </dl>
          <dl>
            <div><dt>Payment method</dt><dd>{getPaymentMethodLabel(order.payment_method)}</dd></div>
            <div><dt>Payment status</dt><dd>{formatStatus(order.payment_status)}</dd></div>
            {order.transaction_id && <div><dt>Transaction</dt><dd className="break-value">{order.transaction_id}</dd></div>}
            <div><dt>Order status</dt><dd>{formatStatus(order.order_status)}</dd></div>
          </dl>
        </section>

        <div className="canonical-invoice-items-wrap">
          <table className="canonical-invoice-items">
            <thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name || item.Product?.name || "Legacy dish"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(Number(item.price) * Number(item.quantity))}</td>
                </tr>
              )) : <tr><td colSpan="4" className="empty-row">No item records are available.</td></tr>}
            </tbody>
          </table>
        </div>

        <section className="canonical-invoice-total">
          <div><span>Subtotal</span><strong>{formatCurrency(order.total_amount)}</strong></div>
          {Number(order.discount_amount) > 0 && <div><span>Discount</span><strong>-{formatCurrency(order.discount_amount)}</strong></div>}
          {Number(order.shipping_fee) > 0 && <div><span>Legacy shipping</span><strong>{formatCurrency(order.shipping_fee)}</strong></div>}
          <div><span>Tax</span><strong>{formatCurrency(Number(order.tax_price || 0))}</strong></div>
          <div className="grand-total"><span>Final total</span><strong>{formatCurrency(order.final_amount)}</strong></div>
        </section>
        {order.note && <section className="canonical-invoice-note"><strong>Order note</strong><p>{order.note}</p></section>}
      </article>
    </div>
  );
};

export { getOrderTypeLabel, getPaymentMethodLabel };
export default InvoiceDocument;
