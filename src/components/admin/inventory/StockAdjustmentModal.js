import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { adjustProductStockApi, restockProductApi } from "../../../services/adminService";

const StockAdjustmentModal = ({ product, onClose, onSaved }) => {
  const [mode, setMode] = useState("restock");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [makeAvailable, setMakeAvailable] = useState(Boolean(product?.is_available));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setMakeAvailable(Boolean(product?.is_available)); }, [product]);
  if (!product) return null;
  const change = Number(quantity || 0);
  const nextStock = Number(product.stock_quantity) + change;

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!Number.isInteger(change) || change === 0 || (mode === "restock" && change < 1)) { setError(mode === "restock" ? "Enter a positive restock quantity." : "Enter a non-zero signed adjustment."); return; }
    if (nextStock < 0) { setError("Stock cannot become negative."); return; }
    if (mode === "adjust" && !note.trim()) { setError("Manual adjustment requires a note."); return; }
    setBusy(true);
    try {
      const response = mode === "restock"
        ? await restockProductApi(product.id, { quantity: change, note: note.trim(), make_available: makeAvailable })
        : await adjustProductStockApi(product.id, { quantity_change: change, note: note.trim(), make_available: makeAvailable });
      if (response?.EC !== 0) throw new Error(response?.EM);
      await onSaved(response.DT.product);
    } catch (submitError) { setError(submitError?.EM || submitError?.message || "Inventory could not be updated."); }
    finally { setBusy(false); }
  };

  return <div className="inventory-modal-overlay" role="presentation" onClick={onClose}><form className="inventory-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
    <header><div><small>Stock adjustment</small><h2>{product.name}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X /></button></header>
    <div className="mode-switch"><button type="button" className={mode === "restock" ? "active" : ""} onClick={() => { setMode("restock"); setQuantity(""); }}>Restock</button><button type="button" className={mode === "adjust" ? "active" : ""} onClick={() => { setMode("adjust"); setQuantity(""); }}>Manual adjustment</button></div>
    <label>{mode === "restock" ? "Quantity to add" : "Signed stock change"}<input type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={mode === "restock" ? "10" : "-2 or 5"} /></label>
    <label>Note {mode === "adjust" && <span>(required)</span>}<textarea maxLength="500" value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <div className={`stock-preview ${nextStock < 0 ? "invalid" : ""}`}><span>Stock preview</span><strong>{product.stock_quantity} → {Number.isInteger(nextStock) ? nextStock : "—"}</strong></div>
    <label className="availability-choice"><input type="checkbox" checked={makeAvailable} disabled={Boolean(product.is_available)} onChange={(event) => setMakeAvailable(event.target.checked)} /><span>{product.is_available ? "Manual availability is already enabled" : "Make available for ordering"}<small>{product.is_available ? "The existing flag is preserved." : "Leave unchecked to preserve the current unavailable flag."}</small></span></label>
    {error && <div className="inventory-form-error" role="alert">{error}</div>}
    <footer><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={busy}>{busy ? "Saving..." : "Confirm change"}</button></footer>
  </form></div>;
};

export default StockAdjustmentModal;
