import React, { useEffect, useState } from "react";
import { Clock, Minus, Plus, ShoppingBag, X } from "lucide-react";
import ProductImage from "./ProductImage";
import formatCurrency from "../../utils/formatCurrency";
import "./ProductModal.scss";

const ProductModal = ({ product, categories, canOrder, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    if (!product) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, product]);

  if (!product) return null;

  const isSoldOut = !product.is_available || product.stock_quantity <= 0;
  const categoryName = categories.find((category) => category.id === product.category_id)?.name || product.Category?.name || "Uncategorized";
  const prepTime = Number(product.prep_time_minutes) || 15;

  const changeQuantity = (change) => {
    if (isSoldOut) return;
    setQuantity((current) => Math.max(1, Math.min(current + change, product.stock_quantity)));
  };

  const handleAdd = async () => {
    const added = await onAddToCart(product, quantity);
    if (added) onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close product details"><X size={24} /></button>
        <div className="modal-body">
          <div className="modal-image-container">
            <ProductImage src={product.image_url} alt={product.name} className="modal-img" />
          </div>
          <div className="modal-details">
            <span className="modal-category">{categoryName}</span>
            <h2 id="product-modal-title" className="modal-title">{product.name}</h2>
            <h3 className="modal-price">{formatCurrency(product.price)}</h3>
            <p className="modal-desc">{product.description || "A Royal Restaurant favorite."}</p>
            <div className="modal-meta">
              <div className="meta-item"><Clock size={16} /><span>About {prepTime} minutes</span></div>
              <span className={`modal-stock ${isSoldOut ? "sold-out" : product.stock_quantity <= 5 ? "low-stock" : "available"}`}>
                {isSoldOut ? "Sold Out" : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left` : "Available"}
              </span>
            </div>
            <div className="modal-actions">
              <div className="modal-qty">
                <button onClick={() => changeQuantity(-1)} disabled={isSoldOut || quantity <= 1}><Minus size={16} /></button>
                <span>{isSoldOut ? 0 : quantity}</span>
                <button onClick={() => changeQuantity(1)} disabled={isSoldOut || quantity >= product.stock_quantity}><Plus size={16} /></button>
              </div>
              <button className="modal-add-btn" onClick={handleAdd} disabled={isSoldOut || !canOrder}>
                <ShoppingBag size={18} />
                {isSoldOut ? "Sold Out" : !canOrder ? "Customer ordering only" : `Add to Order — ${formatCurrency(Number(product.price) * quantity)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
