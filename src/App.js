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

// Order Components
import Checkout from "./components/order/Checkout.js";
import PaymentSuccess from "./components/order/PaymentSuccess.js";
import PaymentCancel from "./components/order/PaymentCancel.js";
import MyOrders from "./components/order/MyOrders.js";
import Invoice from "./components/order/Invoice.js";

// Reservation Component
import ReservationPage from "./components/reservation/ReservationPage.js";
import MyReservations from "./components/reservation/MyReservations.js";
import ProfileLayout from "./components/profile/ProfileLayout.js";

import AdminRoute from "./routes/AdminRoute.js";
import AdminLayout from "./components/admin/AdminLayout.js";
import DashboardOverview from "./components/admin/DashboardOverview.js";
import ManageOrders from "./components/admin/ManageOrders.js";
import ManageReservations from "./components/admin/ManageReservations.js";  
import ManageMenu from "./components/admin/ManageMenu.js";
import AccountManagement from "./components/admin/AccountManagement.js";

function App() {
  const dispatch = useDispatch();
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        let res = await fetchAccountApi();
        if (res && res.EC === 0) {
          dispatch(doFetchAccountSuccess(res.DT));

          let cartRes = await getCartApi();
          if (cartRes && cartRes.EC === 0) {
            dispatch(doSetCartFromServer(cartRes.DT));
          }
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#F8FAFC",
        }}
      >
        <h2 style={{ color: "#0F172A", fontFamily: "serif" }}>
          Loading Royal Restaurant...
        </h2>
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

            {/* Reservation Route */}
            <Route
              path="/reservation"
              element={
                <PrivateRoute>
                  <ReservationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-reservations"
              element={
                <PrivateRoute>
                  <MyReservations />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileLayout />
                </PrivateRoute>
              }
            />

            {/* Order & Payment Routes */}
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
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="menu" element={<ManageMenu />} />
            <Route path="users" element={<AccountManagement />} />
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
