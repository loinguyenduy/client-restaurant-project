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

    // get cart items and user info from Redux store
    const { cartItems } = useSelector((state) => state.cart);
    const userAccount = useSelector((state) => state.auth.account);

    const [formData, setFormData] = useState({
        address: '',
        phone_receiver: userAccount?.phone_number || '', 
        note: '',
        payment_method: 'payos', 
        type: 'online'
    });

    const [isLoading, setIsLoading] = useState(false);

    // calculate subtotal, tax, shipping fee, and total amount
    const calculateSubtotal = () => {
        let subtotal = 0;
        cartItems.forEach((item) => {
            subtotal += parseFloat(item.Product.price) * item.quantity;
        });
        return subtotal;
    };

    const subtotal = calculateSubtotal();
    const shippingFee = 5.00; 
    const taxRate = 0.08; 
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount + shippingFee;

    // Avoid user enter link /checkout in url when cart is empty
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            toast.warning("Your cart is empty!");
            navigate("/menu");
        }
    }, [cartItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMethodChange = (method) => {
        setFormData({ ...formData, payment_method: method });
    };

    // handle form submission
    const handleSubmit = async () => {
        if (!formData.address || !formData.phone_receiver) {
            toast.error("Please fill in all required delivery details.");
            return;
        }
        //check format phone number 
        const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
        if (!phoneRegex.test(formData.phone_receiver)) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await checkoutApi(formData);

            if (res && res.EC === 0) {
                if (formData.payment_method === 'cash') {
                    dispatch(doClearCart());
                    navigate('/payment-success');
                } else {
                    //if payment method is payos, redirect to PayOS page
                    window.location.href = res.DT; //DT is the payment link from server
                    // console.log("Redirecting to PayOS with URL:", res.DT); 
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