import axios from "../utils/axios";

export const getDashboardStatsApi = () => axios.get('/manage/dashboard-stats');

export const getAllOrdersAdminApi = (page, limit, status) => {
    return axios.get(`/manage/orders?page=${page}&limit=${limit}&status=${status || 'all'}`);
};
export const updateOrderStatusApi = (orderId, status) => {
    return axios.put(`/manage/orders/${orderId}/status`, { status });
};
export const getKitchenOrdersApi = () => axios.get('/manage/orders/kitchen');

export const getAllReservationsAdminApi = (page, limit, status, date) => {
    return axios.get(`/manage/reservations?page=${page}&limit=${limit}&status=${status || 'all'}&date=${date || ''}`);
};
export const updateReservationStatusApi = (reservationId, status) => {
    return axios.put(`/manage/reservations/${reservationId}/status`, { status });
};

// CATEGORY API
export const getAllCategoriesAdminApi = () => axios.get('/get-categories');
export const createCategoryApi = (name) => axios.post('/create-category', { name });
export const updateCategoryApi = (id, name) => axios.put(`/update-category/${id}`, { name });
export const deleteCategoryApi = (id) => axios.delete(`/delete-category/${id}`);

// PRODUCT API (Dùng FormData vì có upload file)
export const getAllProductsAdminApi = (categoryId = 'all', page = 1, limit = 100) => {
    return axios.get(`/get-all-products?category_id=${categoryId}&page=${page}&limit=${limit}`);
};

export const createProductApi = (formData) => {
    return axios.post('/create-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const updateProductApi = (id, formData) => {
    return axios.put(`/update-product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const deleteProductApi = (id) => axios.delete(`/delete-product/${id}`);

// --- USER MANAGEMENT API ---
export const getAllUsersAdminApi = (page = 1, limit = 10, search = '') => {
    return axios.get(`/users/manage/get-all-users?page=${page}&limit=${limit}&search=${search}`);
};

export const updateUserRoleApi = (userId, role) => {
    return axios.put(`/users/manage/update-role/${userId}`, { role });
};

export const toggleUserStatusApi = (userId) => {
    return axios.put(`/users/manage/toggle-status/${userId}`);
};

// --- ATTENDANCE API (STAFF) ---
export const checkAttendanceStatusApi = () => {
    return axios.get('/attendance/status');
};

export const checkInApi = () => {
    return axios.post('/attendance/check-in');
};

export const checkOutApi = () => {
    return axios.put('/attendance/check-out');
};

export const getAttendanceLogsApi = (page = 1, limit = 20, userId = '') => {
    return axios.get(`/manage/attendance/logs?page=${page}&limit=${limit}&userId=${userId}`);
};

// --- TABLE MANAGEMENT API ---
export const getAllTablesApi = () => axios.get('/manage/tables');
export const createTableApi = (tableData) => axios.post('/manage/tables', tableData);
export const updateTableStatusApi = (id, status) => axios.put(`/manage/tables/${id}/status`, { status });
export const deleteTableApi = (id) => axios.delete(`/manage/tables/${id}`);


export const createPosOrderApi = (data) => {
    return axios.post('/manage/orders/pos', data);
};
