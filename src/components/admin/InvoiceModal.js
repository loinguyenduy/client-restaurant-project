import React from "react";
import { X } from "lucide-react";
import InvoiceDocument from "../order/InvoiceDocument";
import "./InvoiceModal.scss";

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="invoice-modal-content" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Order invoice">
        <button type="button" className="close-btn no-print" onClick={onClose} aria-label="Close invoice"><X size={21} /></button>
        <InvoiceDocument order={order} variant="invoice" />
      </div>
    </div>
  );
};

export default InvoiceModal;
