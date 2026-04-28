import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, CalendarCheck, Loader } from 'lucide-react';
import { getDashboardStatsApi } from '../../services/adminService';
import './Dashboard.scss';
import { toast } from 'react-toastify';

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalReservations: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await getDashboardStatsApi();
            if (res && res.EC === 0) {
                setStats(res.DT);
            } else {
                toast.error(res.EM || "Could not load dashboard stats");
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("An error occurred while fetching data.");
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="loading-state"><Loader className="spin" size={30}/></div>;
    }

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Dashboard Overview</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Revenue</span>
                        <h3 className="stat-value">${Number(stats.totalRevenue).toFixed(2)}</h3>
                    </div>
                    <div className="stat-icon bg-green">
                        <DollarSign size={24} color="#16A34A" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Orders</span>
                        <h3 className="stat-value">{stats.totalOrders}</h3>
                    </div>
                    <div className="stat-icon bg-blue">
                        <ShoppingBag size={24} color="#2563EB" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Users</span>
                        <h3 className="stat-value">{stats.totalUsers}</h3>
                    </div>
                    <div className="stat-icon bg-purple">
                        <Users size={24} color="#9333EA" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Reservations</span>
                        <h3 className="stat-value">{stats.totalReservations}</h3>
                    </div>
                    <div className="stat-icon bg-orange">
                        <CalendarCheck size={24} color="#EA580C" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;