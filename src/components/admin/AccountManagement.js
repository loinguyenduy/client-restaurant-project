import React, { useEffect, useState } from 'react';
import { Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getAllUsersAdminApi, updateUserRoleApi, toggleUserStatusApi } from '../../services/adminService';
import './AdminTable.scss'; 
import './AccountManagement.scss'; 

const AccountManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination & Search States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Xử lý Debounce cho ô Search (Đợi 500ms sau khi ngừng gõ mới cập nhật từ khóa)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1); // Reset về trang 1 khi search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Gọi API mỗi khi page hoặc từ khóa search thay đổi
    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearch]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await getAllUsersAdminApi(currentPage, 10, debouncedSearch);
            if (res && res.EC === 0) {
                setUsers(res.DT.users);
                setTotalPages(res.DT.totalPages);
            } else {
                toast.error(res.EM || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("Server error");
        }
        setIsLoading(false);
    };

    // --- LOGIC ĐỔI TRẠNG THÁI (KHÓA / MỞ KHÓA) ---
    const handleToggleStatus = async (user) => {
        if (user.role === 'admin') {
            toast.warning("Safety protection: Cannot modify Admin accounts.");
            return;
        }

        const actionText = user.is_active ? "Deactivate" : "Activate";
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionText.toLowerCase()} this account?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0F172A',
            confirmButtonText: `Yes, ${actionText}`
        });

        if (isConfirm.isConfirmed) {
            try {
                let res = await toggleUserStatusApi(user.id);
                if (res && res.EC === 0) {
                    toast.success(res.EM);
                    fetchUsers();
                } else toast.error(res.EM);
            } catch (e) { toast.error("Error updating status"); }
        }
    };

    // --- LOGIC ĐỔI QUYỀN (PROMOTE / DEMOTE) ---
    const handleRoleChange = async (user) => {
        if (user.role === 'admin') {
            toast.warning("Cannot modify Admin roles.");
            return;
        }

        const newRole = user.role === 'customer' ? 'staff' : 'customer';
        const actionText = newRole === 'staff' ? "Promote to Staff" : "Demote to User";

        const isConfirm = await Swal.fire({
            title: actionText,
            text: `Change role of ${user.full_name || user.username} to ${newRole.toUpperCase()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0F172A',
            confirmButtonText: 'Yes, proceed'
        });

        if (isConfirm.isConfirmed) {
            try {
                let res = await updateUserRoleApi(user.id, newRole);
                if (res && res.EC === 0) {
                    toast.success("Role updated successfully!");
                    fetchUsers();
                } else toast.error(res.EM);
            } catch (e) { toast.error("Error updating role"); }
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header header-with-search">
                <h1>Account Management</h1>
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>CONTACT INFO</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th className="text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="empty-state"><Loader className="spin" size={24}/></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-name-col">
                                                <div className="avatar-circle">
                                                    {(user.full_name || user.username).charAt(0).toUpperCase()}
                                                </div>
                                                <span className="primary-text">{user.full_name || user.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="primary-text" style={{fontSize: '13px'}}>{user.email}</span>
                                            <span className="secondary-text">{user.phone_number || 'No phone'}</span>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role === 'customer' ? 'USER' : user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {/* Ẩn các nút thao tác nếu tài khoản đó là Admin */}
                                            {user.role !== 'admin' ? (
                                                <div className="action-buttons">
                                                    {user.is_active ? (
                                                        <button className="btn-outline red" onClick={() => handleToggleStatus(user)}>Deactivate</button>
                                                    ) : (
                                                        <button className="btn-outline green" onClick={() => handleToggleStatus(user)}>Activate</button>
                                                    )}
                                                    
                                                    <button className="btn-outline grey" onClick={() => handleRoleChange(user)}>
                                                        {user.role === 'customer' ? 'Promote to Staff' : 'Demote to User'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="protected-text">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        ><ChevronLeft size={18} /></button>
                        
                        <span className="page-info">Page {currentPage} of {totalPages}</span>
                        
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        ><ChevronRight size={18} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountManagement;