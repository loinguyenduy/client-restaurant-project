import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';
import "./ProductCard.scss";



const ProductCard = ({ product, onAddToCart, onOpenModal }) => {
  // this state is used to manage the quantity input locally within the card 
  const [localQty, setLocalQty] = useState(1);

  const handleQtyChange = (value) => {
    let newQty = localQty + value;
    if (newQty < 1) newQty = 1;
    if (newQty > product.stock_quantity) {
      toast.warning(`Only ${product.stock_quantity} left in stock!`);
      newQty = product.stock_quantity;
    }
    setLocalQty(newQty);
  };

  const handleManualInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > product.stock_quantity) val = product.stock_quantity;
    setLocalQty(val);
  };

  return (
    <div className="product-card">
      <div className="product-image" onClick={() => onOpenModal(product)}>
        {/* Render signature badge if true */}
        {product.is_signature && <span className="signature-badge">SIGNATURE</span>}
        <img src={product.image_url} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h3 className="product-name" onClick={() => onOpenModal(product)}>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>

        <div className="cart-action-group">
          <div className="quantity-control">
            <button className="qty-btn" onClick={() => handleQtyChange(-1)}><Minus size={14} /></button>
            <input type="number" className="qty-input" value={localQty} onChange={handleManualInput} />
            <button className="qty-btn" onClick={() => handleQtyChange(1)}><Plus size={14} /></button>
          </div>

          <button 
            className="add-to-cart-btn" 
            // Send event back to Parent with the product and the chosen quantity
            onClick={() => {
              onAddToCart(product, localQty);
              setLocalQty(1); // Reset to 1 after adding
            }}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;