import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, User, XCircle, Loader, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserReservationsApi, cancelReservationApi } from '../../services/reservationService';
import './MyReservations.scss';

const MyReservations = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const res = await getUserReservationsApi();
            if (res && res.EC === 0) {
                setReservations(res.DT);
            } else {
                toast.error(res.EM || "Could not load reservations.");
            }
        } catch (error) {
            console.error("Fetch reservations error:", error);
            toast.error("An error occurred while fetching your data.");
        }
        setIsLoading(false);
    };

    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            setIsCancelling(id);
            try {
                const res = await cancelReservationApi(id);
                if (res && res.EC === 0) {
                    toast.success("Reservation cancelled successfully.");
                    fetchReservations(); // Refresh list
                } else {
                    toast.error(res.EM || "Could not cancel reservation.");
                }
            } catch (error) {
                toast.error("An error occurred during cancellation.");
            }
            setIsCancelling(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    if (isLoading) {
        return (
            <div className="reservations-loading">
                <Loader className="spin" />
                <p>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="my-reservations-container">
            <div className="header-section">
                <div className="title-area">
                    <h1>Your Reservations</h1>
                    <p>Review your past and upcoming table bookings.</p>
                </div>
                <button className="btn-book-more" onClick={() => navigate('/reservation')}>
                    <Plus size={18} /> Book a Table
                </button>
            </div>

            <div className="reservations-content">
                <h3 className="section-subtitle"><Calendar size={18} /> Upcoming & History</h3>
                
                {reservations.length === 0 ? (
                    <div className="empty-state">
                        <p>You have no reservations yet.</p>
                    </div>
                ) : (
                    <div className="reservations-grid">
                        {reservations.map((res) => (
                            <div className="res-card" key={res.id}>
                                <div className="card-header">
                                    <div className="status-info">
                                        <InfoIcon status={res.status} />
                                        <span className="status-text">
                                            {res.status === 'pending' ? 'Pending Confirmation' : 
                                             res.status === 'confirmed' ? 'Confirmed' : 
                                             res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                        </span>
                                    </div>
                                    <span className={`badge ${res.status}`}>{res.status}</span>
                                </div>

                                <div className="card-body">
                                    <div className="info-main">
                                        <div className="date-time">
                                            <label>DATE & TIME</label>
                                            <p className="primary-text">{formatDate(res.reservation_time)}</p>
                                            <p className="secondary-text">{formatTime(res.reservation_time)}</p>
                                        </div>
                                        <div className="party-size">
                                            <label>PARTY SIZE</label>
                                            <div className="guest-count">
                                                <Users size={18} />
                                                <span>{res.number_of_people}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-contact">
                                        <p>Contact Name: <strong>{res.contact_name}</strong></p>
                                        {res.note && <p className="note">Note: "{res.note}"</p>}
                                    </div>
                                </div>

                                {res.status === 'pending' && (
                                    <button 
                                        className="btn-cancel" 
                                        onClick={() => handleCancel(res.id)}
                                        disabled={isCancelling === res.id}
                                    >
                                        {isCancelling === res.id ? <Loader size={14} className="spin" /> : <XCircle size={16} />}
                                        Cancel Reservation
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for icon
const InfoIcon = ({ status }) => {
    return (
        <div className={`info-icon-circle ${status}`}>
            <span className="info-mark">i</span>
        </div>
    );
};

export default MyReservations;