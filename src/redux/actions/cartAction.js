export const ADD_TO_CART = "ADD_TO_CART";

export const doAddToCart = (product, quantity) => {
  return {
    type: ADD_TO_CART,
    payload: { product, quantity },
  };
}