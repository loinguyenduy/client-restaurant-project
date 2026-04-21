import React from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';

const CheckoutForm = ({ formData, handleInputChange, handleMethodChange, handleSubmit, isLoading }) => {
    return (
        <div className="checkout-form-section">
            <h3>Delivery Details</h3>
            
            <div className="form-group">
                <label>Delivery Address *</label>
                <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4B"
                    required
                />
            </div>

            <div className="form-group">
                <label>Phone Number *</label>
                <input 
                    type="text" 
                    name="phone_receiver"
                    value={formData.phone_receiver}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    required
                />
            </div>

            <div className="form-group">
                <label>Delivery Note (Optional)</label>
                <textarea 
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Leave at door, door code, etc."
                />
            </div>

            <h3>Payment Method</h3>
            <div className="payment-methods">
                <div 
                    className={`method-card ${formData.payment_method === 'cash' ? 'active' : ''}`}
                    onClick={() => handleMethodChange('cash')}
                >
                    <Banknote />
                    <span>Cash on Delivery</span>
                </div>
                
                {/* vnpay not yet implemented */}
                <div 
                    className={`method-card ${formData.payment_method === 'vnpay' ? 'active' : ''}`}
                    onClick={() => handleMethodChange('vnpay')}
                >
                    <CreditCard />
                    <span>VNPay</span>
                </div>

                <div 
                    className={`method-card ${formData.payment_method === 'payos' ? 'active' : ''}`}
                    onClick={() => handleMethodChange('payos')}
                >
                    <QrCode />
                    <span>PayOS</span>
                </div>
            </div>

            <button 
                className="confirm-btn" 
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Confirm Order"}
            </button>
        </div>
    );
};

export default CheckoutForm;