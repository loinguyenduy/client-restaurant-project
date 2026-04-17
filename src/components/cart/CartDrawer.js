import React from "react";
import { X, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { doToggleCart } from "../../redux/actions/cartAction";
import CartItem from "./CartItem";
import "./Cart.scss";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, isCartOpen } = useSelector((state) => state.cart); // get cartItems and isCartOpen from Redux 

  // function to calculate subtotal, tax and total
  const calculateSubtotal = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += parseFloat(item.Product.price) * item.quantity;
    });
    return subtotal;
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.08; 
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // handle close the cart drawer
  const handleClose = () => {
    dispatch(doToggleCart(false));
  };

  const handleCheckout = () => {
    handleClose(); 
    navigate("/checkout"); 
  };

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? "show" : ""}`}
        onClick={handleClose}
      ></div>

      <div className={`cart-drawer-container ${isCartOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="header-title">
            <ShoppingBag size={20} />
            <h2>Your Order</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Your cart is empty.</p>
              <button className="continue-link" onClick={handleClose}>
                Continue Shopping &rarr;
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem key={item.product_id} item={item} /> // props item to CartItem component to display each item in the cart
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Tax (8%)</span>
              <span className="summary-value">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label">Total</span>
              <span className="summary-value">${total.toFixed(2)}</span>
            </div>

            <p className="shipping-note">
              Shipping and taxes calculated at checkout.
            </p>

            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout &rarr;
            </button>

            <button className="continue-link" onClick={handleClose}>
              or Continue Shopping &rarr;
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
