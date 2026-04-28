import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { logoutUserApi } from '../../services/authService';
import { doClearCart } from '../../redux/actions/cartAction';
import ProfileDetails from './ProfileDetails';
import SecuritySettings from './SecuritySettings'; // Chúng ta sẽ làm file này ở bước sau
import './Profile.scss';

const ProfileLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { account } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('details'); // 'details' hoặc 'security'

    const handleLogout = async () => {
        try {
            await logoutUserApi();
            dispatch(doLogoutSuccess());
            dispatch(doClearCart());
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="profile-page-container">
            <div className="back-to-home">
                <button onClick={() => navigate('/')}>
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </div>

            <div className="profile-layout">
                {/* SIDEBAR */}
                <aside className="profile-sidebar">
                    <div className="user-overview">
                        <div className="avatar-big">
                            {account.username.charAt(0).toUpperCase()}
                        </div>
                        <h3>{account.full_name || account.username}</h3>
                        <span className="role-badge">{account.role?.toUpperCase()}</span>
                    </div>

                    <nav className="sidebar-menu">
                        <button 
                            className={`menu-item ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <User size={18} /> Profile Details
                        </button>
                        <button 
                            className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <ShieldCheck size={18} /> Security & Password
                        </button>
                        
                        <div className="menu-divider"></div>
                        
                        <button className="menu-item logout" onClick={handleLogout}>
                            <LogOut size={18} /> Logout
                        </button>
                    </nav>
                </aside>

                {/* MAIN CONTENT */}
                <main className="profile-content">
                    {activeTab === 'details' ? <ProfileDetails /> : <SecuritySettings />}
                </main>
            </div>
        </div>
    );
};

export default ProfileLayout;