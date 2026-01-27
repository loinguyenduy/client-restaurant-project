// src/components/common/Header.js
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon } from 'lucide-react';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Restaurant Logo */}
        <Link to="/" className="logo">
          <span className="logo-main">ROYAL</span>
          <span className="logo-sub">RESTAURANT</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            ABOUT US
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            MENU
          </NavLink>
          <NavLink to="/reservation" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            RESERVATION
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            CONTACT
          </NavLink>
        </nav>

        {/* Action Icons */}
        <div className="header-actions">
          <Link to="/cart" className="action-item cart-icon">
            <ShoppingCart size={22} />
            <span className="cart-count">0</span>
          </Link>
          <Link to="/login" className="action-item user-icon">
            <User size={22} />
          </Link>
          <button className="mobile-menu-btn">
            <MenuIcon size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;