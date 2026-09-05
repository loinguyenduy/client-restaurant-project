import axios from "../utils/axios";

// Function to call API for creating a new order and getting payment link
const checkoutApi = (orderData) => {
    return axios.post("/orders/checkout", orderData);
};

// Function to fetch order history for the logged-in user
const getUserOrdersApi = () => {
    return axios.get("/orders/my-orders");
};

const getUserOrderDetailsApi = (orderId) => axios.get(`/orders/my-orders/${orderId}`);

// Function to request a new payment link for a pending order
const rePayOrderApi = (orderId) => {
    return axios.post(`/orders/${orderId}/re-pay`);
};

const cancelOrderApi = (orderId) => axios.post(`/orders/${orderId}/cancel`);

export {
    checkoutApi,
    cancelOrderApi,
    getUserOrderDetailsApi,
    getUserOrdersApi,
    rePayOrderApi
};
