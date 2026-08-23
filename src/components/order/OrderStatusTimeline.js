import React from "react";
import { Check, Circle } from "lucide-react";
import { formatDateTime, formatStatus } from "../../utils/orderDisplay";

const trackedStatuses = ["confirmed", "preparing", "ready", "completed"];

const OrderStatusTimeline = ({ order }) => {
  const history = order.StatusHistory || [];
  if (history.length === 0) {
    return <div className="timeline-empty">Detailed status history is unavailable for this legacy order.</div>;
  }
  const historyByStatus = new Map(history.map((entry) => [entry.to_status, entry]));
  const cancelledEntry = historyByStatus.get("cancelled");
  const currentIndex = trackedStatuses.indexOf(order.order_status === "processing" ? "preparing" : order.order_status);
  return (
    <ol className="order-timeline">
      {trackedStatuses.map((status, index) => {
        const entry = historyByStatus.get(status);
        const complete = Boolean(entry) || currentIndex > index;
        const current = order.order_status === status || (order.order_status === "processing" && status === "preparing");
        return (
          <li key={status} className={`${complete ? "complete" : ""} ${current ? "current" : ""}`}>
            <span className="timeline-icon">{complete ? <Check size={14} /> : <Circle size={11} />}</span>
            <div><strong>{formatStatus(status)}</strong><time>{entry ? formatDateTime(entry.createdAt) : current ? "In progress" : "Pending"}</time></div>
          </li>
        );
      })}
      {cancelledEntry && <li className="cancelled complete"><span className="timeline-icon">×</span><div><strong>Cancelled</strong><time>{formatDateTime(cancelledEntry.createdAt)}</time></div></li>}
    </ol>
  );
};

export default OrderStatusTimeline;
