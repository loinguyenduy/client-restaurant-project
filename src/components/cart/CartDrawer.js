import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader, ShoppingBag, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doSetCartFromServer, doToggleCart } from "../../redux/actions/cartAction";
import { validateGuestCartApi } from "../../services/cartService";
import CartItem from "./CartItem";
import "./Cart.scss";
import formatCurrency from "../../utils/formatCurrency";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, isCartOpen, issues, ownerId, totalPrice } = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const validatedForCurrentOpen = useRef(false);

  useEffect(() => {
    if (!isCartOpen) {
      validatedForCurrentOpen.current = false;
      setValidationError("");
      return;
    }
    if (isAuthenticated || ownerId || cartItems.length === 0 || validatedForCurrentOpen.current) return;

    validatedForCurrentOpen.current = true;
    const validateCart = async () => {
      setIsValidating(true);
      setValidationError("");
      try {
        const response = await validateGuestCartApi(cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })));
        if (response?.EC !== 0) throw new Error(response?.EM);

        dispatch(doSetCartFromServer(response.DT));
        const adjustments = response.DT?.issues || [];
        if (adjustments.length > 0) {
          toast.info(`${adjustments.length} cart item adjustment${adjustments.length === 1 ? "" : "s"} found.`);
        }
      } catch (error) {
        setValidationError(error?.EM || error?.message || "Your saved cart could not be refreshed.");
      } finally {
        setIsValidating(false);
      }
    };
    validateCart();
  }, [cartItems, dispatch, isAuthenticated, isCartOpen, ownerId]);

  const subtotal = Number(totalPrice || 0);
  const taxAmount = Math.round(subtotal * 0.08);
  const estimatedTotal = subtotal + taxAmount;
  const blockingIssues = issues.filter((issue) => issue.blocking !== false);
  const checkoutBlocked = isValidating || Boolean(validationError) || blockingIssues.length > 0;

  const closeCart = () => dispatch(doToggleCart(false));

  const handleCheckout = () => {
    if (checkoutBlocked) {
      toast.warning("Resolve the cart issues before checkout.");
      return;
    }
    closeCart();
    navigate("/checkout");
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? "show" : ""}`} onClick={closeCart} aria-hidden="true" />
      <aside className={`cart-drawer-container ${isCartOpen ? "open" : ""}`} aria-hidden={!isCartOpen} aria-label="Shopping cart">
        <div className="drawer-header">
          <div className="header-title"><ShoppingBag size={20} /><h2>Your Order</h2></div>
          <button className="close-btn" onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
        </div>

        {isValidating && <div className="validation-banner"><Loader size={16} className="spin" />Refreshing saved cart...</div>}
        {validationError && <div className="validation-banner error" role="alert"><AlertTriangle size={16} />{validationError}</div>}
        {!validationError && blockingIssues.length > 0 && (
          <div className="validation-banner warning" role="alert"><AlertTriangle size={16} />Review unavailable or changed items below.</div>
        )}

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Your cart is empty.</p>
              <button className="continue-link" onClick={closeCart}>Continue Shopping &rarr;</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.product_id}
                item={item}
                issue={issues.find((cartIssue) => cartIssue.product_id === item.product_id)}
              />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="summary-row"><span>Estimated tax (8%)</span><strong>{formatCurrency(taxAmount)}</strong></div>
            <div className="summary-row total-row"><span>Estimated total</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
            <p className="shipping-note">Takeaway only. No shipping fee.</p>
            <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutBlocked}>
              {checkoutBlocked ? "Resolve cart issues" : "Checkout →"}
            </button>
            <button className="continue-link" onClick={closeCart}>or Continue Shopping &rarr;</button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
