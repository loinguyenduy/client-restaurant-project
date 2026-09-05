import axios from "../utils/axios";

const addToCartApi = (product_id, quantity) => {
  return axios.post("/add-to-cart", { product_id, quantity });
};

const getCartApi = () => {
  return axios.get("/get-cart");
};

const updateCartItemApi = (product_id, quantity) => {
  return axios.put("/update-cart-item", { product_id, quantity });
};

const removeCartItemApi = (product_id) => {
  return axios.delete(`/remove/${product_id}`);
};

const syncCartApi = (localCart, token) => {
  return axios.post(
    "/sync-cart",
    { local_cart: localCart },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

const validateGuestCartApi = (items) => {
  return axios.post("/cart/validate", { items });
};

export {
  addToCartApi,
  getCartApi,
  updateCartItemApi,
  removeCartItemApi,
  syncCartApi,
  validateGuestCartApi,
};
