import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { doLoginSuccess } from "../../redux/actions/authAction";
import {
  doClearCart,
  doSetCartFromServer,
} from "../../redux/actions/cartAction";
import { loginUserApi } from "../../services/authService";
import { getCartApi, syncCartApi } from "../../services/cartService";
import { getRoleHome } from "../../utils/roleNavigation";
import "./Auth.scss";

const Login = ({ portalMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cartItems, ownerId } = useSelector((state) => state.cart);
  const [valueLogin, setValueLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getCustomerDestination = () => {
    const requestedPath = location.state?.from?.pathname;
    if (
      requestedPath &&
      !requestedPath.startsWith("/admin") &&
      !requestedPath.startsWith("/staff") &&
      !requestedPath.startsWith("/portal")
    ) {
      return `${requestedPath}${location.state?.from?.search || ""}`;
    }
    return "/";
  };

  const restoreCustomerCart = async (user) => {
    const guestItems = ownerId ? [] : cartItems;
    const payload = guestItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const cartRes = payload.length > 0
      ? await syncCartApi(payload, user.accessToken)
      : await getCartApi();

    if (cartRes?.EC === 0) {
      dispatch(doSetCartFromServer(cartRes.DT));
      if (payload.length > 0) {
        const summary = cartRes.DT?.syncSummary;
        const adjustmentCount = (summary?.adjusted?.length || 0) + (summary?.skipped?.length || 0);
        if (adjustmentCount > 0) {
          toast.info(`Cart restored with ${adjustmentCount} stock or availability adjustment${adjustmentCount === 1 ? "" : "s"}.`);
        } else {
          toast.success("Welcome back! Your cart has been synced.");
        }
      } else {
        toast.success("Welcome back to Royal Restaurant!");
      }
      return;
    }

    toast.warning("Signed in, but your cart could not be restored.");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const accountValue = valueLogin.trim();

    if (!accountValue || !password) {
      toast.error("Please enter your account and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUserApi(accountValue, password);
      if (!res || res.EC !== 0) {
        toast.error(res?.EM || "Invalid credentials.");
        return;
      }

      dispatch(doLoginSuccess(res.DT));

      if (res.DT.role === "customer") {
        await restoreCustomerCart(res.DT);
        if (portalMode) {
          toast.info("Customer account detected. Opening the customer application.");
        }
        navigate(getCustomerDestination(), { replace: true });
        return;
      }

      dispatch(doClearCart());
      toast.success(`Welcome to the ${res.DT.role} portal.`);
      navigate(getRoleHome(res.DT.role), { replace: true });
    } catch (error) {
      toast.error(error?.EM || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <p className="auth-eyebrow">{portalMode ? "Internal Portal" : "Customer Account"}</p>
        <h2>{portalMode ? "Staff & Admin Sign In" : "Welcome Back"}</h2>
        <p className="auth-description">
          {portalMode
            ? "Use your restaurant staff or administrator account."
            : "Sign in to manage your orders, reservations, and profile."}
        </p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="login-account">Email or Phone Number</label>
            <input
              id="login-account"
              type="text"
              value={valueLogin}
              onChange={(event) => setValueLogin(event.target.value)}
              placeholder="Enter your email or phone"
              autoComplete="username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="switch-page">
          {portalMode ? (
            <>Ordering as a customer? <Link to="/login">Customer sign in</Link></>
          ) : (
            <>Don&apos;t have an account? <Link to="/register">Sign up</Link></>
          )}
        </div>
        {!portalMode && (
          <div className="portal-link">
            Restaurant team member? <Link to="/portal/login">Open internal portal</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
