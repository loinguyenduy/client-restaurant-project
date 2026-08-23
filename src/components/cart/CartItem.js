import React, { useState } from "react";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { doRemoveCartItem, doSetCartFromServer, doUpdateCartItem } from "../../redux/actions/cartAction";
import { removeCartItemApi, updateCartItemApi } from "../../services/cartService";
import ProductImage from "../menu/ProductImage";
import formatCurrency from "../../utils/formatCurrency";

const CartItem = ({ item, issue }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const product = item.Product;
  const unavailable = !product || !product.is_available || product.stock_quantity <= 0;
  const lowStock = product && !unavailable && product.stock_quantity <= 5;

  const handleUpdateQuantity = async (newQuantity) => {
    if (isLoading || unavailable) return;
    if (newQuantity <= 0) return handleRemoveItem();
    if (newQuantity > product.stock_quantity) {
      setErrorMessage(`Only ${product.stock_quantity} are available.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      if (isAuthenticated) {
        const response = await updateCartItemApi(item.product_id, newQuantity);
        if (response?.EC !== 0) throw new Error(response?.EM);
        dispatch(doSetCartFromServer(response.DT));
      } else {
        dispatch(doUpdateCartItem(item.product_id, newQuantity));
      }
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Quantity could not be updated.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (isAuthenticated) {
        const response = await removeCartItemApi(item.product_id);
        if (response?.EC !== 0) throw new Error(response?.EM);
        dispatch(doSetCartFromServer(response.DT));
      } else {
        dispatch(doRemoveCartItem(item.product_id));
      }
      toast.success("Item removed from cart.");
    } catch (error) {
      setErrorMessage(error?.EM || error?.message || "Item could not be removed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className={`cart-item-card ${unavailable ? "has-issue" : ""}`}>
      <div className="item-image"><ProductImage src={product?.image_url} alt={product?.name || "Unavailable dish"} /></div>
      <div className="item-details">
        <div className="item-header">
          <h3 className="item-name">{product?.name || "Deleted dish"}</h3>
          {product && <span className="item-price">{formatCurrency(Number(product.price) * item.quantity)}</span>}
        </div>
        {product?.Category?.name && <p className="item-category">{product.Category.name}</p>}
        <p className={`item-stock ${unavailable ? "unavailable" : lowStock ? "low" : "available"}`}>
          {unavailable ? "Unavailable" : lowStock ? `Only ${product.stock_quantity} left` : "Available"}
        </p>
        {(issue?.message || errorMessage) && <p className="item-error"><AlertCircle size={13} />{errorMessage || issue.message}</p>}

        <div className="item-actions">
          <div className="quantity-control">
            <button className="qty-btn" onClick={() => handleUpdateQuantity(item.quantity - 1)} disabled={isLoading || unavailable} aria-label={`Decrease ${product?.name || "item"} quantity`}><Minus size={14} /></button>
            <span className="qty-number">{item.quantity}</span>
            <button className="qty-btn" onClick={() => handleUpdateQuantity(item.quantity + 1)} disabled={isLoading || unavailable || item.quantity >= product.stock_quantity} aria-label={`Increase ${product?.name || "item"} quantity`}><Plus size={14} /></button>
          </div>
          <button className="remove-btn" onClick={handleRemoveItem} disabled={isLoading}>{isLoading ? "Working..." : "Remove"}</button>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
