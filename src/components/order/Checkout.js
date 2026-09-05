import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doSetCartFromServer } from "../../redux/actions/cartAction";
import { getCartApi } from "../../services/cartService";
import { checkoutApi } from "../../services/orderService";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import "./Checkout.scss";

const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, issues, totalPrice } = useSelector((state) => state.cart);
  const account = useSelector((state) => state.auth.account);
  const [formData, setFormData] = useState({
    contact_name: account.full_name || account.username || "",
    phone_receiver: account.phone_number || "",
    note: "",
    payment_method: "cash",
  });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshError, setRefreshError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const refreshCart = async () => {
    setIsRefreshing(true);
    setRefreshError("");
    try {
      const response = await getCartApi();
      if (response?.EC !== 0) throw new Error(response?.EM);
      dispatch(doSetCartFromServer(response.DT));
    } catch (error) {
      setRefreshError(error?.EM || error?.message || "Your cart could not be refreshed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const subtotal = Number(totalPrice || 0);
  const taxAmount = Math.round(subtotal * 0.08);
  const total = subtotal + taxAmount;
  const estimatedPrepMinutes = useMemo(() => cartItems.reduce((maximum, item) => {
    const minutes = Number(item.Product?.prep_time_minutes || 15);
    return Math.max(maximum, Number.isInteger(minutes) ? minutes : 15);
  }, 15), [cartItems]);
  const blockingIssues = issues.filter((issue) => issue.blocking !== false);
  const isBlocked = isRefreshing || Boolean(refreshError) || cartItems.length === 0 || blockingIssues.length > 0;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current || isBlocked) return;
    const contactName = formData.contact_name.trim();
    const phone = formData.phone_receiver.trim();
    if (!contactName) return toast.warning("Enter the pickup contact name.");
    if (!phonePattern.test(phone)) return toast.warning("Enter a valid phone number.");
    if (formData.note.trim().length > 500) return toast.warning("Order note must be 500 characters or fewer.");

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await checkoutApi({
        ...formData,
        contact_name: contactName,
        phone_receiver: phone,
        note: formData.note.trim(),
      });
      if (response?.EC !== 0) throw new Error(response?.EM);
      dispatch(doSetCartFromServer(response.DT.cart));
      const orderId = response.DT.order.id;
      if (formData.payment_method === "cash") {
        navigate(`/my-orders/${orderId}`);
      } else if (response.DT.checkoutUrl) {
        window.location.assign(response.DT.checkoutUrl);
      } else {
        toast.info("Your order was saved. Retry payment from My Orders.");
        navigate(`/my-orders/${orderId}`);
      }
    } catch (error) {
      toast.error(error?.EM || error?.message || "The order could not be created.");
      await refreshCart();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="checkout-container">
      <button type="button" className="back-link" onClick={() => navigate("/menu")}>
        <ArrowLeft size={16} /> Back to Menu
      </button>
      <div className="checkout-heading">
        <div><span>Takeaway order</span><h1>Checkout</h1></div>
        <p>Your order will be prepared for pickup as soon as possible.</p>
      </div>

      {isRefreshing && <div className="checkout-state">Refreshing your cart...</div>}
      {refreshError && (
        <div className="checkout-state error" role="alert">
          <span>{refreshError}</span>
          <button type="button" onClick={refreshCart}><RefreshCw size={15} /> Retry</button>
        </div>
      )}
      {!isRefreshing && !refreshError && cartItems.length === 0 && (
        <div className="checkout-state">Your cart is empty. Add a dish from the menu before checkout.</div>
      )}
      {!isRefreshing && blockingIssues.length > 0 && (
        <div className="checkout-state error" role="alert">
          Your cart changed. Open the cart and resolve unavailable or reduced-stock items.
        </div>
      )}

      <form className="checkout-content" onSubmit={handleSubmit}>
        <CheckoutForm formData={formData} onChange={handleInputChange} />
        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          estimatedPrepMinutes={estimatedPrepMinutes}
          isSubmitting={isSubmitting}
          isBlocked={isBlocked}
        />
      </form>
    </main>
  );
};

export default Checkout;
