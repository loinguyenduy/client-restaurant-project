import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Key, Shield, Loader, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import { changePasswordApi } from '../../services/userService';
import { logoutUserApi } from '../../services/authService';
import { doLogoutSuccess } from '../../redux/actions/authAction';
import { doClearCart } from '../../redux/actions/cartAction';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords({ ...passwords, [name]: value });
    };

    const forceLogout = async () => {
        try {
            await logoutUserApi();
            dispatch(doLogoutSuccess());
            dispatch(doClearCart());
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const handleSavePassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = passwords;

        // 1. Validate Frontend cơ bản
        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire('Wait!', 'Please fill in all password fields.', 'warning');
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire('Weak Password', 'New password must be at least 6 characters long.', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire('Mismatch', 'New password and confirm password do not match.', 'error');
            return;
        }

        if (oldPassword === newPassword) {
            Swal.fire('Invalid', 'New password must be different from the old password.', 'warning');
            return;
        }

        // 2. Gọi API Backend
        setIsSubmitting(true);
        try {
            const res = await changePasswordApi({ oldPassword, newPassword });
            
            if (res && res.EC === 0) {
                // Thành công -> Thông báo và ép Logout
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed!',
                    text: 'For your security, please log in again with your new password.',
                    confirmButtonText: 'Go to Login',
                    confirmButtonColor: '#0F172A', // Màu primary-navy
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        forceLogout();
                    }
                });
            } else {
                Swal.fire('Error', res.EM || 'Failed to change password', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Server error while changing password.', 'error');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="header-text">
                    <h2>Security & Password</h2>
                    <p>Ensure your account is using a long, random password to stay secure.</p>
                </div>
            </div>

            <div className="security-form" style={{ padding: '32px' }}>
                <div className="password-section" style={{ maxWidth: '500px' }}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                            Current Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} />
                            <input 
                                type="password" 
                                name="oldPassword"
                                value={passwords.oldPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} />
                            <input 
                                type="password" 
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter new password (min. 6 characters)"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                            Confirm New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94A3B8' }} />
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your new password"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSavePassword}
                        disabled={isSubmitting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'var(--primary-navy)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            width: '100%'
                        }}
                    >
                        {isSubmitting ? <Loader size={16} className="spin" /> : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;