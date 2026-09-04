import axios from "../utils/axios";

export const getDashboardStatsApi = () => axios.get('/manage/dashboard-stats');
export const getAnalyticsOverviewApi = (params = {}) => axios.get('/manage/analytics/overview', { params });

export const getAllOrdersAdminApi = (options = {}) => {
    return axios.get('/manage/orders', { params: options });
};
export const getManagedOrderDetailsApi = (orderId) => axios.get(`/manage/orders/${orderId}`);
export const updateOrderStatusApi = (orderId, status) => {
    return axios.put(`/manage/orders/${orderId}/status`, { status });
};
export const updateKitchenBatchStatusApi = (orderId, batchId, status) => axios.put(`/manage/orders/${orderId}/kitchen-batches/${batchId}/status`, { status });
export const getKitchenOrdersApi = () => axios.get('/manage/orders/kitchen');

export const getAllReservationsAdminApi = (options = {}) => axios.get('/manage/reservations', { params: options });
export const getManagedReservationDetailsApi = (reservationId) => axios.get(`/manage/reservations/${reservationId}`);
export const getSuitableReservationTablesApi = (reservationId) => axios.get(`/manage/reservations/${reservationId}/suitable-tables`);
export const assignReservationTableApi = (reservationId, tableId) => axios.put(`/manage/reservations/${reservationId}/table`, { table_id: tableId });
export const seatReservationApi = (reservationId) => axios.post(`/manage/reservations/${reservationId}/seat`);
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
export const getOwnAttendanceHistoryApi = (params = {}) => axios.get('/attendance/history', { params });
export const getAttendanceReportLogsApi = (params = {}) => axios.get('/manage/attendance/logs', { params });
export const getAttendanceOverviewApi = (params = {}) => axios.get('/manage/attendance/overview', { params });
export const getAttendanceSummaryApi = (params = {}) => axios.get('/manage/attendance/summary', { params });

// --- TABLE MANAGEMENT API ---
export const getAllTablesApi = () => axios.get('/manage/tables');
export const getPosTablesApi = () => axios.get('/manage/pos/tables');
export const createTableApi = (tableData) => axios.post('/manage/tables', tableData);
export const updateTableApi = (id, tableData) => axios.put(`/manage/tables/${id}`, tableData);
export const updateTableStatusApi = (id, status) => axios.put(`/manage/tables/${id}/status`, { status });
export const deleteTableApi = (id) => axios.delete(`/manage/tables/${id}`);


export const createPosOrderApi = (data) => {
    return axios.post('/manage/orders/pos', data);
};
export const addDineInItemsApi = (orderId, items) => axios.post(`/manage/orders/${orderId}/items`, { items });
export const checkoutDineInOrderApi = (orderId, paymentMethod) => axios.post(`/manage/orders/${orderId}/checkout`, { payment_method: paymentMethod });

export const getInventoryApi = (params = {}) => axios.get('/manage/inventory', { params });
export const restockProductApi = (productId, data) => axios.post(`/manage/inventory/${productId}/restock`, data);
export const adjustProductStockApi = (productId, data) => axios.post(`/manage/inventory/${productId}/adjust`, data);
export const getStockMovementsApi = (productId, params = {}) => axios.get(`/manage/inventory/${productId}/movements`, { params });
