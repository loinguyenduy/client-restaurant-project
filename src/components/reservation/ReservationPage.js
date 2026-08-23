import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Clock, Users, Info, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAvailableSlotsApi, createReservationApi } from '../../services/reservationService';
import './Reservation.scss';
import { getRestaurantDateInputValue } from '../../utils/reservationTime';

const ReservationPage = () => {
    const navigate = useNavigate();
    const { account, isAuthenticated } = useSelector(state => state.auth);

    // 1. Quản lý các State
    const [step, setStep] = useState(1);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slotsError, setSlotsError] = useState('');
    const [formError, setFormError] = useState('');

    // Lấy ngày mai làm mặc định (định dạng YYYY-MM-DD)
    const defaultDate = getRestaurantDateInputValue(1);

    const [reservationData, setReservationData] = useState({
        date: defaultDate,
        partySize: 2,
        time: '',
        contact_name: account?.username || '',
        contact_phone: account?.phone_number || '', // Đã đồng bộ trường phone_number
        note: ''
    });

    // 2. Lắng nghe thay đổi Ngày & Số người để gọi API lấy giờ trống
    useEffect(() => {
        fetchAvailableSlots();
    }, [reservationData.date, reservationData.partySize]);

    const fetchAvailableSlots = async () => {
        setIsLoadingSlots(true);
        setSlotsError('');
        // Reset giờ đã chọn nếu đổi ngày/số người
        setReservationData(prev => ({ ...prev, time: '' })); 
        
        try {
            const res = await getAvailableSlotsApi(reservationData.date, reservationData.partySize);
            if (res && res.EC === 0) {
                setAvailableSlots(res.DT);
            } else {
                setSlotsError(res.EM || "Could not load available time slots.");
            }
        } catch (error) {
            console.error("Fetch slots error:", error);
            setSlotsError("Server error while loading slots.");
        }
        setIsLoadingSlots(false);
    };

    // 3. Các hàm xử lý sự kiện
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReservationData({ ...reservationData, [name]: value });
    };

    const handleTimeSelect = (timeStr, status) => {
        if (status !== 'available') return;
        setReservationData({ ...reservationData, time: timeStr });
    };

    const handleContinue = () => {
        if (!isAuthenticated) {
            toast.info("Please log in to continue your booking.");
            navigate('/login');
            return;
        }
        if (!reservationData.time) {
            toast.warning("Please select a time slot first.");
            return;
        }
        setStep(2);
    };

    const handleConfirmBooking = async () => {
        setFormError('');
        if (!reservationData.contact_name || !reservationData.contact_phone) {
            setFormError("Please fill in your name and phone number.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createReservationApi(reservationData);
            if (res && res.EC === 0) {
                toast.success("Table reserved successfully!");
                navigate('/my-reservations');
            } else {
                toast.error(res.EM || "Failed to reserve table. It might be fully booked.");
                // Load lại danh sách giờ nếu vừa bị người khác đặt mất
                fetchAvailableSlots(); 
                setStep(1);
            }
        } catch (error) {
            toast.error("An error occurred during booking.");
        }
        setIsSubmitting(false);
    };

    // 4. Render Layout (JSX)
    const lunchSlots = availableSlots.filter(s => s.type === 'lunch');
    const dinnerSlots = availableSlots.filter(s => s.type === 'dinner');

    // Hàm format ngày hiển thị trên Sidebar (VD: Sunday, April 26, 2026)
    const displayDate = new Date(reservationData.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="reservation-page">
            <div className="page-header">
                <h1>Reserve Your Table</h1>
                <p>Select your preferred time and date to experience culinary excellence.</p>
            </div>

            <div className="reservation-container">
                {/* SIDEBAR */}
                <div className="reservation-sidebar">
                    <h3 className="gold-title">Your Reservation</h3>
                    <div className="summary-list">
                        <div className="summary-item">
                            <Calendar size={18} />
                            <span>{displayDate}</span>
                        </div>
                        <div className="summary-item">
                            <Clock size={18} />
                            <span>{reservationData.time || 'Select a time'}</span>
                        </div>
                        <div className="summary-item">
                            <Users size={18} />
                            <span>{reservationData.partySize} Guests</span>
                        </div>
                    </div>

                    <div className="info-box">
                        <h4><Info size={16} /> Need to know</h4>
                        <ul>
                            <li>Tables are held for 15 minutes.</li>
                            <li>Smart casual dress code.</li>
                            <li>2-hour dining limit for parties under 4.</li>
                        </ul>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="reservation-main">
                    {step === 1 ? (
                        <div className="step-1-container">
                            <h2>1. Select Date & Time</h2>
                            
                            <div className="filters-row">
                                <div className="input-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={reservationData.date} 
                                        onChange={handleInputChange} 
                                        min={getRestaurantDateInputValue()}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Party Size</label>
                                    <select name="partySize" value={reservationData.partySize} onChange={handleInputChange}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="legend-row">
                                <span className="legend-item"><span className="dot available"></span> Available</span>
                                <span className="legend-item"><span className="dot selected"></span> Selected</span>
                                <span className="legend-item"><span className="dot booked"></span> Booked</span>
                            </div>

                            {slotsError ? <div className="loading-slots error" role="alert"><p>{slotsError}</p><button type="button" onClick={fetchAvailableSlots}>Retry</button></div> : isLoadingSlots ? (
                                <div className="loading-slots">Checking availability...</div>
                            ) : (
                                <div className="time-grids">
                                    <div className="grid-section">
                                        <h3 className="service-title"><Clock size={16}/> Lunch Service</h3>
                                        <div className="slots-wrapper">
                                            {lunchSlots.map((slot, index) => (
                                                <button 
                                                    key={index}
                                                    className={`slot-btn ${slot.status} ${reservationData.time === slot.time ? 'selected' : ''}`}
                                                    disabled={slot.status !== 'available'}
                                                    onClick={() => handleTimeSelect(slot.time, slot.status)}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid-section">
                                        <h3 className="service-title"><Clock size={16}/> Dinner Service</h3>
                                        <div className="slots-wrapper">
                                            {dinnerSlots.map((slot, index) => (
                                                <button 
                                                    key={index}
                                                    className={`slot-btn ${slot.status} ${reservationData.time === slot.time ? 'selected' : ''}`}
                                                    disabled={slot.status !== 'available'}
                                                    onClick={() => handleTimeSelect(slot.time, slot.status)}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="step-actions">
                                <button 
                                    className="btn-continue" 
                                    onClick={handleContinue}
                                    disabled={!reservationData.time}
                                >
                                    Continue to Details &rarr;
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="step-2-container">
                            <div className="step-header">
                                <button className="btn-back" onClick={() => setStep(1)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <h2>2. Contact Details</h2>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" name="contact_name" value={reservationData.contact_name} onChange={handleInputChange} placeholder="John Doe" />
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <input type="text" name="contact_phone" value={reservationData.contact_phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" />
                                </div>
                                <div className="input-group full-width">
                                    <label>Special Requests (Optional)</label>
                                    <textarea 
                                        name="note" 
                                        value={reservationData.note} 
                                        onChange={handleInputChange} 
                                        placeholder="Allergies, anniversaries, preferred seating..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="step-actions confirmation">
                                {formError && <p className="reservation-form-error" role="alert">{formError}</p>}
                                <p>By confirming, you agree to our reservation policy.</p>
                                <button 
                                    className="btn-confirm" 
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Booking'} <CheckCircle size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationPage;
