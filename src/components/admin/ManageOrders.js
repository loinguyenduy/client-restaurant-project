import React, { useEffect, useState } from 'react';
import { getAllOrdersAdminApi, updateOrderStatusApi } from '../../services/adminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './AdminTable.scss'; // Import CSS dùng chung

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await getAllOrdersAdminApi(1, 50, 'all'); // Lấy 50 đơn mới nhất
            if (res && res.EC === 0) {
                setOrders(res.DT.orders);
            } else {
                toast.error(res.EM || "Failed to fetch orders");
            }
        } catch (error) {
            toast.error("Server error");
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (orderId, currentStatus, newStatus) => {
        // Chặn đổi nếu đã Completed hoặc Cancelled (Double check ở Frontend)
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            toast.warning(`Cannot change status of a ${currentStatus} order.`);
            return;
        }

        // Hiện cảnh báo nếu chuyển sang Cancelled hoặc Completed
        if (newStatus === 'cancelled' || newStatus === 'completed') {
            const isConfirm = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to mark this order as ${newStatus.toUpperCase()}. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0F172A',
                cancelButtonColor: '#d33',
                confirmButtonText: `Yes, mark as ${newStatus}`
            });

            if (!isConfirm.isConfirmed) return;
        }

        try {
            const res = await updateOrderStatusApi(orderId, newStatus);
            if (res && res.EC === 0) {
                toast.success("Order status updated!");
                fetchOrders(); // Refresh data
            } else {
                toast.error(res.EM || "Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h1>Manage Orders</h1>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>DATE & TIME</th>
                                <th>CUSTOMER CONTACT</th>
                                <th>AMOUNT</th>
                                <th>PAYMENT STATUS</th>
                                <th>ORDER STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="empty-state">Loading data...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="empty-state">No orders found.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="primary-text">#{order.transaction_id}</span>
                                            <span className="secondary-text">{order.type} - {order.OrderItems?.length || 0} items</span>
                                        </td>
                                        <td>
                                            <span className="primary-text">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="secondary-text">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td>
                                            <span className="primary-text">{order.phone_receiver}</span>
                                            <span className="secondary-text">{order.address}</span>
                                        </td>
                                        <td>
                                            <span className="primary-text">${Number(order.final_amount).toFixed(2)}</span>
                                        </td>
                                        <td>
                                            {/* Dạng text để xem */}
                                            <span style={{ 
                                                color: order.payment_status === 'paid' ? '#16A34A' : '#D97706',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                className="status-select"
                                                value={order.order_status}
                                                onChange={(e) => handleStatusChange(order.id, order.order_status, e.target.value)}
                                                disabled={order.order_status === 'completed' || order.order_status === 'cancelled'}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageOrders;