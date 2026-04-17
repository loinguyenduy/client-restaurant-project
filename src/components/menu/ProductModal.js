import React, { useState, useEffect } from 'react';
import { X, Clock, Flame, Minus, Plus, ShoppingBag } from 'lucide-react';
import "./ProductModal.scss";

const ProductModal = ({ product, categories, onClose, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product]);

  if (!product) return null; 

  const handleQtyChange = (val) => {
    let newQty = qty + val;
    if (newQty < 1) newQty = 1;
    if (newQty > product.stock_quantity) newQty = product.stock_quantity;
    setQty(newQty);
  };

  const matchedCategory = categories.find(category => category.id === product.category_id);
  const categoryName = matchedCategory ? matchedCategory.name : "Uncategorized";
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop propagation so clicking inside the modal doesn't close it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-body">
          <div className="modal-image-container">
            {product.is_signature && <span className="signature-badge">SIGNATURE DISH</span>}
            <img src={product.image_url} alt={product.name} className="modal-img" />
          </div>
          
          <div className="modal-details">
            <span className="modal-category">{categoryName}</span>
            <h2 className="modal-title">{product.name}</h2>
            <h3 className="modal-price">${parseFloat(product.price).toFixed(2)}</h3>
            <p className="modal-desc">{product.description}</p>

            <div className="modal-meta">
              <div className="meta-item"><Clock size={16} /> <span>{product.prep_time} mins</span></div>
              <div className="meta-item"><Flame size={16} /> <span>{product.calories} calories</span></div>
            </div>

            <div className="modal-actions">
              <div className="modal-qty">
                <button onClick={() => handleQtyChange(-1)}><Minus size={16} /></button>
                <span>{qty}</span>
                <button onClick={() => handleQtyChange(1)}><Plus size={16} /></button>
              </div>
              
              <button 
                className="modal-add-btn"
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose(); // Close modal automatically after adding
                }}
              >
                <ShoppingBag size={18} /> Add to Order - ${(parseFloat(product.price) * qty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;