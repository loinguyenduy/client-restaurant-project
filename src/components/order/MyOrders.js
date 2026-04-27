import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getUserOrdersApi, rePayOrderApi } from '../../services/orderService';
import './MyOrders.scss';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRepaying, setIsRepaying] = useState(null); // save orderId to disable button while processing

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await getUserOrdersApi();
            if (res && res.EC === 0) {
                setOrders(res.DT);
            } else {
                toast.error(res.EM || "Failed to fetch orders");
            }
        } catch (error) {
            console.error(">>> Error fetching orders:", error);
            toast.error("An error occurred while loading your orders.");
        }
        setIsLoading(false);
    };

    // format date helper function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // handle re-pay for pending orders
    const handleRePay = async (orderId) => {
        setIsRepaying(orderId);
        try {
            const res = await rePayOrderApi(orderId);
            if (res && res.EC === 0 && res.DT) {
                window.location.href = res.DT; // redirect to new payment link
            } else {
                toast.error(res.EM || "Cannot create payment link.");
            }
        } catch (error) {
            console.error(">>> Error during re-pay:", error);
            toast.error("Server error. Please try again later.");
        }
        setIsRepaying(null);
    };

    if (isLoading) {
        return <div className="my-orders-container"><div className="loading-state">Loading your orders...</div></div>;
    }

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <h1>Your Orders</h1>
                <p>Review your past and current physical and online orders.</p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <h3>No orders found</h3>
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="order-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order.id}>
                            
                            {/* --- HEADER --- */}
                            <div className="card-header">
                                <div className="header-info">
                                    <div className="info-group">
                                        <span className="label">Order Placed</span>
                                        <span className="value">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="info-group">
                                        <span className="label">Total</span>
                                        <span className="value">${parseFloat(order.final_amount).toFixed(2)}</span>
                                    </div>
                                    <div className="info-group">
                                        <span className="label">Order #</span>
                                        <span className="value">{order.id.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className={`status-badge ${order.order_status}`}>
                                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                </div>
                            </div>

                            {/* --- BODY --- */}
                            <div className="card-body">
                                
                                <div className="items-list">
                                    {order.OrderItems && order.OrderItems.map((item) => (
                                        <div className="order-item" key={item.id}>
                                            <img src={item.Product?.image_url} alt={item.Product?.name} />
                                            <div className="item-details">
                                                <h4>{item.Product?.name}</h4>
                                                <div className="qty">Quantity: {item.quantity}</div>
                                                <div className="price">${parseFloat(item.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-summary-box">
                                    <h4>Order Details</h4>
                                    
                                    <div className="summary-row total-row">
                                        <span>Final Amount</span>
                                        <span>${parseFloat(order.final_amount).toFixed(2)}</span>
                                    </div>

                                    <div className="payment-info">
                                        <div className="info-row">
                                            <span className="label">Payment Method</span>
                                            <span className="value">
                                                {order.payment_method === 'card' || order.payment_method === 'payos' ? 'PayOS' : 'Cash'} 
                                                <span style={{ color: order.payment_status === 'paid' ? '#16A34A' : '#64748B', marginLeft: '8px' }}>
                                                    ({order.payment_status})
                                                </span>
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Delivery Address</span>
                                            <span className="value" style={{ textTransform: 'none' }}>{order.address}</span>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        {order.payment_status === 'pending' && (order.payment_method === 'card' || order.payment_method === 'payos') && (
                                            <button 
                                                className="btn-repay" 
                                                onClick={() => handleRePay(order.id)}
                                                disabled={isRepaying === order.id}
                                            >
                                                {isRepaying === order.id ? 'Processing...' : 'Pay Now'}
                                            </button>
                                        )}
                                        <button 
                                            className="btn-invoice" 
                                            onClick={() => navigate('/invoice', { state: { order: order } })}
                                        >
                                            View Invoice
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;