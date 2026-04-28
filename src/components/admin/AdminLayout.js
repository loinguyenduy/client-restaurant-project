import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.scss';

const AdminLayout = () => {
    return (
        <div className="admin-layout-container">
            <AdminSidebar />
            <main className="admin-main-content">
                <Outlet /> {/* Nơi render nội dung của các trang con (Dashboard, Orders...) */}
            </main>
        </div>
    );
};

export default AdminLayout;