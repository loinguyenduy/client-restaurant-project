import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, LogOut, User, ClipboardList, Calendar, ChevronDown, LayoutDashboard, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Header.scss';
import { doClearCart, doToggleCart } from '../../redux/actions/cartAction';
import { getRoleHome } from '../../utils/roleNavigation';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isAuthenticated, account } = useSelector(state => state.auth); 
  const cartItems = useSelector(state => state.cart.cartItems); 
  const isInternalUser = account.role === 'admin' || account.role === 'staff';

  // State quản lý Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    const closeAtDesktop = (event) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    desktopQuery.addEventListener('change', closeAtDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      desktopQuery.removeEventListener('change', closeAtDesktop);
    };
  }, [isMobileMenuOpen]);

  const publicLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/menu', label: 'Menu' },
    { to: '/reservation', label: 'Reservations' },
    { to: '/reviews', label: 'Reviews' },
  ];

  const renderPublicLinks = () => publicLinks.map((link) => (
    <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
      {link.label}
    </NavLink>
  ));

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

        <nav className="nav-menu" aria-label="Primary navigation">{renderPublicLinks()}</nav>

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

          <button className="mobile-menu-btn" type="button" aria-label="Open navigation" aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon size={24} />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && <button type="button" className="mobile-nav-overlay" aria-label="Close navigation" onClick={() => setIsMobileMenuOpen(false)} />}
      {isMobileMenuOpen && <aside id="mobile-navigation" className="mobile-nav-drawer open">
        <div className="mobile-nav-heading">
          <span>ROYAL RESTAURANT</span>
          <button type="button" aria-label="Close navigation" onClick={() => setIsMobileMenuOpen(false)}><X size={22} /></button>
        </div>
        <nav aria-label="Mobile navigation">{renderPublicLinks()}</nav>
        {!isAuthenticated && <div className="mobile-auth-links"><Link to="/login">Log In</Link><Link to="/register">Register</Link></div>}
      </aside>}
    </header>
  );
};

export default Header;
