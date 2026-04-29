import React from 'react';
import { MapPin, Phone, Mail, X } from 'lucide-react';
import './InvoiceModal.scss';

const InvoiceModal = ({ order, onClose }) => {
    if (!order) return null;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Phân biệt đơn Online (giao hàng) và Offline (tại bàn)
    const isOffline = order.type === 'offline';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="invoice-paper">
                    <div className="invoice-header">
                        <div className="brand-info">
                            <h2 className="brand-name">NAVY<span>DINE</span></h2>
                            <div className="contact-line"><MapPin size={14} /> 123 Ho Tay Lake, Hanoi</div>
                            <div className="contact-line"><Phone size={14} /> +84 961998670</div>
                            <div className="contact-line"><Mail size={14} /> contact@navydine.com</div>
                        </div>
                        <div className="invoice-meta">
                            <h1 className="invoice-title">INVOICE</h1>
                            <div className="meta-line">#{order.transaction_id}</div>
                            <div className="meta-line">Date: {formatDate(order.createdAt)}</div>
                            <div className={`status-badge ${order.order_status}`}>
                                {order.order_status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="invoice-details-row">
                        <div className="details-col">
                            <h5>Bill To:</h5>
                            <div className="info-text bold">{isOffline ? "Walk-in Guest" : (order.phone_receiver ? "Customer" : "Guest")}</div>
                            
                            {/* Nếu là đơn tại quán thì hiện Số Bàn, nếu giao đi thì hiện Địa chỉ */}
                            {isOffline ? (
                                <div className="info-text table-highlight">Table: {order.Table?.table_number || 'N/A'}</div>
                            ) : (
                                <>
                                    <div className="info-text">{order.address}</div>
                                    <div className="info-text">{order.phone_receiver}</div>
                                </>
                            )}
                            {order.note && <div className="info-text note">Note: {order.note}</div>}
                        </div>
                        <div className="details-col">
                            <h5>Order Details:</h5>
                            <div className="detail-line">
                                <span className="label">Method:</span>
                                <span className="val">{order.payment_method.toUpperCase()}</span>
                            </div>
                            <div className="detail-line">
                                <span className="label">Type:</span>
                                <span className="val">{order.type.toUpperCase()}</span>
                            </div>
                            <div className="detail-line">
                                <span className="label">Payment:</span>
                                <span className={`val status-text ${order.payment_status}`}>{order.payment_status.toUpperCase()}</span>
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
                            {!isOffline && (
                                <div className="summary-line">
                                    <span>Shipping Fee</span>
                                    <span className="val">$5.00</span>
                                </div>
                            )}
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
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;