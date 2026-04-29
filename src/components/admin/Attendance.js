import React, { useEffect, useState } from 'react';
import { User, UserCheck, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { checkAttendanceStatusApi, checkInApi, checkOutApi } from '../../services/adminService';
import './Attendance.scss';

const Attendance = () => {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch trạng thái ban đầu
    useEffect(() => {
        fetchStatus();
    }, []);

    // 2. Logic đếm giờ (Live Timer)
    useEffect(() => {
        let interval;
        if (isClockedIn && startTime) {
            interval = setInterval(() => {
                const start = new Date(startTime).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setElapsedTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        } else {
            setElapsedTime('00:00:00');
        }

        return () => clearInterval(interval);
    }, [isClockedIn, startTime]);

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const res = await checkAttendanceStatusApi();
            if (res && res.EC === 0) {
                setIsClockedIn(res.DT.isClockedIn);
                if (res.DT.isClockedIn && res.DT.latestRecord) {
                    setStartTime(res.DT.latestRecord.check_in_time);
                } else {
                    setStartTime(null);
                }
            } else {
                toast.error(res.EM || "Failed to fetch attendance status");
            }
        } catch (error) {
            toast.error("Server error while fetching status");
        }
        setIsLoading(false);
    };

    const handleCheckIn = async () => {
        try {
            const res = await checkInApi();
            if (res && res.EC === 0) {
                toast.success("Clocked in successfully!");
                fetchStatus(); // Refresh lại trạng thái
            } else {
                toast.error(res.EM);
            }
        } catch (error) {
            toast.error("Error during check in");
        }
    };

    const handleCheckOut = async () => {
        const isConfirm = await Swal.fire({
            title: 'End Shift?',
            text: "Are you sure you want to clock out?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Yes, Check Out'
        });

        if (isConfirm.isConfirmed) {
            try {
                const res = await checkOutApi();
                if (res && res.EC === 0) {
                    toast.success("Clocked out successfully!");
                    fetchStatus();
                } else {
                    toast.error(res.EM);
                }
            } catch (error) {
                toast.error("Error during check out");
            }
        }
    };

    if (isLoading) {
        return <div className="attendance-container"><Loader className="spin" size={30} /></div>;
    }

    return (
        <div className="attendance-container admin-page-container">
            <div className="page-header">
                <h1>Attendance Log</h1>
            </div>

            <div className="attendance-card">
                <div className="attendance-content">
                    
                    {/* Icon Trạng Thái */}
                    <div className={`status-icon-circle ${isClockedIn ? 'active' : 'inactive'}`}>
                        {isClockedIn ? <UserCheck size={32} /> : <User size={32} />}
                    </div>

                    {/* Text Trạng Thái */}
                    <h2>You are currently {isClockedIn ? 'clocked in' : 'clocked out'}</h2>
                    
                    {isClockedIn ? (
                        <>
                            <p className="subtitle">
                                Started shift at {new Date(startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="live-timer">Duration: {elapsedTime}</div>
                            <button className="btn-action btn-checkout" onClick={handleCheckOut}>
                                Check Out
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="subtitle">Please check in to start your shift.</p>
                            <button className="btn-action btn-checkin" onClick={handleCheckIn}>
                                Check In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Attendance;