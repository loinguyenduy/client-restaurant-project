// src/components/common/Header.js
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, LogOut } from 'lucide-react'; // Đã bỏ User icon
import { useSelector, useDispatch } from 'react-redux';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, account } = useSelector(state => state.auth);

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      dispatch(doLogoutSuccess());
      toast.info("You have successfully logged out.");
      navigate('/');
    } catch (error) {
      toast.error("An error occurred while logging out.");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Restaurant Logo */}
        <Link to="/" className="logo">
          <span className="logo-main">ROYAL RESTAURANT</span> {/* Đổi tên theo ảnh của bạn */}
        </Link>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About Us
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Menu
          </NavLink>
          <NavLink to="/reservation" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Reservation
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Contact
          </NavLink>
        </nav>

        {/* Action Icons */}
        <div className="header-actions">
          <Link to="/cart" className="action-item cart-icon">
            <ShoppingCart size={22} />
            <span className="cart-count">0</span>
          </Link>
          
          {/* LOGIC HIỂN THỊ NÚT ĐĂNG NHẬP / THÔNG TIN USER */}
          {isAuthenticated ? (
            <div className="user-profile">
              <span className="greeting">Welcome, {account.username}</span>
              <button className="action-item logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Log In</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}

          <button className="mobile-menu-btn">
            <MenuIcon size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;