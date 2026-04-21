import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { checkoutApi } from '../../services/orderService';
import { doClearCart } from '../../redux/actions/cartAction';

import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';
import './Checkout.scss';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1. Lấy dữ liệu giỏ hàng và thông tin User từ Redux
    const { cartItems } = useSelector((state) => state.cart);
    const userAccount = useSelector((state) => state.auth.account);

    // 2. Khởi tạo state cho Form. Tự động điền Phone nếu User đã có
    const [formData, setFormData] = useState({
        address: '',
        phone_receiver: userAccount?.phone_number || '', 
        note: '',
        payment_method: 'payos', // Để mặc định là PayOS theo thiết kế
        type: 'online'
    });

    const [isLoading, setIsLoading] = useState(false);

    // 3. Xử lý tính toán (Giống hệt bên CartDrawer để đảm bảo đồng bộ)
    const calculateSubtotal = () => {
        let subtotal = 0;
        cartItems.forEach((item) => {
            subtotal += parseFloat(item.Product.price) * item.quantity;
        });
        return subtotal;
    };

    const subtotal = calculateSubtotal();
    const shippingFee = 5.00; // Hardcode tạm thời giống bản thiết kế AI
    const taxRate = 0.08; 
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount + shippingFee;

    // Redriect nếu giỏ hàng trống (tránh user vào bằng link trực tiếp)
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            toast.warning("Your cart is empty!");
            navigate("/menu");
        }
    }, [cartItems, navigate]);

    // 4. Các hàm xử lý thay đổi dữ liệu Form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMethodChange = (method) => {
        setFormData({ ...formData, payment_method: method });
    };

    // 5. Submit Form
    const handleSubmit = async () => {
        if (!formData.address || !formData.phone_receiver) {
            toast.error("Please fill in all required delivery details.");
            return;
        }

        setIsLoading(true);
        try {
            // Gọi API checkout đã định nghĩa ở orderService
            const res = await checkoutApi(formData);

            if (res && res.EC === 0) {
                if (formData.payment_method === 'cash') {
                    // Nếu là tiền mặt: Xóa giỏ hàng và chuyển trang Success ngay
                    dispatch(doClearCart());
                    navigate('/payment-success');
                } else {
                    // Nếu là thanh toán Online: Redirect sang trang của cổng thanh toán
                    // res.DT chính là checkoutUrl của PayOS
                    window.location.href = res.DT; 
                }
            } else {
                toast.error(res.EM || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error("Failed to process order.");
        }
        setIsLoading(false);
    };

    return (
        <div className="checkout-container">
            <div className="back-link" onClick={() => navigate('/menu')}>
                <ArrowLeft size={16} />
                <span>Back to Menu</span>
            </div>
            
            <h1>Checkout</h1>

            <div className="checkout-content">
                <CheckoutForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleMethodChange={handleMethodChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                />

                <OrderSummary 
                    cartItems={cartItems}
                    subtotal={subtotal}
                    taxAmount={taxAmount}
                    shippingFee={shippingFee}
                    total={total}
                />
            </div>
        </div>
    );
};

export default Checkout;