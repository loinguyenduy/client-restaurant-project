import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { useSelector } from 'react-redux';
import './Invoice.scss';

const Invoice = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    const { account } = useSelector(state => state.auth);

    // get order data passed from MyOrders page via location state
    const order = location.state?.order;

    if (!order) {
        return <Navigate to="/my-orders" />;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="invoice-page-container">
            <div className="invoice-actions">
                <button className="back-btn" onClick={() => navigate('/my-orders')}>
                    <ArrowLeft size={18} />
                    Back to Orders
                </button>
            </div>

            <div className="invoice-paper">
                <div className="invoice-header">
                    <div className="brand-info">
                        <h2 className="brand-name">ROYAL<span>RESTAURANT</span></h2>
                        <div className="contact-line">
                            <MapPin /> 123 Ho Tay Lake, Hanoi, Vietnam
                        </div>
                        <div className="contact-line">
                            <Phone /> +84 961998670
                        </div>
                        <div className="contact-line">
                            <Mail /> contact@royalrestaurant.com
                        </div>
                    </div>
                    <div className="invoice-meta">
                        <h1 className="invoice-title">INVOICE</h1>
                        <div className="meta-line">#{order.id.substring(0, 8).toUpperCase()}</div>
                        <div className="meta-line">Date: {formatDate(order.createdAt)}</div>
                        <div className={`status-badge ${order.order_status}`}>
                            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </div>
                    </div>
                </div>

                <div className="invoice-details-row">
                    <div className="details-col">
                        <h5>Bill To:</h5>
                        <div className="info-text bold">{account.username || "Guest Customer"}</div>
                        <div className="info-text">{order.address}</div>
                        <div className="info-text">{order.phone_receiver}</div>
                        {order.note && <div className="info-text note">Note: {order.note}</div>}
                    </div>
                    <div className="details-col">
                        <h5>Order Details:</h5>
                        <div className="detail-line">
                            <span className="label">Method:</span>
                            <span className="val">{order.payment_method}</span>
                        </div>
                        <div className="detail-line">
                            <span className="label">Type:</span>
                            <span className="val">{order.type}</span>
                        </div>
                        <div className="detail-line">
                            <span className="label">Status:</span>
                            <span className="val">{order.payment_status}</span>
                        </div>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.OrderItems && order.OrderItems.map(item => (
                            <tr key={item.id}>
                                <td className="item-name">{item.Product?.name}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">${parseFloat(item.price).toFixed(2)}</td>
                                <td className="text-right">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="invoice-summary">
                    <div className="summary-box">
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span className="val">${parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping Fee</span>
                            <span className="val">$5.00</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax (8%)</span>
                            <span className="val">${(parseFloat(order.total_amount) * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="total-line">
                            <span>Total Amount</span>
                            <span>${parseFloat(order.final_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="invoice-footer">
                    <h4>Thank you for dining with us!</h4>
                    <p>If you have any questions concerning this invoice, use the contact information above.</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;