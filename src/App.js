import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.scss";

import MainLayout from "./components/MainLayout.js";
import HomePage from "./components/home/HomePage.js";
import Menu from "./components/menu/Menu.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import Checkout from "./components/order/Checkout.js";
import PaymentSuccess from "./components/order/PaymentSuccess.js";
import PaymentCancel from "./components/order/PaymentCancel.js";
import MyOrders from "./components/order/MyOrders.js";
import OrderDetail from "./components/order/OrderDetail.js";
import Invoice from "./components/order/Invoice.js";
import ReservationPage from "./components/reservation/ReservationPage.js";
import MyReservations from "./components/reservation/MyReservations.js";
import ProfileLayout from "./components/profile/ProfileLayout.js";
import AdminLayout from "./components/admin/AdminLayout.js";
import DashboardOverview from "./components/admin/DashboardOverview.js";
import ManageOrders from "./components/admin/ManageOrders.js";
import ManageReservations from "./components/admin/ManageReservations.js";
import ManageMenu from "./components/admin/ManageMenu.js";
import AccountManagement from "./components/admin/AccountManagement.js";
import Attendance from "./components/admin/Attendance.js";
import AttendanceLogs from "./components/admin/AttendanceLogs.js";
import ManageTables from "./components/admin/ManageTables.js";
import PosTerminal from "./components/admin/PosTerminal.js";
import KitchenDisplay from "./components/admin/KitchenDisplay.js";
import Inventory from "./components/admin/Inventory.js";
import ReviewsPage from "./components/review/ReviewsPage.js";
import ManageReviews from "./components/admin/ManageReviews.js";
import AboutPage from "./components/about/AboutPage.js";
import ContactPage from "./components/contact/ContactPage.js";

import PrivateRoute from "./routes/PrivateRoute.js";
import GuestRoute from "./routes/GuestRoute.js";
import RoleRoute from "./routes/RoleRoute.js";
import { fetchAccountApi } from "./services/authService";
import { getCartApi, validateGuestCartApi } from "./services/cartService.js";
import { connectSocket, disconnectSocket, getSocket } from "./services/socketService.js";
import { doFetchAccountSuccess } from "./redux/actions/authAction";
import {
  doClearCart,
  doSetCartFromServer,
} from "./redux/actions/cartAction.js";

function App() {
  const dispatch = useDispatch();
  const cartOwnerId = useSelector((state) => state.cart.ownerId);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { account, isAuthenticated, token } = useSelector((state) => state.auth);
  const initialCartOwnerId = useRef(cartOwnerId);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetchAccountApi();
        if (res?.EC === 0) {
          dispatch(doFetchAccountSuccess(res.DT));

          if (res.DT.role === "customer") {
            const cartRes = await getCartApi();
            if (cartRes?.EC === 0) {
              dispatch(doSetCartFromServer(cartRes.DT));
            }
          } else {
            dispatch(doClearCart());
          }
        }
      } catch (error) {
        if (initialCartOwnerId.current) {
          dispatch(doClearCart());
        }
      } finally {
        setIsAppLoading(false);
      }
    };

    fetchUserSession();
  }, [dispatch]);

  useEffect(() => {
    if (!isAppLoading) connectSocket(isAuthenticated ? token : "");
  }, [isAppLoading, isAuthenticated, token]);

  useEffect(() => () => disconnectSocket(), []);

  useEffect(() => {
    if (isAppLoading || cartItems.length === 0 || (isAuthenticated && account.role !== "customer")) return undefined;
    const socket = getSocket();
    let validationTimer;
    const refreshRelevantCart = (event = {}) => {
      if (event.productId && !cartItems.some((item) => item.product_id === event.productId)) return;
      clearTimeout(validationTimer);
      validationTimer = setTimeout(async () => {
        try {
          const response = isAuthenticated
            ? await getCartApi()
            : await validateGuestCartApi(cartItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity })));
          if (response?.EC === 0) dispatch(doSetCartFromServer(response.DT));
        } catch (error) {
          // The existing cart issue state remains blocking until the next successful refresh.
        }
      }, 250);
    };
    socket.on("product:availability_changed", refreshRelevantCart);
    socket.on("connect", refreshRelevantCart);
    return () => {
      clearTimeout(validationTimer);
      socket.off("product:availability_changed", refreshRelevantCart);
      socket.off("connect", refreshRelevantCart);
    };
  }, [account.role, cartItems, dispatch, isAppLoading, isAuthenticated]);

  if (isAppLoading) {
    return (
      <div className="app-loading-screen">
        <h2>Loading Royal Restaurant...</h2>
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
            path="/portal/login"
            element={
              <GuestRoute>
                <Login portalMode />
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
            <Route path="menu" element={<Menu />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="reservation" element={<PrivateRoute><ReservationPage /></PrivateRoute>} />
            <Route path="my-reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><ProfileLayout /></PrivateRoute>} />
            <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
            <Route path="payment-cancel" element={<PrivateRoute><PaymentCancel /></PrivateRoute>} />
            <Route path="my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
            <Route path="my-orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
            <Route path="my-orders/:id/invoice" element={<PrivateRoute><Invoice /></PrivateRoute>} />
            <Route path="invoice" element={<Navigate to="/my-orders" replace />} />
          </Route>

          <Route
            path="/admin"
            element={<RoleRoute allowedRoles={["admin"]}><AdminLayout /></RoleRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="kitchen" element={<KitchenDisplay />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="pos" element={<PosTerminal />} />
            <Route path="tables" element={<ManageTables />} />
            <Route path="attendance-logs" element={<AttendanceLogs />} />
            <Route path="menu" element={<ManageMenu />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reviews" element={<ManageReviews />} />
            <Route path="users" element={<AccountManagement />} />
          </Route>

          <Route
            path="/staff"
            element={<RoleRoute allowedRoles={["staff"]}><AdminLayout /></RoleRoute>}
          >
            <Route index element={<Navigate to="attendance" replace />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="kitchen" element={<KitchenDisplay />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="pos" element={<PosTerminal />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="tables" element={<Navigate to="/staff/pos" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
