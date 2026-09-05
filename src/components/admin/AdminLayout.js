import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.scss';

const getStoredSidebarState = () => {
    try {
        return localStorage.getItem('royalRestaurant.sidebarCollapsed') === 'true';
    } catch (error) {
        return false;
    }
};

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(getStoredSidebarState);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('royalRestaurant.sidebarCollapsed', String(collapsed));
        } catch (error) {
            // The portal still works when storage is unavailable; only persistence is skipped.
        }
    }, [collapsed]);

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMobileOpen(false);
        };
        const desktopQuery = window.matchMedia('(min-width: 901px)');
        const closeAtDesktop = (event) => {
            if (event.matches) setMobileOpen(false);
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        desktopQuery.addEventListener('change', closeAtDesktop);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
            desktopQuery.removeEventListener('change', closeAtDesktop);
        };
    }, [mobileOpen]);

    return (
        <div className={`admin-layout-container ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-sidebar-open' : ''}`}>
            <div className="admin-mobile-bar"><button type="button" aria-label="Open portal navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button><strong>ROYAL RESTAURANT</strong></div>
            {mobileOpen && <button type="button" className="admin-sidebar-overlay" aria-label="Close portal navigation" onClick={() => setMobileOpen(false)} />}
            <AdminSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} onNavigate={() => setMobileOpen(false)} />
            <main className="admin-main-content">
                <Outlet /> {/* Nơi render nội dung của các trang con (Dashboard, Orders...) */}
            </main>
        </div>
    );
};

export default AdminLayout;
