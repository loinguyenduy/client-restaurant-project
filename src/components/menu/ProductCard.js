import React, { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import ProductImage from "./ProductImage";
import formatCurrency from "../../utils/formatCurrency";
import "./ProductCard.scss";

const ProductCard = ({ product, canOrder, onAddToCart, onOpenModal }) => {
  const [quantity, setQuantity] = useState(1);
  const isSoldOut = !product.is_available || product.stock_quantity <= 0;
  const isLowStock = !isSoldOut && product.stock_quantity <= 5;

  useEffect(() => {
    setQuantity(isSoldOut ? 0 : 1);
  }, [isSoldOut, product.id]);

  const changeQuantity = (change) => {
    if (isSoldOut) return;
    const nextQuantity = Math.max(1, Math.min(quantity + change, product.stock_quantity));
    if (quantity + change > product.stock_quantity) {
      toast.warning(`Only ${product.stock_quantity} of this dish are available.`);
    }
    setQuantity(nextQuantity);
  };

  const handleAdd = async () => {
    const added = await onAddToCart(product, quantity);
    if (added) setQuantity(1);
  };

  return (
    <article className={`product-card ${isSoldOut ? "sold-out" : ""}`}>
      <button className="product-image" onClick={() => onOpenModal(product)} aria-label={`View ${product.name}`}>
        <ProductImage src={product.image_url} alt={product.name} />
        <span className={`stock-badge ${isSoldOut ? "sold-out" : isLowStock ? "low-stock" : "available"}`}>
          {isSoldOut ? "Sold Out" : isLowStock ? `Only ${product.stock_quantity} left` : "Available"}
        </span>
      </button>

      <div className="product-info">
        <button className="product-name" onClick={() => onOpenModal(product)}>{product.name}</button>
        <p className="product-desc">{product.description || "A Royal Restaurant favorite."}</p>
        <span className="product-price">{formatCurrency(product.price)}</span>

        <div className="cart-action-group">
          <div className="quantity-control" aria-label={`${product.name} quantity`}>
            <button className="qty-btn" onClick={() => changeQuantity(-1)} disabled={isSoldOut || quantity <= 1}><Minus size={14} /></button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => changeQuantity(1)} disabled={isSoldOut || quantity >= product.stock_quantity}><Plus size={14} /></button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAdd} disabled={isSoldOut || !canOrder} aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
