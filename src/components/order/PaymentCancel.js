import React, { useEffect, useState } from "react";
import { Loader, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserOrderDetailsApi } from "../../services/orderService";
import { getManagedOrderDetailsApi } from "../../services/adminService";
import "./PaymentResult.scss";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const role = useSelector((store) => store.auth.account.role);
  const isInternal = ["staff", "admin"].includes(role);
  const [message, setMessage] = useState("Checking the saved order...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setMessage("The payment was not completed. Open My Orders to review your orders.");
        setLoading(false);
        return;
      }
      try {
        const response = isInternal ? await getManagedOrderDetailsApi(orderId) : await getUserOrderDetailsApi(orderId);
        const order = response?.DT;
        if (order?.payment_status === "paid") {
          setMessage("The payment has already been confirmed. Check My Orders for the latest status.");
        } else if (order?.order_status === "cancelled") {
          setMessage("This order has been cancelled. Any reserved stock has been released.");
        } else {
          setMessage(isInternal ? "Payment was not completed. The order remains ready and the table remains occupied. Return to POS to retry PayOS or safely switch to cash." : "Payment was not completed. Your order is waiting in My Orders, where you can retry or cancel it.");
        }
      } catch (error) {
        setMessage(error?.EM || "The order status could not be checked. Open My Orders to try again.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [isInternal, orderId]);

  return (
    <main className="payment-result-container">
      <div className="result-card" role="status">
        <div className="icon-wrapper cancel">{loading ? <Loader className="spin" /> : <XCircle />}</div>
        <h1>{loading ? "Checking order" : "Payment not completed"}</h1>
        <p>{message}</p>
        <button type="button" className="result-action" onClick={() => navigate(isInternal ? `/${role}/pos` : "/my-orders")}>{isInternal ? "Return to POS / Tables" : "Go to My Orders"}</button>
      </div>
    </main>
  );
};

export default PaymentCancel;
