import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CalendarDays, Menu as MenuIcon, Users, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { doClearCart } from '../../redux/actions/cartAction';

const AdminSidebar = () => {
    const { account } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUserApi();
            dispatch(doLogoutSuccess());
            dispatch(doClearCart());
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const isAdmin = account.role === 'admin';

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-brand">
                <h2><span>NAVY</span>ADMIN</h2>
            </div>

            <nav className="sidebar-nav">
                {isAdmin && (
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                )}
                
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <ShoppingBag size={18} /> Manage Orders
                </NavLink>

                <NavLink to="/admin/reservations" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <CalendarDays size={18} /> Manage Reservations
                </NavLink>

                {isAdmin && (
                    <>
                        <NavLink to="/admin/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <MenuIcon size={18} /> Menu
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Users size={18} /> Account Management
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">{account.username?.charAt(0).toUpperCase()}</div>
                    <div className="details">
                        <span className="name">{account.full_name || account.username}</span>
                        <span className="role">{account.role === 'admin' ? 'Manager' : 'Staff'}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;