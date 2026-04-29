import React, { useEffect, useState } from 'react';
import { getAllOrdersAdminApi, updateOrderStatusApi } from '../../services/adminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './AdminTable.scss'; 
import InvoiceModal from './InvoiceModal';
import { Eye } from 'lucide-react';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await getAllOrdersAdminApi(1, 50, 'all'); 
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
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            toast.warning(`Cannot change status of a ${currentStatus} order.`);
            return;
        }

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
                fetchOrders(); 
            } else {
                toast.error(res.EM || "Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
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
                                <th>PAYMENT METHOD</th>
                                <th>PAYMENT STATUS</th>
                                <th>ORDER STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" className="empty-state">Loading data...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="7" className="empty-state">No orders found.</td></tr>
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
                                            <span className="primary-text">{order.phone_receiver || 'Walk-in Guest'}</span>
                                            <span className="secondary-text">{order.Table ? `Table: ${order.Table.table_number}` : (order.address || 'No Address')}</span>
                                        </td>
                                        <td>
                                            <span className="primary-text">${Number(order.final_amount).toFixed(2)}</span>
                                        </td>
                                        <td>
                                            <span className="primary-text" style={{ textTransform: 'uppercase' }}>
                                                {order.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                color: order.payment_status === 'paid' ? '#16A34A' : order.payment_status === 'failed' ? '#DC2626' : '#D97706',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                <button 
                                                    onClick={() => handleViewInvoice(order)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}
                                                    title="View Invoice"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <InvoiceModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ManageOrders;