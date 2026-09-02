import React, { useEffect, useMemo, useState } from "react";
import { Loader, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { addDineInItemsApi, createPosOrderApi } from "../../../services/adminService";
import formatCurrency from "../../../utils/formatCurrency";

const PosOrderingWorkspace = ({ selection, products, onSuccess, onClose, onCheckout }) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const table = selection.table;
  const isAdding = selection.mode === "add";
  const reservation = table.seated_reservation;
  const checkoutStarted = isAdding && Boolean(selection.order.payment_method || selection.order.transaction_id);

  useEffect(() => {
    setCart([]);
    setSearch("");
    setNote("");
    setGuestCount(1);
    setCustomerName("");
  }, [selection.key]);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.trim().toLowerCase())),
    [products, search],
  );
  const totals = useMemo(() => {
    const subtotal = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
    const tax = Math.round(subtotal * .08);
    return { subtotal, tax, final: subtotal + tax };
  }, [cart]);

  const changeQuantity = (product, delta) => {
    if (checkoutStarted || !product.is_available || Number(product.stock_quantity) <= 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.product_id === product.id);
      const nextQuantity = (existing?.quantity || 0) + delta;
      if (nextQuantity <= 0) return current.filter((item) => item.product_id !== product.id);
      if (nextQuantity > Number(product.stock_quantity)) {
        toast.warning(`Only ${product.stock_quantity} of ${product.name} are available.`);
        return current;
      }
      if (existing) return current.map((item) => item.product_id === product.id ? { ...item, quantity: nextQuantity } : item);
      return [...current, { product_id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const submit = async () => {
    if (checkoutStarted) return toast.warning("Checkout has started. Additional items are locked.");
    if (!cart.length) return toast.warning("Add at least one dish.");
    if (!isAdding && !reservation && (!Number.isInteger(Number(guestCount)) || Number(guestCount) < 1 || Number(guestCount) > Number(table.capacity))) {
      return toast.warning(`Guest count must be from 1 to ${table.capacity}.`);
    }
    if (!isAdding && !reservation && customerName.trim().length > 100) {
      return toast.warning("Customer name must be 100 characters or fewer.");
    }
    setSubmitting(true);
    try {
      const items = cart.map(({ product_id, quantity }) => ({ product_id, quantity }));
      const response = isAdding
        ? await addDineInItemsApi(selection.order.id, items)
        : await createPosOrderApi({
          table_id: table.id,
          reservation_id: reservation?.id || null,
          guest_count: reservation ? reservation.number_of_people : Number(guestCount),
          ...(!reservation ? { contact_name: customerName.trim() || null } : {}),
          items,
          note,
          replacement_order: table.session_state === "replacement_required",
        });
      if (response?.EC !== 0) throw new Error(response?.EM);
      toast.success(isAdding ? "Additional items sent to kitchen." : "Order sent to kitchen.");
      onSuccess(response.DT.order);
    } catch (error) {
      toast.error(error?.EM || error?.message || "The order could not be updated.");
    } finally {
      setSubmitting(false);
    }
  };

  const sessionContext = reservation
    ? [reservation.contact_name, `${reservation.number_of_people} guests`].filter(Boolean).join(" · ")
    : isAdding
      ? [`Order #${selection.order.id.slice(0, 8).toUpperCase()}`, `${selection.order.guest_count || "?"} guests`, selection.order.contact_name].filter(Boolean).join(" · ")
      : `Capacity ${table.capacity}`;

  return <section className="pos-ordering-workspace">
    <header>
      <div><small>{isAdding ? "Add More Items" : reservation ? "Reservation session" : "Walk-in session"}</small><h2>Table {table.table_number}</h2><p>{sessionContext}</p></div>
      <div className="pos-workspace-header-actions">{isAdding && selection.order.order_status === "ready" && <button type="button" className="checkout-table" onClick={() => onCheckout(selection.order.id)}>Checkout Table</button>}<button type="button" onClick={onClose}>Back to tables</button></div>
    </header>
    <div className="pos-workspace-columns">
      <div className="pos-product-browser">
        <label className="pos-product-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" /></label>
        <div className="pos-product-grid">{filteredProducts.map((product) => {
          const selected = cart.find((item) => item.product_id === product.id);
          const soldOut = !product.is_available || Number(product.stock_quantity) <= 0;
          return <article key={product.id} className={soldOut ? "sold-out" : ""}>
            <div className="pos-product-image">{product.image_url ? <img src={product.image_url} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>No image</span>}</div>
            <h3>{product.name}</h3><strong>{formatCurrency(product.price)}</strong><small>{soldOut ? "Sold Out" : `${product.stock_quantity} in stock`}</small>
            <div><button type="button" aria-label={`Remove ${product.name}`} disabled={!selected || checkoutStarted} onClick={() => changeQuantity(product, -1)}><Minus size={14} /></button><span>{selected?.quantity || 0}</span><button type="button" aria-label={`Add ${product.name}`} disabled={soldOut || checkoutStarted} onClick={() => changeQuantity(product, 1)}><Plus size={14} /></button></div>
          </article>;
        })}</div>
      </div>
      <aside className="pos-current-ticket">
        <h3>{isAdding ? "Additional items" : "Kitchen ticket"}</h3>
        {checkoutStarted && <p className="checkout-started-note">PayOS checkout has started. Additional items are locked; use Checkout Table to retry or switch safely to cash.</p>}
        {!isAdding && !reservation && <div className="walk-in-context"><div><strong>Start walk-in</strong><small>Table {table.table_number} · {table.capacity} seats</small></div><label>Guest count <span aria-hidden="true">*</span><input type="number" min="1" max={table.capacity} required value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} /></label><label>Customer name <small>Optional</small><input type="text" maxLength="100" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter customer name" /></label></div>}
        <div className="pos-ticket-items">{cart.length === 0 ? <p>No items selected.</p> : cart.map((item) => <div key={item.product_id}><span><strong>{item.quantity}×</strong> {item.name}</span><span>{formatCurrency(item.price * item.quantity)} <button type="button" disabled={checkoutStarted} onClick={() => setCart((current) => current.filter((entry) => entry.product_id !== item.product_id))}><Trash2 size={14} /></button></span></div>)}</div>
        {!isAdding && <label>Kitchen note<textarea maxLength="500" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Allergies or service notes" /></label>}
        <dl><div><dt>Subtotal</dt><dd>{formatCurrency(totals.subtotal)}</dd></div><div><dt>Tax (8%)</dt><dd>{formatCurrency(totals.tax)}</dd></div><div className="final"><dt>Current ticket</dt><dd>{formatCurrency(totals.final)}</dd></div></dl>
        <button type="button" className="send-kitchen" disabled={submitting || !cart.length || checkoutStarted} onClick={submit}>{submitting ? <Loader className="spin" /> : isAdding ? "Send Additional Items" : "Send to Kitchen"}</button>
        <small className="payment-later">Payment is collected later through Checkout Table.</small>
      </aside>
    </div>
  </section>;
};

export default PosOrderingWorkspace;
