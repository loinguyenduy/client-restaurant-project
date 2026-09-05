import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { getStockMovementsApi } from "../../../services/adminService";
import { formatDateTime, formatStatus } from "../../../utils/orderDisplay";

const StockMovementHistoryModal = ({ product, onClose }) => {
  const [data, setData] = useState({ movements: [], page: 1, totalPages: 1 });
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await getStockMovementsApi(product.id, { page, limit: 15, type }); if (response?.EC !== 0) throw new Error(response?.EM); setData(response.DT); }
    catch (loadError) { setError(loadError?.EM || loadError?.message || "Movement history could not be loaded."); }
    finally { setLoading(false); }
  }, [page, product.id, type]);
  useEffect(() => { load(); }, [load]);
  return <div className="inventory-modal-overlay" role="presentation" onClick={onClose}><section className="movement-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
    <header><div><small>Immutable audit trail</small><h2>{product.name}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X /></button></header>
    <div className="movement-toolbar"><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="all">All types</option><option value="RESTOCK">Restock</option><option value="SALE">Sale</option><option value="ORDER_CANCELLATION">Order cancellation</option><option value="MANUAL_ADJUSTMENT">Manual adjustment</option></select><button type="button" onClick={load}><RefreshCw size={15} /> Refresh</button></div>
    {loading ? <div className="inventory-state">Loading history...</div> : error ? <div className="inventory-state error">{error}</div> : data.movements.length === 0 ? <div className="inventory-state">No stock movements recorded since inventory tracking began.</div> : <div className="movement-list">{data.movements.map((movement) => <article key={movement.id}><div><strong className={movement.quantity_change > 0 ? "positive" : "negative"}>{movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change}</strong><span>{formatStatus(movement.type)}</span><small>{formatDateTime(movement.createdAt)}</small></div><div><span>{movement.stock_before} → {movement.stock_after}</span><small>{movement.reference_type ? `${formatStatus(movement.reference_type)} #${String(movement.reference_id).slice(0, 8).toUpperCase()}` : "No reference"}</small></div><div><span>{movement.Actor?.full_name || "System"}</span><small>{movement.note || "No note"}</small></div></article>)}</div>}
    <footer className="inventory-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {data.page || page} of {Math.max(data.totalPages || 1, 1)}</span><button type="button" disabled={page >= (data.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></footer>
  </section></div>;
};
export default StockMovementHistoryModal;
