import axios from "axios";
import store from "../redux/store.js";
import { USER_LOGOUT_SUCCESS, FETCH_USER_LOGIN_SUCCESS } from '../redux/actions/authAction';
import { CLEAR_CART } from '../redux/actions/cartAction';

const instance = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
});

// 2. Request Interceptor
instance.interceptors.request.use(
  function (config) {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    return response && response.data ? response.data : response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (
        originalRequest.url === "/refresh" ||
        originalRequest.url === "/login"
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const res = await instance.post("/refresh");

        if (res && res.EC === 0) {
          store.dispatch({
            type: FETCH_USER_LOGIN_SUCCESS,
            payload: res.DT,
          });

          originalRequest.headers.Authorization = `Bearer ${res.DT.accessToken}`;

          return instance(originalRequest);
        } else {
          store.dispatch({ type: USER_LOGOUT_SUCCESS });
          if (store.getState().cart.ownerId) {
            store.dispatch({ type: CLEAR_CART });
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        store.dispatch({ type: USER_LOGOUT_SUCCESS });
        if (store.getState().cart.ownerId) {
          store.dispatch({ type: CLEAR_CART });
        }
        return Promise.reject(refreshError);
      }
    }

    return error && error.response && error.response.data
      ? Promise.reject(error.response.data)
      : Promise.reject(error);
  },
);

export default instance;
