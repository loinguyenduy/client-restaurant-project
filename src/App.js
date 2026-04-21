import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.js";
import HomePage from "./components/home/HomePage.js";
import Menu from "./components/menu/Menu.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.scss";
import { useDispatch } from "react-redux";
import { fetchAccountApi } from "./services/authService";
import { doFetchAccountSuccess } from "./redux/actions/authAction";
import PrivateRoute from "./routes/PrivateRoute.js";
import GuestRoute from "./routes/GuestRoute.js";
import { getCartApi } from "./services/cartService.js";
import { doSetCartFromServer } from "./redux/actions/cartAction.js";

import Checkout from "./components/order/Checkout.js";
import PaymentSuccess from "./components/order/PaymentSuccess.js";
import PaymentCancel from "./components/order/PaymentCancel.js";
import MyOrders from "./components/order/MyOrders.js";
import Invoice from "./components/order/Invoice.js";

function App() {
  const dispatch = useDispatch();
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        // check token if exist and valid, fetch user info
        let res = await fetchAccountApi();
        if (res && res.EC === 0) {
          dispatch(doFetchAccountSuccess(res.DT));
        }

        // fetch cart data if user logged in successfully
        let cartRes = await getCartApi();
        if (cartRes && cartRes.EC === 0) {
          dispatch(doSetCartFromServer(cartRes.DT));
        }
      } catch (error) {
        console.log("No active session or token expired");
      } finally {
        setIsAppLoading(false);
      }
    };

    fetchUserSession();
  }, [dispatch]);

  if (isAppLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading application...
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/menu" element={<Menu />} />

            {/* --- ORDER & PAYMENT ROUTES --- */}
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <PrivateRoute>
                  <PaymentSuccess />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-cancel"
              element={
                <PrivateRoute>
                  <PaymentCancel />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <PrivateRoute>
                  <Invoice />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
