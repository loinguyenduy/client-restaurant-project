import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserOrderDetailsApi } from "../../services/orderService";
import { getManagedOrderDetailsApi } from "../../services/adminService";
import "./PaymentResult.scss";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const role = useSelector((store) => store.auth.account.role);
  const isInternal = ["staff", "admin"].includes(role);
  const [state, setState] = useState({ type: "checking", message: "Confirming your payment with the restaurant..." });

  useEffect(() => {
    if (!orderId) {
      setState({ type: "error", message: "The payment return did not include an order reference." });
      return undefined;
    }
    let cancelled = false;
    let attempts = 0;
    let timer;
    const checkOrder = async () => {
      attempts += 1;
      try {
        const response = isInternal ? await getManagedOrderDetailsApi(orderId) : await getUserOrderDetailsApi(orderId);
        const order = response?.DT;
        if (cancelled) return;
        if (response?.EC === 0 && order?.payment_status === "paid") {
          if (order.requires_manual_refund) {
            setState({ type: "warning", message: "Payment arrived after this order was cancelled. Please contact the restaurant for a manual refund." });
          } else {
            setState({ type: "success", message: isInternal ? "Payment confirmed. The table session has been completed and released safely." : "Payment confirmed. Your order is now with the restaurant." });
          }
          return;
        }
        if (attempts < 15) timer = setTimeout(checkOrder, 2000);
        else setState({ type: "waiting", message: "PayOS is still being confirmed. Check My Orders for the authoritative status." });
      } catch (error) {
        if (cancelled) return;
        if (attempts < 15) timer = setTimeout(checkOrder, 2000);
        else setState({ type: "error", message: error?.EM || "The order status could not be checked." });
      }
    };
    checkOrder();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [isInternal, orderId]);

  const successful = state.type === "success";
  return (
    <main className="payment-result-container">
      <div className="result-card" role="status">
        <div className={`icon-wrapper ${successful ? "success" : state.type === "checking" ? "pending" : "cancel"}`}>
          {successful ? <CheckCircle /> : state.type === "checking" ? <Loader className="spin" /> : <AlertTriangle />}
        </div>
        <h1>{successful ? "Payment confirmed" : state.type === "checking" ? "Checking payment" : "Payment update"}</h1>
        <p>{state.message}</p>
        <button type="button" className="result-action" onClick={() => navigate(isInternal ? `/${role}/pos` : "/my-orders")}>{isInternal ? "Return to POS / Tables" : "View My Orders"}</button>
      </div>
    </main>
  );
};

export default PaymentSuccess;
