import React, { useEffect } from "react";
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

function App() {
  const dispatch = useDispatch();
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
      }
    };

    fetchUserSession();
  }, [dispatch]);
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
