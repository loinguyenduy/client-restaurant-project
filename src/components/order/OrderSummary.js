import React from 'react';
import { ShieldCheck } from 'lucide-react';

const OrderSummary = ({ cartItems, subtotal, taxAmount, shippingFee, total }) => {
    return (
        <div className="order-summary-section">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
                {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                        <div className="summary-item" key={`summary-${index}`}>
                            <div className="item-info">
                                <h4>{item.Product?.name}</h4>
                                <p>Quantity: {item.quantity}</p>
                            </div>
                            <div className="item-price">
                                {/* Format tiền tệ cơ bản */}
                                ${(parseFloat(item.Product?.price) * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Your cart is empty.</p>
                )}
            </div>

            <div className="summary-calculations">
                <div className="calc-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="calc-row">
                    <span>Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="calc-row">
                    <span>Tax (8%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
            </div>

            <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">${total.toFixed(2)}</span>
            </div>

            <div className="secure-badge">
                <ShieldCheck size={16} />
                <span>Secure Checkout Process</span>
            </div>
        </div>
    );
};

export default OrderSummary;