import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Loader } from 'lucide-react';
import { doClearCart } from '../../redux/actions/cartAction';
import './PaymentResult.scss';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // to dispatch action to redux store to clear cart after successful payment
    const [searchParams] = useSearchParams();

    useEffect(() => {
        dispatch(doClearCart());

        const redirectTimer = setTimeout(() => {
            navigate('/my-orders');
        }, 3000);

        return () => clearTimeout(redirectTimer);
    }, [dispatch, navigate]);

    return (
        <div className="payment-result-container">
            <div className="result-card">
                <div className="icon-wrapper success">
                    <CheckCircle />
                </div>
                <h2>Payment Successful!</h2>
                <p>
                    Your payment has been processed successfully via PayOS. 
                    Thank you for your order.
                </p>
                <div className="redirect-message">
                    <Loader size={16} />
                    <span>Redirecting to your orders...</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;