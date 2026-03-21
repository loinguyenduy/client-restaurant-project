import { ADD_TO_CART } from "../actions/cartAction";

const INITIAL_STATE = {
    cartItems: [],
    totalPrice: 0 
};

const cartReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TO_CART:
            const { product, quantity } = action.payload;
            let cloneCart = [...state.cartItems];
            
            // Check if the product already exists in the cart
            const existingIndex = cloneCart.findIndex(item => item.product_id === product.id); 

            if (existingIndex !== -1) {
                cloneCart[existingIndex].quantity += quantity; // if exists, update quantity
            } else {
                cloneCart.push({
                    product_id: product.id,
                    Product: product,  // store the whole product object
                    quantity: quantity
                });
            }
          
            return {
                ...state,
                cartItems: cloneCart
            };

        default:
            return state;
    }
};

export default cartReducer;