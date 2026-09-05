import {
  ADD_TO_CART,
  CLEAR_CART,
  REMOVE_CART_ITEM,
  SET_CART_FROM_SERVER,
  TOGGLE_CART_DRAWER,
  UPDATE_CART_ITEM,
} from "../actions/cartAction";

const INITIAL_STATE = {
  cartItems: [],
  isCartOpen: false,
  ownerId: null,
  issues: [],
  totalPrice: 0,
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const product = item.Product;
    if (!product || !product.is_available || product.stock_quantity <= 0) return total;
    return total + Number(product.price) * item.quantity;
  }, 0);
};

const buildGuestIssues = (items) => {
  return items.flatMap((item) => {
    const product = item.Product;
    if (!product) {
      return [{ product_id: item.product_id, type: "deleted", message: "This dish no longer exists." }];
    }
    if (!product.is_available || product.stock_quantity <= 0) {
      return [{ product_id: item.product_id, type: "unavailable", message: `${product.name} is currently unavailable.` }];
    }
    if (item.quantity > product.stock_quantity) {
      return [{ product_id: item.product_id, type: "reduced_stock", message: `Only ${product.stock_quantity} are available.` }];
    }
    return [];
  });
};

const withGuestCart = (state, cartItems) => ({
  ...state,
  cartItems,
  ownerId: null,
  issues: buildGuestIssues(cartItems),
  totalPrice: calculateTotal(cartItems),
});

const cartReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingItem = state.cartItems.find((item) => item.product_id === product.id);
      const cartItems = existingItem
        ? state.cartItems.map((item) => item.product_id === product.id
          ? { ...item, Product: product, quantity: item.quantity + quantity }
          : item)
        : [...state.cartItems, { product_id: product.id, Product: product, quantity }];
      return withGuestCart(state, cartItems);
    }

    case UPDATE_CART_ITEM: {
      const { productId, newQuantity } = action.payload;
      const cartItems = newQuantity <= 0
        ? state.cartItems.filter((item) => item.product_id !== productId)
        : state.cartItems.map((item) => item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item);
      return withGuestCart(state, cartItems);
    }

    case REMOVE_CART_ITEM:
      return withGuestCart(
        state,
        state.cartItems.filter((item) => item.product_id !== action.payload.productId),
      );

    case TOGGLE_CART_DRAWER:
      return {
        ...state,
        isCartOpen: action.payload !== undefined ? action.payload : !state.isCartOpen,
      };

    case SET_CART_FROM_SERVER:
      return {
        ...state,
        cartItems: action.payload.items || [],
        ownerId: action.payload.user_id || null,
        issues: action.payload.issues || [],
        totalPrice: Number(action.payload.totalPrice || 0),
      };

    case CLEAR_CART:
      return { ...INITIAL_STATE };

    default:
      return state;
  }
};

export default cartReducer;
