import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, LogOut, User, ClipboardList, Calendar, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Header.scss';
import { doClearCart, doToggleCart } from '../../redux/actions/cartAction';
import { getRoleHome } from '../../utils/roleNavigation';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, account } = useSelector(state => state.auth); 
  const cartItems = useSelector(state => state.cart.cartItems); 
  const isInternalUser = account.role === 'admin' || account.role === 'staff';

  // State quản lý Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      dispatch(doLogoutSuccess());
      dispatch(doClearCart()); 
      toast.info("You have successfully logged out.");
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      toast.error("An error occurred while logging out.");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-main">ROYAL RESTAURANT</span>
        </Link>

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

        <div className="header-actions">
          
          {/* Nút Giỏ hàng giữ nguyên bên ngoài */}
          {!isInternalUser && <button
            className="action-item cart-icon" 
            onClick={() => dispatch(doToggleCart(true))}
          >
            <ShoppingCart size={22} />
            <span className="cart-count">{cartItems.length}</span>
          </button>}
          
          {isAuthenticated ? (
            <div className="user-dropdown-container" ref={dropdownRef}>
              <div 
                className="dropdown-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar-placeholder">
                  {account.username.charAt(0).toUpperCase()}
                </div>
                <span className="greeting">{account.username}</span>
                <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">{account.username}</p>
                    <p className="user-email">{account.email}</p>
                  </div>
                  
                  <div className="dropdown-links">
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <User size={16} /> My Profile
                    </Link>
                    {isInternalUser ? (
                      <Link to={getRoleHome(account.role)} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard size={16} /> Return to Portal
                      </Link>
                    ) : (
                      <>
                        <Link to="/my-orders" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          <ClipboardList size={16} /> Order History
                        </Link>
                        <Link to="/my-reservations" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          <Calendar size={16} /> Table Bookings
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="dropdown-footer">
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
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
