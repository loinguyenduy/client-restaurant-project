export const ADD_TO_CART = "ADD_TO_CART";
export const UPDATE_CART_ITEM = "UPDATE_CART_ITEM";
export const REMOVE_CART_ITEM = "REMOVE_CART_ITEM";
export const TOGGLE_CART_DRAWER = "TOGGLE_CART_DRAWER";
export const SET_CART_FROM_SERVER = "SET_CART_FROM_SERVER"; //use to get cart data from server when user login
export const CLEAR_CART = "CLEAR_CART";

export const doAddToCart = (product, quantity) => {
  return {
    type: ADD_TO_CART,
    payload: { product, quantity },
  };
}

export const doUpdateCartItem = (productId, newQuantity) => {
  return {
    type: UPDATE_CART_ITEM,
    payload: { productId, newQuantity },
  };
};

export const doRemoveCartItem = (productId) => {
  return {
    type: REMOVE_CART_ITEM,
    payload: { productId },
  };
};

export const doToggleCart = (isOpen) => {
  return {
    type: TOGGLE_CART_DRAWER,
    payload: isOpen, 
  };
};

export const doSetCartFromServer = (cartData) => {
  return {
    type: SET_CART_FROM_SERVER,
    payload: cartData,
  };
};

export const doClearCart = () => {
  return {
    type: CLEAR_CART,
  };
};