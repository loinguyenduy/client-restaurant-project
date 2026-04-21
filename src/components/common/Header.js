import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, LogOut, ClipboardList } from 'lucide-react'; // Thêm ClipboardList
import { useSelector, useDispatch } from 'react-redux';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Header.scss';
import { doClearCart, doToggleCart } from '../../redux/actions/cartAction';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, account } = useSelector(state => state.auth); 
  const cartItems = useSelector(state => state.cart.cartItems); 

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      dispatch(doLogoutSuccess());
      dispatch(doClearCart()); 
      toast.info("You have successfully logged out.");
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
          <div className="user-tools">
          
          {/* Nút My Orders (Chỉ hiện khi đã đăng nhập) nằm ngang hàng và cạnh Cart */}
          {isAuthenticated && (
            <Link 
              to="/my-orders" 
              className="action-item" 
              title="My Orders"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '10px', color: 'inherit' }}
            >
              <ClipboardList size={22} />
            </Link>
          )}

          <button 
            className="action-item cart-icon" 
            onClick={() => dispatch(doToggleCart(true))}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ShoppingCart size={22} />
            <span className="cart-count">{cartItems.length}</span>
          </button>
          </div>
          
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