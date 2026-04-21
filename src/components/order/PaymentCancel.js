import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Loader } from 'lucide-react';
import './PaymentResult.scss';

const PaymentCancel = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Tự động chuyển hướng về trang Checkout sau 3 giây
        // Giỏ hàng vẫn được giữ nguyên trong Redux
        const redirectTimer = setTimeout(() => {
            navigate('/checkout');
        }, 3000);

        return () => clearTimeout(redirectTimer);
    }, [navigate]);

    return (
        <div className="payment-result-container">
            <div className="result-card">
                <div className="icon-wrapper cancel">
                    <XCircle />
                </div>
                <h2>Payment Cancelled</h2>
                <p>
                    You have cancelled the payment process. Your order has been saved, 
                    and you can try paying again from your checkout page.
                </p>
                <div className="redirect-message">
                    <Loader size={16} />
                    <span>Returning to checkout...</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;