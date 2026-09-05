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
  Boxes,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { doLogoutSuccess } from "../../redux/actions/authAction";
import { doClearCart } from "../../redux/actions/cartAction";
import { logoutUserApi } from "../../services/authService";

const AdminSidebar = ({ collapsed, onToggleCollapsed, onNavigate }) => {
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
  const navProps = (label) => ({ className: navClass, onClick: onNavigate, title: collapsed ? label : undefined, "aria-label": label });

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-copy"><span className="brand-short" aria-hidden="true">RR</span><div className="brand-full"><strong>ROYAL RESTAURANT</strong><small>{isAdmin ? "Administration Portal" : "Operations Portal"}</small></div></div>
        <button type="button" className="sidebar-collapse-button" onClick={onToggleCollapsed} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <NavLink to={`${basePath}/dashboard`} {...navProps("Dashboard")}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </NavLink>
        )}

        <NavLink to={`${basePath}/orders`} {...navProps(isAdmin ? "Manage Orders" : "Live Orders")}>
          <ShoppingBag size={18} /><span>{isAdmin ? "Manage Orders" : "Live Orders"}</span>
        </NavLink>
        <NavLink to={`${basePath}/kitchen`} {...navProps("Kitchen Display")}>
          <ChefHat size={18} /><span>Kitchen Display</span>
        </NavLink>
        <NavLink to={`${basePath}/reservations`} {...navProps("Reservations")}>
          <CalendarDays size={18} /><span>Reservations</span>
        </NavLink>
        <NavLink to={`${basePath}/pos`} {...navProps("POS / Tables")}>
          <MonitorSmartphone size={18} /><span>POS / Tables</span>
        </NavLink>
        {isAdmin && <NavLink to={`${basePath}/tables`} {...navProps("Manage Tables")}><Table size={18} /><span>Manage Tables</span></NavLink>}

        {!isAdmin && (
          <NavLink to={`${basePath}/attendance`} {...navProps("Attendance")}>
            <UserCheck size={18} /><span>Attendance</span>
          </NavLink>
        )}

        {isAdmin && (
          <>
            <NavLink to={`${basePath}/attendance-logs`} {...navProps("Attendance Reports")}>
              <ClipboardList size={18} /><span>Attendance Reports</span>
            </NavLink>
            <NavLink to={`${basePath}/menu`} {...navProps("Menu")}>
              <MenuIcon size={18} /><span>Menu</span>
            </NavLink>
            <NavLink to={`${basePath}/inventory`} {...navProps("Inventory")}>
              <Boxes size={18} /><span>Inventory</span>
            </NavLink>
            <NavLink to={`${basePath}/reviews`} {...navProps("Reviews")}>
              <Star size={18} /><span>Reviews</span>
            </NavLink>
            <NavLink to={`${basePath}/users`} {...navProps("Account Management")}>
              <Users size={18} /><span>Account Management</span>
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
        <button className="btn-logout" onClick={handleLogout} title={collapsed ? "Logout" : undefined} aria-label="Logout">
          <LogOut size={16} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
