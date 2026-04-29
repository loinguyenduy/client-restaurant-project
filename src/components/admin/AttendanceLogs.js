import React, { useEffect, useState } from 'react';
import { Loader, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAttendanceLogsApi } from '../../services/adminService';
import './AdminTable.scss'; 

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Tạm thời để đơn giản, ta load danh sách trước. Pagination & Search có thể gắn sau nếu cần.

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const res = await getAttendanceLogsApi(1, 100, ''); 
            if (res && res.EC === 0) {
                setLogs(res.DT.logs);
            } else toast.error(res.EM || "Failed to fetch logs");
        } catch (error) { toast.error("Server error"); }
        setIsLoading(false);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

  const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 'In Progress...';

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        const diffInMs = end.getTime() - start.getTime();

        if (diffInMs <= 0) return '0h 0m';

        const totalMinutes = Math.floor(diffInMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        return `${hours}h ${mins}m`;
    };
    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h1>Attendance Logs</h1>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>STAFF NAME</th>
                                <th>DATE</th>
                                <th>CHECK IN</th>
                                <th>CHECK OUT</th>
                                <th>TOTAL DURATION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="empty-state"><Loader className="spin" size={24}/></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No attendance records found.</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <span className="primary-text">{log.User?.full_name || 'Unknown Staff'}</span>
                                            <span className="secondary-text">{log.User?.email}</span>
                                        </td>
                                        <td><span className="primary-text">{formatDate(log.check_in_time)}</span></td>
                                        <td>
                                            <span style={{ color: '#16A34A', fontWeight: '600' }}>
                                                {formatTime(log.check_in_time)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: log.check_out_time ? '#DC2626' : '#94A3B8', fontWeight: '600' }}>
                                                {formatTime(log.check_out_time)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="primary-text">
                                                {calculateDuration(log.check_in_time, log.check_out_time)}
                                            </span>
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

export default AttendanceLogs;