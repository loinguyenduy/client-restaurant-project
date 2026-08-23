import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MonitorSmartphone,
  ShoppingBag,
  Table,
  UserCheck,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { doLogoutSuccess } from "../../redux/actions/authAction";
import { doClearCart } from "../../redux/actions/cartAction";
import { logoutUserApi } from "../../services/authService";

const AdminSidebar = () => {
  const { account } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = account.role === "admin";
  const basePath = isAdmin ? "/admin" : "/staff";

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } finally {
      dispatch(doLogoutSuccess());
      dispatch(doClearCart());
      navigate("/portal/login");
    }
  };

  const navClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2><span>ROYAL</span>{isAdmin ? "ADMIN" : "STAFF"}</h2>
        <small>{isAdmin ? "Administration" : "Operations Portal"}</small>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <NavLink to={`${basePath}/dashboard`} className={navClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
        )}

        <NavLink to={`${basePath}/orders`} className={navClass}>
          <ShoppingBag size={18} /> {isAdmin ? "Manage Orders" : "Live Orders"}
        </NavLink>
        <NavLink to={`${basePath}/kitchen`} className={navClass}>
          <ChefHat size={18} /> Kitchen Display
        </NavLink>
        <NavLink to={`${basePath}/reservations`} className={navClass}>
          <CalendarDays size={18} /> Reservations
        </NavLink>
        <NavLink to={`${basePath}/pos`} className={navClass}>
          <MonitorSmartphone size={18} /> POS Terminal
        </NavLink>
        <NavLink to={`${basePath}/tables`} className={navClass}>
          <Table size={18} /> {isAdmin ? "Manage Tables" : "Table Status"}
        </NavLink>

        {!isAdmin && (
          <NavLink to={`${basePath}/attendance`} className={navClass}>
            <UserCheck size={18} /> Attendance
          </NavLink>
        )}

        {isAdmin && (
          <>
            <NavLink to={`${basePath}/attendance-logs`} className={navClass}>
              <ClipboardList size={18} /> Attendance Reports
            </NavLink>
            <NavLink to={`${basePath}/menu`} className={navClass}>
              <MenuIcon size={18} /> Menu
            </NavLink>
            <NavLink to={`${basePath}/users`} className={navClass}>
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
            <span className="role">{isAdmin ? "Administrator" : "Staff"}</span>
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
