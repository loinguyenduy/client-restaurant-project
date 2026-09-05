const formatStatus = (value) => String(value || "unknown")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (character) => character.toUpperCase());

const getFulfillmentLabel = (order) => {
  if (order.fulfillment_type === "takeaway") return "Takeaway";
  if (order.fulfillment_type === "dine_in") return "Dine-in";
  return order.type === "offline" ? "Legacy offline order" : "Legacy online order";
};

const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  : "—";

const isActiveOrder = (order) => !["completed", "cancelled"].includes(order.order_status);

export { formatDateTime, formatStatus, getFulfillmentLabel, isActiveOrder };
