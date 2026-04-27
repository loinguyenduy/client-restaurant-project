import axios from "../utils/axios";

// 1. Lấy danh sách khung giờ trống (Public)
const getAvailableSlotsApi = (date, partySize) => {
    return axios.get(`/reservations/available-slots?date=${date}&partySize=${partySize}`);
};

// 2. Tạo đơn đặt bàn mới (Private - Cần Token)
const createReservationApi = (bookingData) => {
    // bookingData: { date, time, partySize, contact_name, contact_phone, note }
    return axios.post("/reservations/book", bookingData);
};

// 3. Lấy lịch sử đặt bàn của User (Private - Cần Token)
const getUserReservationsApi = () => {
    return axios.get("/reservations/my-reservations");
};

// 4. Hủy đặt bàn (Private - Cần Token)
const cancelReservationApi = (reservationId) => {
    return axios.put(`/reservations/cancel/${reservationId}`);
};

export {
    getAvailableSlotsApi,
    createReservationApi,
    getUserReservationsApi,
    cancelReservationApi
};