import {
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  TOGGLE_CART_DRAWER,
  SET_CART_FROM_SERVER,
  CLEAR_CART,
} from "../actions/cartAction";

const INITIAL_STATE = {
  cartItems: [],
  isCartOpen: false,
};

const cartReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    //case to handle adding item to cart
    case ADD_TO_CART:
      const { product, quantity } = action.payload;
      let cloneCart = [...state.cartItems];

      //check if the product already exists in the cart
      const existingIndex = cloneCart.findIndex(
        (item) => item.product_id === product.id,
      );

      if (existingIndex !== -1) {
        cloneCart[existingIndex].quantity += quantity; // if exists, update quantity
      } else {
        cloneCart.push({
          product_id: product.id,
          Product: product, // store the whole product object
          quantity: quantity,
        });
      }

      return {
        ...state,
        cartItems: cloneCart,
      };

    //case to handle updating item quantity in cart
    case UPDATE_CART_ITEM: {
      const { productId, newQuantity } = action.payload;
      let cloneCart = [...state.cartItems];
      const existingIndex = cloneCart.findIndex(
        (item) => item.product_id === productId,
      );

      if (existingIndex !== -1) {
        if (newQuantity <= 0) {
          cloneCart.splice(existingIndex, 1); //splice to remove item if quantity is zero or less
        } else {
          cloneCart[existingIndex].quantity = newQuantity;
        }
      }

      return {
        ...state,
        cartItems: cloneCart,
      };
    }

    //case to handle removing item from cart
    case REMOVE_CART_ITEM: {
      const { productId } = action.payload;
      const filteredCart = state.cartItems.filter(
        (item) => item.product_id !== productId,
      );

      return {
        ...state,
        cartItems: filteredCart,
      };
    }

    case TOGGLE_CART_DRAWER: {
      return {
        ...state,
        //if action.payload == true/false => set isCartOpen = true/false
        //if action.payload == undefined => toggle isCartOpen current value
        isCartOpen:
          action.payload !== undefined ? action.payload : !state.isCartOpen,
      };
    }

    case SET_CART_FROM_SERVER: {
      //action.payload is the cart data returned from server when user login
      //action.payload: { items: [{ product_id, quantity, Product: {...} }, ...] }
      // replace current cartItems with the latest cart data from server
      // console.log(">>> CHECK CART DATA FROM SERVER: ", action.payload);

      return {
        ...state,
        cartItems: action.payload.items || [],
      };
    }

    case CLEAR_CART: {
      return {
        ...INITIAL_STATE,
      };
    }

    default:
      return state;
  }
};

export default cartReducer;
