import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Loader } from 'lucide-react';
import { doClearCart } from '../../redux/actions/cartAction';
import './PaymentResult.scss';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    
    // PayOS trả về rất nhiều param trên URL, bạn có thể lấy orderCode ra để hiển thị nếu muốn
    // const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        // 1. Xóa giỏ hàng local trên Redux vì thanh toán đã thành công
        dispatch(doClearCart());

        // 2. Tự động chuyển hướng về trang Lịch sử đơn hàng sau 3 giây
        const redirectTimer = setTimeout(() => {
            navigate('/my-orders');
        }, 3000);

        // Cleanup function để tránh memory leak nếu user rời khỏi trang trước 3s
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