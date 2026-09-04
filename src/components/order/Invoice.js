import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserOrderDetailsApi } from "../../services/orderService";
import InvoiceDocument from "./InvoiceDocument";
import "./Invoice.scss";

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUserOrderDetailsApi(id);
      if (response?.EC !== 0) throw new Error(response?.EM);
      setOrder(response.DT);
    } catch (loadError) {
      setError(loadError?.EM || loadError?.message || "The receipt could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  return (
    <main className="invoice-page-container">
      <button type="button" className="invoice-back no-print" onClick={() => navigate(`/my-orders/${id}`)}><ArrowLeft size={17} /> Back to order</button>
      {loading ? <div className="invoice-state">Loading your order receipt...</div> : error ? <div className="invoice-state error"><p>{error}</p><button type="button" onClick={load}><RefreshCw size={16} /> Retry</button></div> : <InvoiceDocument order={order} variant="receipt" showPrint={false} />}
    </main>
  );
};

export default Invoice;
