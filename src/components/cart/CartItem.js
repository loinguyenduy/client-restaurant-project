import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector  } from 'react-redux';
import { toast } from 'react-toastify';
import { updateCartItemApi, removeCartItemApi } from '../../services/cartService';
import { doUpdateCartItem, doRemoveCartItem } from '../../redux/actions/cartAction';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);  //state to manage loading state when updating or removing cart item

  const handleUpdateQuantity = async (newQuantity) => {
    if (isLoading) return;
    
    if (newQuantity <= 0) {
        return handleRemoveItem();
    }

    if (newQuantity > item.Product.stock_quantity) {
        toast.warning(`Sorry, we only have ${item.Product.stock_quantity} left.`);
        return;
    }

    setIsLoading(true);
    
    // if authenticated user, call API to update quantity in the database, then update the cart in redux
    if (isAuthenticated) {
        try {
          let res = await updateCartItemApi(item.product_id, newQuantity);
          if (res && res.EC === 0) {
            dispatch(doUpdateCartItem(item.product_id, newQuantity));
          } else {
            toast.error(res.EM || "Failed to update quantity.");
          }
        } catch (error) {
          toast.error("An error occurred while updating the cart.");
        }
    } 
    //if guest user, just update the quantity in the temporary cart in redux without calling API
    else {
        dispatch(doUpdateCartItem(item.product_id, newQuantity));
    }
    
    setIsLoading(false);
  };

  const handleRemoveItem = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    if (isAuthenticated) {
        try {
          let res = await removeCartItemApi(item.product_id);
          if (res && res.EC === 0) {
            dispatch(doRemoveCartItem(item.product_id));
            toast.success("Item removed from cart.");
          } else {
            toast.error(res.EM || "Failed to remove item.");
          }
        } catch (error) {
          toast.error("An error occurred while removing the item.");
        }
    } 
    else {
        dispatch(doRemoveCartItem(item.product_id));
        toast.success("Item removed from temporary cart.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="cart-item-card">
      <img src={item.Product.image_url} alt={item.Product.name} className="item-image" />
      
      <div className="item-details">
        <div className="item-header">
            <h4 className="item-name">{item.Product.name}</h4>
            <span className="item-price">${parseFloat(item.Product.price * item.quantity).toFixed(2)}</span>
        </div>
        
        <p className="item-category">Main Course</p> 
        
        <div className="item-actions">
          <div className="quantity-control">
            <button 
                className="qty-btn" 
                onClick={() => handleUpdateQuantity(item.quantity - 1)} 
                disabled={isLoading}
            >
              <Minus size={14} />
            </button>
            <span className="qty-number">{item.quantity}</span>
            <button 
                className="qty-btn" 
                onClick={() => handleUpdateQuantity(item.quantity + 1)} 
                disabled={isLoading}
            >
              <Plus size={14} />
            </button>
          </div>

          <button className="remove-btn" onClick={handleRemoveItem} disabled={isLoading}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;