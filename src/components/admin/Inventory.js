import React, { useCallback, useEffect, useState } from "react";
import { History, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { getInventoryApi } from "../../services/adminService";
import ProductImage from "../menu/ProductImage";
import StockAdjustmentModal from "./inventory/StockAdjustmentModal";
import StockMovementHistoryModal from "./inventory/StockMovementHistoryModal";
import "./Inventory.scss";

const Inventory = () => {
  const [data, setData] = useState({ products: [], page: 1, totalPages: 1, threshold: 5 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjusting, setAdjusting] = useState(null);
  const [history, setHistory] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await getInventoryApi({ page, limit: 20, search, status }); if (response?.EC !== 0) throw new Error(response?.EM); setData(response.DT); }
    catch (loadError) { setError(loadError?.EM || loadError?.message || "Inventory could not be loaded."); }
    finally { setLoading(false); }
  }, [page, search, status]);
  useEffect(() => { load(); }, [load]);
  const submitSearch = (event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  return <main className="inventory-page"><header><div><span>Product-level stock control</span><h1>Inventory</h1><p>Audit history starts from the Phase 16 inventory launch; existing stock is the opening state.</p></div><button type="button" onClick={load}><RefreshCw size={16} /> Refresh</button></header>
    <div className="inventory-toolbar"><form onSubmit={submitSearch}><Search size={17} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search dishes" /><button type="submit">Search</button></form><div>{[["all","All"],["low_stock","Low stock"],["sold_out","Sold out"]].map(([value,label]) => <button type="button" key={value} className={status === value ? "active" : ""} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>)}</div></div>
    {loading ? <div className="inventory-state">Loading inventory...</div> : error ? <div className="inventory-state error"><p>{error}</p><button type="button" onClick={load}>Retry</button></div> : data.products.length === 0 ? <div className="inventory-state">No products match this inventory view.</div> : <div className="inventory-table-wrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Manual flag</th><th>Effective status</th><th>Actions</th></tr></thead><tbody>{data.products.map((product) => <tr key={product.id}><td><ProductImage src={product.image_url} alt={product.name} /><span><strong>{product.name}</strong><small>{product.Category?.name || "Uncategorized"}</small></span></td><td><strong>{product.stock_quantity}</strong>{product.inventory_status === "low_stock" && <small className="low">Threshold ≤ {data.threshold}</small>}</td><td><span className={`inventory-badge ${product.is_available ? "available" : "unavailable"}`}>{product.is_available ? "Available" : "Unavailable"}</span></td><td><span className={`inventory-badge ${product.inventory_status}`}>{product.inventory_status === "sold_out" ? "Sold out" : product.effective_available ? product.inventory_status === "low_stock" ? "Low stock" : "In stock" : "Unavailable"}</span></td><td><button type="button" onClick={() => setAdjusting(product)}><SlidersHorizontal size={15} /> Adjust</button><button type="button" onClick={() => setHistory(product)}><History size={15} /> History</button></td></tr>)}</tbody></table></div>}
    <footer className="inventory-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {data.page || page} of {Math.max(data.totalPages || 1, 1)}</span><button type="button" disabled={page >= (data.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></footer>
    {adjusting && <StockAdjustmentModal product={adjusting} onClose={() => setAdjusting(null)} onSaved={async () => { setAdjusting(null); toast.success("Inventory updated."); await load(); }} />}
    {history && <StockMovementHistoryModal product={history} onClose={() => setHistory(null)} />}
  </main>;
};
export default Inventory;
