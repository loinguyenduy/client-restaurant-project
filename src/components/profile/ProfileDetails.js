import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit2, Save, X, Mail, User as UserIcon, Phone, MapPin, Loader } from 'lucide-react';
import { updateProfileApi } from '../../services/userService';
import { doUpdateUserInfo } from '../../redux/actions/authAction';
import Swal from 'sweetalert2';

const ProfileDetails = () => {
    const dispatch = useDispatch();
    const { account } = useSelector(state => state.auth);

    // State quản lý chế độ Chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Local state để lưu dữ liệu tạm thời khi gõ vào input
    const [formData, setFormData] = useState({
        full_name: account.full_name || '',
        phone_number: account.phone_number || '',
        gender: account.gender || 'other'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCancel = () => {
        // Reset lại dữ liệu theo Redux và đóng form
        setFormData({
            full_name: account.full_name || '',
            phone_number: account.phone_number || '',
            gender: account.gender || 'other'
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const res = await updateProfileApi(formData);
            if (res && res.EC === 0) {
                // 1. Cập nhật Redux để Header và Sidebar thay đổi theo
                dispatch(doUpdateUserInfo(res.DT));
                
                // 2. Thông báo thành công
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Your profile has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                setIsEditing(false);
            } else {
                Swal.fire('Error', res.EM || 'Update failed', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred during update', 'error');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="header-text">
                    <h2>Personal Information</h2>
                    <p>Manage your personal details and contact info.</p>
                </div>
                {!isEditing ? (
                    <button className="btn-edit-toggle" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} /> Edit
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="btn-cancel" onClick={handleCancel} disabled={isSubmitting}>
                            <X size={16} /> Cancel
                        </button>
                        <button className="btn-save" onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <Loader size={16} className="spin" /> : <Save size={16} />} Save
                        </button>
                    </div>
                )}
            </div>

            <div className="info-grid">
                {/* Full Name */}
                <div className="info-item">
                    <div className="icon-box"><UserIcon size={20} /></div>
                    <div className="field-content">
                        <label>Full Name</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="full_name" 
                                value={formData.full_name} 
                                onChange={handleInputChange} 
                            />
                        ) : (
                            <p>{account.full_name || "Not provided"}</p>
                        )}
                    </div>
                </div>

                {/* Email (Read Only) */}
                <div className="info-item readonly">
                    <div className="icon-box"><Mail size={20} /></div>
                    <div className="field-content">
                        <label>Email Address</label>
                        <p>{account.email}</p>
                    </div>
                </div>

                {/* Phone Number */}
                <div className="info-item">
                    <div className="icon-box"><Phone size={20} /></div>
                    <div className="field-content">
                        <label>Phone Number</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="phone_number" 
                                value={formData.phone_number} 
                                onChange={handleInputChange} 
                            />
                        ) : (
                            <p>{account.phone_number || "Not provided"}</p>
                        )}
                    </div>
                </div>

                {/* Gender */}
                <div className="info-item">
                    <div className="icon-box"><MapPin size={20} /></div>
                    <div className="field-content">
                        <label>Gender</label>
                        {isEditing ? (
                            <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : (
                            <p style={{textTransform: 'capitalize'}}>{account.gender}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;