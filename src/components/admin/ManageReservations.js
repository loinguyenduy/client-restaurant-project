import React, { useEffect, useState } from 'react';
import { getAllReservationsAdminApi, updateReservationStatusApi } from '../../services/adminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './AdminTable.scss'; 

const ManageReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const res = await getAllReservationsAdminApi(1, 50, 'all', '');
            if (res && res.EC === 0) {
                setReservations(res.DT.reservations);
            } else {
                toast.error(res.EM || "Failed to fetch reservations");
            }
        } catch (error) {
            toast.error("Server error");
        }
        setIsLoading(false);
    };

    const handleStatusChange = async (reservationId, currentStatus, newStatus) => {
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            toast.warning(`Cannot change status of a ${currentStatus} reservation.`);
            return;
        }

        if (newStatus === 'cancelled' || newStatus === 'completed') {
            const isConfirm = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to mark this reservation as ${newStatus.toUpperCase()}. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0F172A',
                cancelButtonColor: '#d33',
                confirmButtonText: `Yes, mark as ${newStatus}`
            });

            if (!isConfirm.isConfirmed) return;
        }

        try {
            const res = await updateReservationStatusApi(reservationId, newStatus);
            if (res && res.EC === 0) {
                toast.success("Reservation status updated!");
                fetchReservations(); 
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
                <h1>Manage Reservations</h1>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>DATE & TIME</th>
                                <th>GUEST INFO</th>
                                <th>PARTY SIZE</th>
                                <th>SPECIAL REQUESTS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="empty-state">Loading data...</td></tr>
                            ) : reservations.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No reservations found.</td></tr>
                            ) : (
                                reservations.map(res => (
                                    <tr key={res.id}>
                                        <td>
                                            <span className="primary-text">
                                                {new Date(res.reservation_time).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                            </span>
                                            <span className="secondary-text">
                                                {new Date(res.reservation_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="primary-text">{res.contact_name}</span>
                                            <span className="secondary-text">{res.contact_phone}</span>
                                        </td>
                                        <td>
                                            <span className="primary-text">{res.number_of_people} people</span>
                                        </td>
                                        <td>
                                            <span className="secondary-text">{res.note || 'None'}</span>
                                        </td>
                                        <td>
                                            <select 
                                                className="status-select"
                                                value={res.status}
                                                onChange={(e) => handleStatusChange(res.id, res.status, e.target.value)}
                                                disabled={res.status === 'completed' || res.status === 'cancelled'}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
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

export default ManageReservations;